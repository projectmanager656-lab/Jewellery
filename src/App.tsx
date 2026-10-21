import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Announcement, Footer, Header } from "./components/SiteChrome";
import { AppointmentForm } from "./components/AppointmentForm";
import { CustomJewelleryStudio } from "./components/CustomJewelleryStudio";
import { ProductDetail } from "./components/ProductDetail";
import { AdminPage } from "./pages/AdminPage";
import { CompareProvider } from "./state/CompareContext";
import { CATEGORIES, PRICE_RANGES, SHOP_CONFIG } from "./config";
import { useCatalogueProducts } from "./hooks/useCatalogueProducts";
import {
  AboutPage,
  CataloguePage,
  ComparePage,
  ContactPage,
  HomePage,
  MatchFinderPage,
  OccasionPage,
  WishlistPage,
} from "./pages/Pages";
import type { CatalogueCategory } from "./types";
import { DEMO_MODE } from "./config/demo";

const WISHLIST_KEY = "shree-jewellers-wishlist";
const RECENT_KEY = "shree-jewellers-recently-viewed";
type SortMode = "featured" | "price-asc" | "price-desc" | "name";

function readStoredList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) &&
      value.every((item) => typeof item === "string")
      ? value
      : [];
  } catch {
    return [];
  }
}

function resolveCategory(value: string | null, categories: Array<{ value: string }>): CatalogueCategory {
  if (!value) return "all";
  return categories.find((item) => item.value.toLowerCase() === value.toLowerCase())?.value ??
    (["featured", "new", "bestseller"].includes(value.toLowerCase()) ? value.toLowerCase() : "all");
}

function StoreApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<CatalogueCategory>("all");
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("featured");
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readStoredList(WISHLIST_KEY),
  );
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    readStoredList(RECENT_KEY),
  );
  const {
    products,
    categories,
    loading: catalogueLoading,
    error: catalogueError,
    refresh: refreshCatalogue,
  } = useCatalogueProducts();

  const categoryOptions = useMemo(() => {
    const fixed = CATEGORIES.filter((item) => ["all", "gold", "diamond"].includes(item.value));
    const source = categories.length
      ? categories.map((item) => ({ label: item.name, value: item.slug }))
      : CATEGORIES.filter((item) => !["all", "gold", "diamond"].includes(item.value));
    const seen = new Set(fixed.map((item) => item.value.toLowerCase()));
    return [...fixed, ...source.filter((item) => {
      const key = item.value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })];
  }, [categories]);

  useEffect(() => {
    if (location.pathname !== "/catalogue") return;
    const queryCategory = searchParams.get("category");
    const querySearch = searchParams.get("q");
    setCategory(resolveCategory(queryCategory, categoryOptions));
    setSearch(querySearch || "");
  }, [categoryOptions, location.pathname, searchParams]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Wishlist remains available for the current page session.
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds));
    } catch {
      // Recently viewed remains available for the current page session.
    }
  }, [recentIds]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const recordRecentlyViewed = useCallback((productId: string) => {
    setRecentIds((current) =>
      [productId, ...current.filter((id) => id !== productId)].slice(0, 8),
    );
  }, []);

  const selectCategory = useCallback(
    (value: CatalogueCategory) => {
      setCategory(value);
      setSearch("");
      navigate(`/catalogue?category=${encodeURIComponent(value)}`);
    },
    [navigate],
  );

  const submitSearch = useCallback(() => {
    navigate(`/catalogue?q=${encodeURIComponent(search.trim())}`);
  }, [navigate, search]);

  const resetFilters = useCallback(() => {
    setCategory("all");
    setPriceRange(PRICE_RANGES[0]);
    setSearch("");
    setSort("featured");
    navigate("/catalogue");
  }, [navigate]);

  const recentlyViewed = recentIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product !== undefined);

  return (
    <>
      <Announcement />
      {DEMO_MODE && (
        <aside className="border-b border-[#dfd0ad] bg-[#fbf7ed] px-4 py-2.5 text-center text-[11px] leading-5 text-[#5e4b29]" role="status">
          <strong>Static demo catalogue.</strong> Product names, images, details, and prices are illustrative only and do not represent verified showroom inventory or current prices.
        </aside>
      )}
      <Header
        categories={categoryOptions}
        category={category}
        search={search}
        wishlistCount={wishlistIds.length}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        onSelectCategory={selectCategory}
      />
      {!DEMO_MODE && catalogueLoading && <p role="status" className="px-4 py-3 text-center text-xs text-[#716a75]">Loading published jewellery…</p>}
      {!DEMO_MODE && catalogueError && (
        <div role="alert" className="border-b border-[#eadfca] bg-[#fbf8f1] px-4 py-4 text-center">
          <p className="font-serif text-base text-[#43224e]">We’re having trouble opening the collection.</p>
          <p className="mt-1 text-xs text-[#716a75]">{catalogueError}</p>
          <button type="button" onClick={() => void refreshCatalogue()} disabled={catalogueLoading} className="mt-3 border border-[#d6c6a0] px-4 py-2 text-[11px] font-medium text-[#43224e] hover:bg-white disabled:opacity-60">
            {catalogueLoading ? "Trying again…" : "Try again"}
          </button>
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              categories={categoryOptions}
              catalogueLoading={catalogueLoading}
              catalogueError={catalogueError}
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
              recentlyViewed={recentlyViewed}
            />
          }
        />
        <Route
          path="/catalogue"
          element={
            <CataloguePage
              categories={categoryOptions}
              products={products}
              category={category}
              priceRange={priceRange}
              search={search}
              sort={sort}
              onCategoryChange={setCategory}
              onPriceRangeChange={setPriceRange}
              onSearchChange={setSearch}
              onSortChange={setSort}
              onReset={resetFilters}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetail
              products={products}
              loading={catalogueLoading}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
              onRecentlyViewed={recordRecentlyViewed}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/occasions/:occasion"
          element={
            <OccasionPage
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/match-finder"
          element={
            <MatchFinderPage
              products={products}
              categories={categoryOptions}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
          }
        />
        <Route path="/compare" element={<ComparePage products={products} />} />
        <Route
          path="/contact"
          element={
            <>
              <ContactPage products={products} />
              <section className="mx-auto grid max-w-[1480px] gap-5 px-4 pb-12 sm:px-7 lg:grid-cols-2 lg:px-12">
                <AppointmentForm />
                <CustomJewelleryStudio />
              </section>
            </>
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/admin"
          element={DEMO_MODE ? (
            <section className="mx-auto my-16 max-w-2xl px-6 text-center">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#92753e]">STATIC DEMO</p>
              <h1 className="mt-3 font-serif text-3xl text-[#43224e]">Admin access is unavailable here</h1>
              <p className="mt-4 text-sm leading-7 text-[#716a75]">The demo uses local illustrative catalogue data. Admin login and management remain protected by the MongoDB backend and are available only when that backend is configured.</p>
            </section>
          ) : <AdminPage onCatalogueChanged={refreshCatalogue} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer categories={categoryOptions} onSelectCategory={selectCategory} />
      {SHOP_CONFIG.whatsapp ? (
        <a
          href={`https://wa.me/${SHOP_CONFIG.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Enquire on WhatsApp"
          className="fixed bottom-5 right-5 z-20 grid size-12 place-items-center rounded-full bg-[#47614d] text-[11px] font-bold tracking-wide text-white shadow-lg transition-transform hover:-translate-y-1"
        >
          WA
        </a>
      ) : (
        <Link
          to="/contact"
          aria-label="Enquire on WhatsApp"
          className="fixed bottom-5 right-5 z-20 grid size-12 place-items-center rounded-full bg-[#47614d] text-[11px] font-bold tracking-wide text-white shadow-lg transition-transform hover:-translate-y-1"
        >
          WA
        </Link>
      )}
    </>
  );
}

export default function App() {
  return (
    <CompareProvider>
      <HashRouter>
        <StoreApp />
      </HashRouter>
    </CompareProvider>
  );
}
