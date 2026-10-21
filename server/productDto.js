const CANONICAL_CATEGORIES = ["Pendants", "Necklaces", "Earrings", "Rings", "Bangles", "Bracelets", "Mangalsutras", "Bridal"];

function categorySlug(raw) {
  const slug = String(raw.slug ?? "");
  return CANONICAL_CATEGORIES.find((name) => name.toLowerCase() === slug.toLowerCase()) ?? slug;
}

export function productToDto(product) {
  const raw = typeof product.toObject === "function" ? product.toObject() : product;
  const category = raw.categoryId && typeof raw.categoryId === "object"
    ? raw.categoryId
    : null;
  const images = [...(raw.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const gallery = images.map((image) => image.url);

  return {
    id: String(raw._id ?? raw.id),
    code: raw.productCode,
    name: raw.name,
    category: category ? categorySlug(category) : "",
    material: raw.material,
    purity: raw.purity,
    weight: raw.weight,
    gemstone: raw.gemstone,
    description: raw.description,
    ...(raw.price == null ? {} : { price: Number(raw.price) }),
    availability: raw.availability,
    image: gallery[0] ?? "",
    gallery,
    featured: raw.isFeatured,
    newArrival: raw.isNewArrival,
    bestseller: raw.isBestseller,
    categoryId: category ? String(category._id) : String(raw.categoryId ?? ""),
    isPublished: raw.isPublished,
    isAvailable: raw.availability,
    currency: raw.currency,
    images: images.map((image) => ({
      id: String(image._id),
      url: image.url,
      altText: image.altText,
      displayOrder: image.displayOrder,
    })),
  };
}

export function categoryToDto(category) {
  const raw = typeof category.toObject === "function" ? category.toObject() : category;
  return {
    id: String(raw._id ?? raw.id),
    slug: categorySlug(raw),
    name: raw.name,
    sortOrder: raw.sortOrder,
  };
}
