import type { Product } from "../types";

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface AdminProduct extends Product {
  categoryId: string;
  isPublished: boolean;
  isAvailable: boolean;
  currency: string;
  images: Array<{ id: string; url: string; altText: string; displayOrder: number }>;
}

export interface ProductDraft {
  categoryId: string;
  code: string;
  name: string;
  description: string;
  price: number | null;
  currency: string;
  material: string;
  purity: string;
  weight: string;
  gemstone: string;
  availability: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
}

export const emptyProductDraft: ProductDraft = {
  categoryId: "", code: "", name: "", description: "", price: null,
  currency: "INR", material: "", purity: "", weight: "", gemstone: "",
  availability: true, isPublished: false, isFeatured: false,
  isNewArrival: false, isBestseller: false,
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api${path}`, { ...init, headers, credentials: "include" });
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const payload = body && typeof body === "object" ? body as { error?: unknown; details?: unknown } : {};
    const message = typeof payload.error === "string" ? payload.error : `Request failed (${response.status}).`;
    throw new ApiError(message, response.status, payload.details);
  }
  return body as T;
}

export async function readPublishedCatalogue(): Promise<Product[]> {
  const limit = 500;
  const first = await apiRequest<{ items: Product[]; total: number }>(`/products?page=1&limit=${limit}`);
  const products = [...first.items];
  const pageCount = Math.ceil(first.total / limit);
  for (let page = 2; page <= pageCount; page += 1) {
    const response = await apiRequest<{ items: Product[] }>(`/products?page=${page}&limit=${limit}`);
    products.push(...response.items);
  }
  return products;
}

export async function readCategories(): Promise<ApiCategory[]> {
  const response = await apiRequest<{ items: ApiCategory[] }>("/categories");
  return response.items;
}

export function productDraftPayload(draft: ProductDraft) {
  return {
    categoryId: draft.categoryId,
    code: draft.code.trim(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    price: draft.price,
    currency: draft.currency,
    material: draft.material.trim(),
    purity: draft.purity.trim(),
    weight: draft.weight.trim(),
    gemstone: draft.gemstone.trim(),
    availability: draft.availability,
    isPublished: draft.isPublished,
    isFeatured: draft.isFeatured,
    isNewArrival: draft.isNewArrival,
    isBestseller: draft.isBestseller,
  };
}
