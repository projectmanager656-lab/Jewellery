import { products } from "./products";
import type { ApiCategory } from "./mongodb-api";

/** Clearly illustrative catalogue data, kept separate from MongoDB inventory. */
export const demoProducts = products.map((product) => ({
  ...product,
  currency: "INR",
  availability: true,
}));

export const demoCategories: ApiCategory[] = Array.from(
  new Set(demoProducts.map((product) => product.category)),
).sort((left, right) => left.localeCompare(right)).map((name, sortOrder) => ({
  id: `demo-category-${sortOrder}`,
  slug: name,
  name,
  sortOrder,
}));
