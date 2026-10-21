import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import { HttpError } from "../errors.js";
import { categoryToDto, productToDto } from "../productDto.js";
import { categorySchema, createProductSchema, mongoIdSchema, updateCategorySchema, updateProductSchema } from "../validation.js";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 12 },
  fileFilter(_req, file, callback) {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) {
      callback(new HttpError(400, "Only JPEG, PNG, WebP, and AVIF images are accepted."));
      return;
    }
    callback(null, true);
  },
});

function validate(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, "Please check the submitted fields.", result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })));
  }
  return result.data;
}

function toProductFields(input) {
  const output = { ...input };
  if (Object.hasOwn(output, "code")) {
    output.productCode = output.code;
    delete output.code;
  }
  return output;
}

function validId(value, label) {
  if (!mongoIdSchema.safeParse(value).success) throw new HttpError(400, `Invalid ${label} identifier.`);
}

export function createAdminRouter({ Product, Category, requireAdmin, storage }) {
  const router = Router();
  router.use(requireAdmin);

  router.get("/products", async (req, res) => {
    const filter = req.query.published === "true" ? { isPublished: true } : {};
    const products = await Product.find(filter)
      .populate("categoryId", "slug name")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: products.map(productToDto) });
  });

  router.post("/products", async (req, res) => {
    const input = validate(createProductSchema, req.body);
    if (!(await Category.exists({ _id: input.categoryId }))) throw new HttpError(400, "Selected category does not exist.");
    const product = new Product(toProductFields(input));
    if (product.isPublished && product.images.length === 0) {
      throw new HttpError(400, "Add at least one image before publishing a product.");
    }
    await product.save();
    await product.populate("categoryId", "slug name");
    res.status(201).json({ product: productToDto(product) });
  });

  router.patch("/products/:id", async (req, res) => {
    validId(req.params.id, "product");
    const input = validate(updateProductSchema, req.body);
    if (input.categoryId && !(await Category.exists({ _id: input.categoryId }))) {
      throw new HttpError(400, "Selected category does not exist.");
    }
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, "Product not found.");
    Object.assign(product, toProductFields(input));
    if (product.isPublished && product.images.length === 0) {
      throw new HttpError(400, "Add at least one image before publishing a product.");
    }
    await product.save();
    await product.populate("categoryId", "slug name");
    res.json({ product: productToDto(product) });
  });

  router.delete("/products/:id", async (req, res) => {
    validId(req.params.id, "product");
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, "Product not found.");
    if (product.images.some((image) => !image.storageKey.startsWith("external:")) && !storage.configured) {
      throw new HttpError(503, "Configure Cloudinary before deleting a product that has stored images.");
    }
    for (const image of product.images) {
      if (image.storageKey && !image.storageKey.startsWith("external:")) await storage.remove(image.storageKey);
    }
    await product.deleteOne();
    res.status(204).end();
  });

  router.post("/products/:id/images", imageUpload.array("images", 12), async (req, res) => {
    validId(req.params.id, "product");
    if (!storage.configured) throw new HttpError(503, "Image storage is not configured on the server.");
    if (!req.files?.length) throw new HttpError(400, "Choose at least one image to upload.");
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, "Product not found.");

    const uploaded = [];
    try {
      for (const file of req.files) {
        const stored = await storage.upload(file, product.id);
        uploaded.push({
          ...stored,
          altText: file.originalname.replace(/\.[^.]+$/, "").slice(0, 240),
          displayOrder: product.images.length + uploaded.length,
        });
      }
      product.images.push(...uploaded);
      await product.save();
      await product.populate("categoryId", "slug name");
      res.status(201).json({ product: productToDto(product) });
    } catch (error) {
      await Promise.allSettled(uploaded.map((image) => storage.remove(image.storageKey)));
      throw error;
    }
  });

  router.delete("/products/:id/images/:imageId", async (req, res) => {
    validId(req.params.id, "product");
    validId(req.params.imageId, "image");
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, "Product not found.");
    const image = product.images.id(req.params.imageId);
    if (!image) throw new HttpError(404, "Product image not found.");
    if (!image.storageKey.startsWith("external:") && !storage.configured) throw new HttpError(503, "Image storage is not configured on the server.");
    if (product.isPublished && product.images.length === 1) {
      throw new HttpError(409, "A published product must retain at least one image. Unpublish it before removing its last image.");
    }
    if (!image.storageKey.startsWith("external:")) await storage.remove(image.storageKey);
    image.deleteOne();
    await product.save();
    await product.populate("categoryId", "slug name");
    res.json({ product: productToDto(product) });
  });

  router.post("/categories", async (req, res) => {
    const input = validate(categorySchema, req.body);
    const category = await Category.create(input);
    res.status(201).json({ category: categoryToDto(category) });
  });

  router.patch("/categories/:id", async (req, res) => {
    validId(req.params.id, "category");
    const input = validate(updateCategorySchema, req.body);
    const category = await Category.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
    if (!category) throw new HttpError(404, "Category not found.");
    res.json({ category: categoryToDto(category) });
  });

  router.delete("/categories/:id", async (req, res) => {
    validId(req.params.id, "category");
    if (await Product.exists({ categoryId: new mongoose.Types.ObjectId(req.params.id) })) {
      throw new HttpError(409, "Move or delete the category's products before deleting this category.");
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new HttpError(404, "Category not found.");
    res.status(204).end();
  });

  return router;
}
