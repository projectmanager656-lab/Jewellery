import type { CategoryOption, PriceRange, ShopConfig } from "./types";

export const SHOP_CONFIG: ShopConfig = {
  name: "Shree Jewellers",
  currency: "INR",
  phone: "",
  whatsapp: "",
  address: "",
  openingHours: "",
  mapEmbedUrl: "",
  instagramUrl: "",
  facebookUrl: "",
};

export const CATEGORIES: CategoryOption[] = [
  { label: "All jewellery", value: "all" },
  { label: "Gold jewellery", value: "gold" },
  { label: "Diamond jewellery", value: "diamond" },
  { label: "Pendants", value: "Pendants" },
  { label: "Necklaces", value: "Necklaces" },
  { label: "Earrings", value: "Earrings" },
  { label: "Rings", value: "Rings" },
  { label: "Bangles", value: "Bangles" },
  { label: "Bracelets", value: "Bracelets" },
  { label: "Mangalsutras", value: "Mangalsutras" },
  { label: "Bridal jewellery", value: "Bridal" },
];

export const PRICE_RANGES: PriceRange[] = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under ₹25,000", min: 0, max: 25000 },
  { label: "₹25,000–₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000–₹1,00,000", min: 50000, max: 100000 },
];
