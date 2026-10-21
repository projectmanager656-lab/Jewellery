import { z } from "zod";

const productShape = {
  categoryId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid category."),
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().max(5000).default(""),
  price: z.number().finite().nonnegative().nullable().default(null),
  currency: z.string().trim().length(3).default("INR"),
  material: z.string().trim().max(180).default(""),
  purity: z.string().trim().max(100).default(""),
  weight: z.string().trim().max(100).default(""),
  gemstone: z.string().trim().max(180).default(""),
  availability: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
};

export const createProductSchema = z.object(productShape).strict();
export const updateProductSchema = z.object(
  Object.fromEntries(
    Object.entries(productShape).map(([key, schema]) => [key, schema.optional()]),
  ),
).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one product field to update.");

export const categorySchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
  name: z.string().trim().min(1).max(120),
  sortOrder: z.number().int().nonnegative().default(0),
}).strict();

export const updateCategorySchema = categorySchema.partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one category field to update.",
);

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
}).strict();

export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
