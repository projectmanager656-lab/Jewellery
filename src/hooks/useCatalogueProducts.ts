import { useCallback, useEffect, useState } from "react";
import { readCategories, readPublishedCatalogue } from "../data/mongodb-api";
import type { ApiCategory } from "../data/mongodb-api";
import type { Product } from "../types";
import { DEMO_MODE } from "../config/demo";
import { demoCategories, demoProducts } from "../data/demo-catalogue";

interface CatalogueState {
  products: Product[];
  categories: ApiCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCatalogueProducts(): CatalogueState {
  const [products, setProducts] = useState<Product[]>(DEMO_MODE ? demoProducts : []);
  const [categories, setCategories] = useState<ApiCategory[]>(DEMO_MODE ? demoCategories : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (DEMO_MODE) {
      setProducts(demoProducts);
      setCategories(demoCategories);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [rows, categoryRows] = await Promise.all([
        readPublishedCatalogue(),
        readCategories(),
      ]);
      setProducts(rows);
      setCategories(categoryRows);
    } catch (cause) {
      setProducts([]);
      setCategories([]);
      console.error("MongoDB catalogue API request failed:", cause);
      setError(cause instanceof Error ? cause.message : "Catalogue request failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { products, categories, loading, error, refresh };
}
