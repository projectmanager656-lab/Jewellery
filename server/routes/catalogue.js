import { Router } from "express";
import { categoryToDto, productToDto } from "../productDto.js";
import { HttpError } from "../errors.js";

const SORTS = {
  featured: { isFeatured: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  name: { name: 1 },
  "price-asc": { __priceIsMissing: 1, price: 1, createdAt: -1 },
  "price-desc": { __priceIsMissing: 1, price: -1, createdAt: -1 },
};

function parseBound(value, name) {
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new HttpError(400, `${name} must be a non-negative number.`);
  return number;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createCatalogueRouter({ Product, Category }) {
  const router = Router();

  router.get("/categories", async (_req, res) => {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ items: categories.map(categoryToDto) });
  });

  router.get("/products", async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page ?? "1", 10) || 1);
    const limit = Math.min(500, Math.max(1, Number.parseInt(req.query.limit ?? "200", 10) || 200));
    const filter = { isPublished: true };

    if (req.query.category) {
      const categorySlug = String(req.query.category).trim();
      if (categorySlug.toLowerCase() === "gold") {
        filter.material = /gold/i;
      } else if (categorySlug.toLowerCase() === "diamond") {
        filter.$and = [{ $or: [{ material: /diamond/i }, { gemstone: /diamond/i }] }];
      } else {
        const category = await Category.findOne({ slug: new RegExp(`^${escapeRegex(categorySlug)}$`, "i") }).select("_id").lean();
        if (!category) return res.json({ items: [], page, limit, total: 0 });
        filter.categoryId = category._id;
      }
    }
    if (req.query.q) {
      const expression = new RegExp(escapeRegex(String(req.query.q).trim().slice(0, 100)), "i");
      filter.$or = [
        { name: expression },
        { productCode: expression },
        { material: expression },
        { gemstone: expression },
        { description: expression },
      ];
    }
    const minPrice = parseBound(req.query.minPrice, "minPrice");
    const maxPrice = parseBound(req.query.maxPrice, "maxPrice");
    if (minPrice !== undefined && maxPrice !== undefined && maxPrice < minPrice) {
      throw new HttpError(400, "maxPrice must be greater than or equal to minPrice.");
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    for (const [param, field] of [["featured", "isFeatured"], ["newArrival", "isNewArrival"], ["bestseller", "isBestseller"]]) {
      if (req.query[param] === "true") filter[field] = true;
    }

    const sortName = String(req.query.sort ?? "featured");
    if (!Object.hasOwn(SORTS, sortName)) throw new HttpError(400, "Unsupported sort order.");
    const pageQuery = sortName.startsWith("price-")
      ? Product.aggregate([
          { $match: filter },
          {
            $addFields: {
              __priceIsMissing: {
                $cond: [{ $eq: [{ $ifNull: ["$price", null] }, null] }, 1, 0],
              },
            },
          },
          { $sort: SORTS[sortName] },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: Category.collection.name,
              localField: "categoryId",
              foreignField: "_id",
              as: "__category",
            },
          },
          { $unwind: { path: "$__category", preserveNullAndEmptyArrays: true } },
          { $addFields: { categoryId: "$__category" } },
          { $project: { __category: 0, __priceIsMissing: 0 } },
        ])
      : Product.find(filter)
          .populate("categoryId", "slug name")
          .sort(SORTS[sortName])
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
    const [total, products] = await Promise.all([Product.countDocuments(filter), pageQuery]);
    res.json({ items: products.map(productToDto), page, limit, total });
  });

  router.get("/products/:id", async (req, res) => {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw new HttpError(400, "Invalid product identifier.");
    const product = await Product.findOne({ _id: req.params.id, isPublished: true })
      .populate("categoryId", "slug name")
      .lean();
    if (!product) throw new HttpError(404, "Product not found.");
    res.json({ product: productToDto(product) });
  });

  return router;
}
