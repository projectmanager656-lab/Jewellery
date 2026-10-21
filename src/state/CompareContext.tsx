import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "shree-jewellers-comparison";
const MAX_COMPARE_ITEMS = 3;

interface CompareContextValue {
  compareIds: string[];
  canAddMore: boolean;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function readCompareIds(): string[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    );
    return Array.isArray(stored)
      ? stored
          .filter((item): item is string => typeof item === "string")
          .slice(0, MAX_COMPARE_ITEMS)
      : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>(readCompareIds);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
    } catch {
      // Keep comparison available for this tab if storage is unavailable.
    }
  }, [compareIds]);

  const toggleCompare = useCallback((productId: string) => {
    setCompareIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      if (current.length >= MAX_COMPARE_ITEMS) return current;
      return [...current, productId];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        canAddMore: compareIds.length < MAX_COMPARE_ITEMS,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context)
    throw new Error("useCompare must be used inside CompareProvider");
  return context;
}
