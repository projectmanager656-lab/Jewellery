import { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  Heart,
  Scale,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { PRICE_RANGES } from "../config";
import type { CategoryOption } from "../types";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "../utils/formatPrice";
import type { CatalogueCategory, PriceRange, Product } from "../types";
import { useCompare } from "../state/CompareContext";

type SortMode = "featured" | "price-asc" | "price-desc" | "name";

interface FilterPanelProps {
  categories: CategoryOption[];
  category: CatalogueCategory;
  setCategory: (category: CatalogueCategory) => void;
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
  radioGroupName: string;
  close?: () => void;
}

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

interface CatalogueProps {
  categories: CategoryOption[];
  products: Product[];
  category: CatalogueCategory;
  setCategory: (category: CatalogueCategory) => void;
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
  sort: SortMode;
  setSort: (sort: SortMode) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
}

interface ProductGridProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
}

function FilterPanel({
  categories,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  radioGroupName,
  close,
}: FilterPanelProps) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-[#2a252c]">Refine selection</h2>
        {close && (
          <button
            type="button"
            onClick={close}
            aria-label="Close filters"
            className="grid size-9 place-items-center text-[#514c53]"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <section aria-labelledby={`${radioGroupName}-category`}>
        <h3
          id={`${radioGroupName}-category`}
          className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-[#77717a]"
        >
          CATEGORY
        </h3>
        <div className="flex flex-col gap-1">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setCategory(item.value);
                close?.();
              }}
              className={`flex items-center justify-between px-2 py-2.5 text-left text-xs transition-colors ${category === item.value ? "bg-[#f3eff5] font-medium text-[#43224e]" : "text-[#514c53] hover:bg-[#faf8fb]"}`}
            >
              {item.label}
              {category === item.value && (
                <Check size={14} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </section>
      <fieldset>
        <legend className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-[#77717a]">
          PRICE RANGE
        </legend>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.label}
              className="flex min-h-10 cursor-pointer items-center gap-3 px-2 text-xs text-[#514c53] hover:bg-[#faf8fb]"
            >
              <input
                type="radio"
                name={radioGroupName}
                checked={priceRange.label === range.label}
                onChange={() => setPriceRange(range)}
                className="size-3.5 accent-[#43224e]"
              />
              {range.label}
            </label>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-5 text-[#8b858d]">
          Please confirm current pricing with the showroom.
        </p>
      </fieldset>
    </div>
  );
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const { compareIds, canAddMore, toggleCompare } = useCompare();
  const isCompared = compareIds.includes(product.id);

  return (
    <article className="group min-w-0">
      <div className="product-image relative overflow-hidden bg-[#f5f2f5]">
        <Link
          to={`/product/${product.id}`}
          aria-label={`View details for ${product.name}`}
          className="block size-full"
        >
          <ProductImage
            src={product.image}
            alt={`${product.name}, ${product.material}`}
            className="size-full"
            imageClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
          <span className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-between bg-[#43224e]/95 px-4 py-3 text-[11px] text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
            View details <ArrowRight size={15} />
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-[#4a2c55] shadow-sm hover:bg-white"
        >
          <Heart
            size={17}
            fill={isWishlisted ? "currentColor" : "none"}
            strokeWidth={1.7}
          />
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          aria-label={`${isCompared ? "Remove from" : "Add to"} comparison: ${product.name}`}
          aria-pressed={isCompared}
          disabled={!isCompared && !canAddMore}
          className="absolute left-3 top-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/95 px-2.5 text-[9px] text-[#4a2c55] shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Scale size={14} /> Compare
        </button>
        {product.availability === false && (
          <span className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1.5 text-[9px] text-[#665e69]">
            Currently unavailable
          </span>
        )}
      </div>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${product.id}`}
            className="font-serif text-[16px] leading-5 text-[#28242b] hover:text-[#43224e]"
          >
            {product.name}
          </Link>
          <span className="shrink-0 text-[9px] text-[#817a84]">
            {product.category}
          </span>
        </div>
        <p className="mt-1.5 text-[10px] text-[#77717a]">{product.material}</p>
        <p className="mt-1 text-[9px] text-[#968e99]">Code {product.code}</p>
        <div className="mt-2 flex items-center gap-2">
          {product.price === undefined ? (
            <span className="text-xs text-[#5e5662]">Price on enquiry</span>
          ) : (
            <>
              <span className="text-xs font-medium text-[#3c3540]">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          )}
        </div>
        <Link
          to={`/product/${product.id}`}
          className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#43224e] underline decoration-[#d8c6a1] underline-offset-4 hover:text-[#72567c]"
        >
          View details <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  wishlistIds,
  onToggleWishlist,
}: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="border-y border-[#e8e4e9] py-20 text-center">
        <p className="font-serif text-2xl text-[#29242b]">
          No pieces in this selection
        </p>
        <p className="mt-2 text-xs text-[#79737c]">
          Try a different category or price range.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds.includes(product.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}

export function Catalogue({
  categories,
  products,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sort,
  setSort,
  wishlistIds,
  onToggleWishlist,
}: CatalogueProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { compareIds } = useCompare();
  const changeSort = (event: ChangeEvent<HTMLSelectElement>) =>
    setSort(event.currentTarget.value as SortMode);
  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setMobileFiltersOpen(false);
  };

  return (
    <section
      id="catalogue"
      className="mx-auto max-w-[1480px] scroll-mt-32 px-4 pb-16 pt-8 sm:px-7 lg:px-12 lg:pt-12"
    >
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#e8e4e9] pb-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-[#846a8e]">
            SHREE JEWELLERS · COLLECTION
          </p>
          <h1 className="font-serif text-4xl leading-tight text-[#29242b] sm:text-[42px]">
            Jewellery to keep close
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-5 text-[#79737c]">
            Explore gold, diamond and occasion jewellery. Ask the showroom
            to confirm current details and availability.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex h-10 items-center gap-2 border border-[#ded9df] px-3 text-xs text-[#43224e] md:hidden"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
          <label className="flex h-10 items-center gap-2 border border-[#ded9df] px-3 text-xs text-[#514c53]">
            <ArrowDownUp size={14} aria-hidden="true" />
            <span className="sr-only">Sort jewellery</span>
            <select
              value={sort}
              onChange={changeSort}
              className="max-w-40 bg-transparent outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
      </div>
      <div className="flex gap-8 xl:gap-12">
        <aside
          className="hidden w-[220px] shrink-0 border-r border-[#ebe7ec] pr-6 md:block lg:w-[245px]"
          aria-label="Product filters"
        >
          <FilterPanel
            categories={categories}
            category={category}
            setCategory={setCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            radioGroupName="desktop-price-range"
          />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-[#79737c]" aria-live="polite">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Featured", value: "featured" },
                { label: "New arrivals", value: "new" },
                { label: "Bestsellers", value: "bestseller" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value as CatalogueCategory)}
                  aria-pressed={category === item.value}
                  className={`rounded-full px-3 py-1.5 text-[10px] transition-colors ${category === item.value ? "bg-[#43224e] text-white" : "bg-[#f4f1f5] text-[#5e5263] hover:bg-[#ebe5ee]"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Link
              to="/compare"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-[#43224e] underline decoration-[#d8c6a1] underline-offset-4"
            >
              Compare ({compareIds.length}/3) <ArrowRight size={13} />
            </Link>
          </div>
          <ProductGrid
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      </div>
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/35 md:hidden"
          role="presentation"
          onMouseDown={closeFromBackdrop}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="h-full w-[min(88vw,360px)] overflow-y-auto bg-white p-5 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <FilterPanel
              categories={categories}
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              radioGroupName="mobile-price-range"
              close={() => setMobileFiltersOpen(false)}
            />
          </aside>
        </div>
      )}
    </section>
  );
}
