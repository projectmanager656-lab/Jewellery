import { readFile } from "node:fs/promises";
import { transform } from "esbuild";
import { assertRuntimeConfig } from "../config.js";
import { connectDatabase } from "../db.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

async function loadExistingSampleData() {
  const source = await readFile(new URL("../../src/data/products.ts", import.meta.url), "utf8");
  const compiled = (await transform(source, { loader: "ts", format: "esm", target: "es2022" }))
    .code.replace('import { SHOP_CONFIG } from "../config";', 'const SHOP_CONFIG = { currency: "INR" };');
  const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  return module.products;
}

const apply = process.argv.includes("--apply");
let connected = false;
try {
  const products = await loadExistingSampleData();
  const categories = [...new Set(products.map((product) => product.category))];
  console.log(`Found ${products.length} existing illustrative sample products across ${categories.length} categories.`);
  console.log("All imported records will be unpublished drafts. Existing products with matching codes will be left unchanged.");
  if (!apply) {
    console.log("Dry run only; no database connection or writes were made. Run with --apply to import into the configured Atlas database.");
  } else {
    assertRuntimeConfig();
    await connectDatabase();
    connected = true;
    const categoryIds = new Map();
    for (const [sortOrder, slug] of categories.entries()) {
      const category = await Category.findOneAndUpdate(
        { slug },
        { $setOnInsert: { slug, name: slug, sortOrder } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      categoryIds.set(slug, category._id);
    }

    let inserted = 0;
    for (const product of products) {
      const images = product.gallery.map((url, displayOrder) => ({
        url,
        storageKey: `external:${url}`,
        altText: `${product.name} sample image`,
        displayOrder,
      }));
      const result = await Product.updateOne(
        { productCode: product.code },
        { $setOnInsert: {
          categoryId: categoryIds.get(product.category),
          productCode: product.code,
          name: product.name,
          description: product.description,
          price: product.price ?? null,
          currency: "INR",
          material: product.material,
          purity: product.purity,
          weight: product.weight,
          gemstone: product.gemstone,
          availability: product.availability !== false,
          isPublished: false,
          isFeatured: Boolean(product.featured),
          isNewArrival: Boolean(product.newArrival),
          isBestseller: Boolean(product.bestseller),
          images,
        } },
        { upsert: true, setDefaultsOnInsert: true },
      );
      if (result.upsertedCount) inserted += 1;
    }
    console.log(`Import complete: added ${inserted} drafts; matching existing product codes were preserved.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Sample import failed.");
  process.exitCode = 1;
} finally {
  if (connected) {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}
