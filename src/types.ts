export type CatalogueCategory = string;

export type ProductCategory = string;

export interface CategoryOption {
  label: string;
  value: CatalogueCategory;
}

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  material: string;
  weight: string;
  purity: string;
  gemstone: string;
  description: string;
  price?: number;
  currency?: string;
  availability?: boolean;
  image: string;
  gallery: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
}

export interface ShopConfig {
  name: string;
  currency: string;
  phone: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  mapEmbedUrl: string;
  instagramUrl: string;
  facebookUrl: string;
}
