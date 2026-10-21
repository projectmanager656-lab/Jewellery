import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Catalogue, ProductCard, ProductGrid } from "../components/Catalogue";
import { EnquiryForm } from "../components/EnquiryForm";
import { formatPrice } from "../utils/formatPrice";
import { PRICE_RANGES } from "../config";
import { SHOP_CONFIG } from "../config";
import type { CatalogueCategory, PriceRange, Product } from "../types";
import type { ProductCategory } from "../types";
import type { CategoryOption } from "../types";
import { useCompare } from "../state/CompareContext";

type SortMode = "featured" | "price-asc" | "price-desc" | "name";

interface SharedProductProps {
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
}

interface HomePageProps extends SharedProductProps {
  categories: CategoryOption[];
  catalogueLoading: boolean;
  catalogueError: string | null;
  products: Product[];
  recentlyViewed: Product[];
}

interface CataloguePageProps extends SharedProductProps {
  categories: CategoryOption[];
  products: Product[];
  category: CatalogueCategory;
  priceRange: PriceRange;
  search: string;
  sort: SortMode;
  onCategoryChange: (category: CatalogueCategory) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: SortMode) => void;
  onReset: () => void;
}

interface ProductSectionProps extends SharedProductProps {
  eyebrow: string;
  title: string;
  products: Product[];
  link: string;
  muted?: boolean;
}

type OccasionSlug =
  "wedding" | "engagement" | "festival" | "daily-wear" | "gifting";

const OCCASIONS: {
  slug: OccasionSlug;
  title: string;
  description: string;
  image: string;
  categories: ProductCategory[];
}[] = [
  {
    slug: "wedding",
    title: "Wedding",
    description: "Bridal and occasion categories",
    image: "photo-1599643478518-a784e5dc4c8f",
    categories: ["Bridal", "Bangles", "Mangalsutras"],
  },
  {
    slug: "engagement",
    title: "Engagement",
    description: "Rings and diamond pieces",
    image: "photo-1605100804763-247f67b3557e",
    categories: ["Rings", "Pendants", "Necklaces"],
  },
  {
    slug: "festival",
    title: "Festival",
    description: "Gold and celebration styles",
    image: "photo-1611652022419-a9419f74343d",
    categories: ["Bangles", "Earrings", "Mangalsutras", "Bridal"],
  },
  {
    slug: "daily-wear",
    title: "Daily Wear",
    description: "Pendants, chains and easy-to-layer pieces",
    image: "photo-1611591437281-460bfbe1220a",
    categories: ["Pendants", "Necklaces", "Bracelets", "Earrings"],
  },
  {
    slug: "gifting",
    title: "Gifting",
    description: "A small edit of keepsake styles",
    image: "photo-1535632066927-ab7c9ab60908",
    categories: ["Pendants", "Earrings", "Rings", "Bracelets"],
  },
];

export function HomePage({
  categories,
  catalogueLoading,
  catalogueError,
  products,
  wishlistIds,
  onToggleWishlist,
  recentlyViewed,
}: HomePageProps) {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const arrivals = products.filter((product) => product.newArrival).slice(0, 4);
  const popular = products.filter((product) => product.bestseller).slice(0, 4);

  return (
    <main>
      <section className="relative isolate mx-auto grid max-w-[1600px] overflow-hidden bg-[#f7f3f0] lg:min-h-[640px] lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-20 lg:py-20">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.2em] text-[#846a8e]">
            THE SHREE JEWELLERS EDIT
          </p>
          <h1 className="max-w-2xl font-serif text-[42px] leading-[1.06] text-[#29242b] sm:text-[64px] lg:text-[76px]">
            A little light,
            <br />
            to keep <em className="font-normal text-[#765d80]">close.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#716a75]">
            Discover gold, diamond and occasion jewellery. Browse at your own
            pace, then speak directly with the showroom about any piece.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/catalogue"
              className="inline-flex min-h-12 items-center gap-3 bg-[#43224e] px-6 text-xs font-medium text-white transition-colors hover:bg-[#5b3b66]"
            >
              Explore collection <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 border-b border-[#d6c6a0] pb-1 text-xs text-[#43224e]"
            >
              Our story <ArrowRight size={14} />
            </Link>
            <Link
              to="/match-finder"
              className="inline-flex items-center gap-2 border-b border-[#d6c6a0] pb-1 text-xs text-[#43224e]"
            >
              Find a match <Sparkles size={14} />
            </Link>
          </div>
          <p className="mt-12 flex items-center gap-2 text-[9px] tracking-[0.15em] text-[#827a85]">
            <span className="h-px w-9 bg-[#b39867]" />
            DIRECT SHOWROOM ENQUIRIES
          </p>
        </div>
        <div className="relative min-h-[320px] lg:min-h-[650px]">
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=90"
            alt="Gold jewellery photographed in soft, natural light"
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3f0]/25 via-transparent to-black/15 lg:from-[#f7f3f0]/35" />
          <div className="absolute bottom-5 left-5 right-5 flex justify-between border-t border-white/60 pt-3 text-[9px] tracking-[0.15em] text-white drop-shadow sm:bottom-8 sm:left-10 sm:right-10">
            SHREE JEWELLERS <span>GOLD · DIAMOND · OCCASION</span>
          </div>
        </div>
      </section>

      {!catalogueLoading && !catalogueError && products.length === 0 && <section className="mx-auto max-w-[1480px] px-4 pt-10 sm:px-7 lg:px-12">
        <div className="border border-[#e8e2ea] bg-[#faf8fb] px-5 py-6 sm:flex sm:items-center sm:justify-between sm:px-8">
          <div><h2 className="font-serif text-2xl text-[#29242b]">No jewellery is listed online right now</h2><p className="mt-2 text-xs leading-5 text-[#716a75]">Please contact the showroom for current pieces and availability.</p></div>
          <Link to="/contact" className="mt-4 inline-flex min-h-10 items-center border border-[#d8c6a1] px-4 text-xs text-[#43224e] sm:mt-0">Contact the showroom</Link>
        </div>
      </section>}

      <section className="border-y border-[#ebe6ed] bg-white">
        <div className="mx-auto grid max-w-[1480px] divide-y divide-[#ebe6ed] px-6 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-12">
          <TrustItem
            icon={MessageCircle}
            title="Talk to the showroom"
            detail="Questions are welcome"
          />
          <TrustItem
            icon={Sparkles}
            title="Explore at your pace"
            detail="Explore the jewellery collection"
          />
          <TrustItem
            icon={Phone}
            title="Enquire directly"
            detail="A direct showroom conversation"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-14 sm:px-7 lg:px-12 lg:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
              BROWSE BY MOOD
            </p>
            <h2 className="font-serif text-3xl text-[#29242b]">
              A place to begin
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="hidden items-center gap-1 text-[11px] text-[#43224e] sm:inline-flex"
          >
            All categories <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.filter((item) => item.value !== "all").slice(0, 4).map((item) => {
            const photos: Record<string, string> = {
              gold: "photo-1611591437281-460bfbe1220a",
              diamond: "photo-1535632066927-ab7c9ab60908",
              pendants: "photo-1599643478518-a784e5dc4c8f",
              bridal: "photo-1617038220319-276d3cfab638",
              earrings: "photo-1535632066927-ab7c9ab60908",
              rings: "photo-1605100804763-247f67b3557e",
              bangles: "photo-1611652022419-a9419f74343d",
            };
            const photo = photos[item.value.toLowerCase()] || "photo-1515562141207-7a88fb7ce338";
            return (
            <Link
              key={item.value}
              to={`/catalogue?category=${encodeURIComponent(item.value)}`}
              className="group relative aspect-[0.88] overflow-hidden bg-[#f4f0f5]"
            >
              <img
                src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=700&q=80`}
                alt={`${item.label} jewellery collection`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-12 font-serif text-lg text-white">
                {item.label}
                <ArrowUpRight size={15} className="ml-2 inline" />
              </span>
            </Link>
          );})}
        </div>
      </section>

      <section className="border-y border-[#ebe6ed] bg-[#faf8fb]">
        <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-7 lg:px-12">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
                OCCASION EDITS
              </p>
              <h2 className="font-serif text-3xl text-[#29242b]">
                Jewellery for the moment
              </h2>
            </div>
            <Link
              to="/match-finder"
              className="inline-flex items-center gap-1 text-[10px] text-[#43224e]"
            >
              Jewellery match finder <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {OCCASIONS.map((occasion) => (
              <Link
                key={occasion.slug}
                to={`/occasions/${occasion.slug}`}
                className="group relative aspect-[0.9] overflow-hidden bg-[#f1edf3]"
              >
                <img
                  src={`https://images.unsplash.com/${occasion.image}?auto=format&fit=crop&w=650&q=80`}
                  alt={`${occasion.title} jewellery collection`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-4 pt-12 text-white">
                  <strong className="font-serif text-lg font-normal">
                    {occasion.title}
                  </strong>
                  <span className="mt-1 block text-[9px] text-white/80">
                    Explore edit{" "}
                    <ArrowUpRight size={12} className="ml-1 inline" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {products.length > 0 && <>
      <ProductSection
        eyebrow="THE SHREE EDIT"
        title="Featured jewellery"
        products={featured}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        link="/catalogue?category=featured"
      />
      <ProductSection
        eyebrow="FRESH FINDS"
        title="New arrivals"
        products={arrivals}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        link="/catalogue?category=new"
        muted
      />
      <ProductSection
        eyebrow="POPULAR PIECES"
        title="Bestsellers"
        products={popular}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        link="/catalogue?category=bestseller"
      />
      </>}

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-7 lg:px-12">
          <div className="mb-6">
            <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
              PICK UP WHERE YOU LEFT OFF
            </p>
            <h2 className="font-serif text-3xl text-[#29242b]">
              Recently viewed
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4 sm:gap-x-5">
            {recentlyViewed.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function TrustItem({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 py-4 sm:px-5">
      <span className="grid size-9 place-items-center rounded-full bg-[#f4eff6] text-[#654c70]">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs font-medium text-[#392e3f]">{title}</p>
        <p className="mt-1 text-[10px] text-[#817985]">{detail}</p>
      </div>
    </div>
  );
}

function ProductSection({
  eyebrow,
  title,
  products,
  wishlistIds,
  onToggleWishlist,
  link,
  muted = false,
}: ProductSectionProps) {
  return (
    <section
      className={`border-y border-[#ebe6ed] ${muted ? "bg-[#faf8fb]" : "bg-white"}`}
    >
      <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-7 lg:px-12">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
              {eyebrow}
            </p>
            <h2 className="font-serif text-3xl text-[#29242b]">{title}</h2>
          </div>
          <Link
            to={link}
            className="inline-flex shrink-0 items-center gap-1 text-[10px] text-[#43224e]"
          >
            View edit <ArrowRight size={14} />
          </Link>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4 sm:gap-x-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <p className="py-6 text-sm text-[#77717a]">
            The collection is being updated. Contact the showroom for current pieces.
          </p>
        )}
      </div>
    </section>
  );
}

export function CataloguePage({
  categories,
  products,
  category,
  priceRange,
  search,
  sort,
  onCategoryChange,
  onPriceRangeChange,
  onSearchChange,
  onSortChange,
  onReset,
  wishlistIds,
  onToggleWishlist,
}: CataloguePageProps) {
  const normalizedSearch = search.trim().toLowerCase();
  let filtered = products.filter((product) => {
    const matchesCategory =
      category === "all" ||
      (category === "gold" && /gold/i.test(product.material)) ||
      (category === "diamond" &&
        /diamond/i.test(`${product.material} ${product.gemstone}`)) ||
      (category === "featured" && product.featured) ||
      (category === "new" && product.newArrival) ||
      (category === "bestseller" && product.bestseller) ||
      product.category === category;
    const matchesPrice =
      product.price === undefined
        ? priceRange.min === 0 && priceRange.max === Infinity
        : product.price >= priceRange.min && product.price < priceRange.max;
    const searchable =
      `${product.name} ${product.code} ${product.category} ${product.material} ${product.gemstone}`.toLowerCase();
    return (
      matchesCategory && matchesPrice && searchable.includes(normalizedSearch)
    );
  });
  if (sort === "price-asc")
    filtered = [...filtered].sort(
      (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    );
  if (sort === "price-desc")
    filtered = [...filtered].sort(
      (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
    );
  if (sort === "featured")
    filtered = [...filtered].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
  if (sort === "name")
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main>
      <section className="mx-auto max-w-[1480px] px-4 pt-7 sm:px-7 lg:px-12">
        <div className="mb-3 flex items-center gap-2 text-[10px] text-[#89828c]">
          <Link to="/" className="hover:text-[#43224e]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#43224e]">
            {categories.find((item) => item.value === category)?.label ||
              "All jewellery"}
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#eeeaf0] pb-5">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">
              SHREE JEWELLERS CATALOGUE
            </p>
            <h1 className="mt-2 font-serif text-3xl text-[#29242b] sm:text-4xl">
              Jewellery collection
            </h1>
          </div>
          <p className="max-w-md text-xs leading-5 text-[#79737c]">
            Browse the pieces currently listed by the showroom. Contact us to
            confirm details and availability.
          </p>
        </div>
        <div className="category-scroll -mx-4 flex gap-2 overflow-x-auto px-4 py-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {[
            { label: "Featured", value: "featured" as const },
            { label: "New arrivals", value: "new" as const },
            { label: "Popular", value: "bestseller" as const },
            ...categories,
          ].map((item) => (
            <button
              key={`${item.value}-${item.label}`}
              type="button"
              onClick={() => onCategoryChange(item.value)}
              aria-pressed={category === item.value}
              className={`shrink-0 border px-3.5 py-2 text-[10px] transition-colors ${category === item.value ? "border-[#43224e] bg-[#43224e] text-white" : "border-[#e5e0e7] bg-white text-[#5c5560] hover:border-[#b8a9bd] hover:text-[#43224e]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="mb-5 flex h-10 max-w-sm items-center gap-2 border-b border-[#ded9df] px-2 text-[#756c78] focus-within:border-[#43224e]">
          <span className="sr-only">Search catalogue</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder="Search name, code, material"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#958e99]"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </label>
      </section>
      <Catalogue
        categories={categories}
        products={filtered}
        category={category}
        setCategory={onCategoryChange}
        priceRange={priceRange}
        setPriceRange={onPriceRangeChange}
        sort={sort}
        setSort={onSortChange}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
      />
      <section className="mx-auto max-w-[1480px] px-4 pb-12 sm:px-7 lg:px-12">
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-[#43224e] underline underline-offset-4"
        >
          Clear filters and search
        </button>
      </section>
    </main>
  );
}

export function WishlistPage({
  products,
  wishlistIds,
  onToggleWishlist,
}: SharedProductProps & { products: Product[] }) {
  const [copyMessage, setCopyMessage] = useState("");
  const savedProducts = products.filter((product) =>
    wishlistIds.includes(product.id),
  );
  const shareMessage = `My Shree Jewellers saved collection:\n${savedProducts
    .map(
      (product) =>
        `${product.name} (${product.code}): ${window.location.origin}${window.location.pathname}#/product/${product.id}`,
    )
    .join("\n")}`;

  async function copyCollection() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopyMessage("Collection links copied.");
    } catch {
      setCopyMessage(
        "Copy is unavailable in this browser. Use the WhatsApp share instead.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-12 sm:px-7 lg:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
            SAVED ON THIS DEVICE
          </p>
          <h1 className="font-serif text-4xl text-[#29242b]">
            My Jewellery Box
          </h1>
          <p className="mt-2 text-xs text-[#79737c]">
            Your saved pieces stay in this browser; no login is needed.
          </p>
        </div>
        {savedProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 border border-[#d8c6a1] px-4 text-xs text-[#43224e] hover:bg-[#faf7f0]"
            >
              <Share2 size={15} /> Share collection on WhatsApp
            </a>
            <button
              type="button"
              onClick={copyCollection}
              className="inline-flex min-h-10 items-center gap-2 text-xs text-[#43224e] underline underline-offset-4"
            >
              {copyMessage ? <Check size={14} /> : <Copy size={14} />}
              {copyMessage ? "Copied" : "Copy links"}
            </button>
            {copyMessage && (
              <span role="status" className="sr-only">
                {copyMessage}
              </span>
            )}
          </div>
        )}
      </div>
      {savedProducts.length ? (
        <ProductGrid
          products={savedProducts}
          wishlistIds={wishlistIds}
          onToggleWishlist={onToggleWishlist}
        />
      ) : (
        <div className="border-y border-[#e8e4e9] py-16 text-center">
          <p className="font-serif text-2xl text-[#29242b]">
            Your jewellery box is ready to fill.
          </p>
          <p className="mt-2 text-xs text-[#79737c]">
            Save pieces as you browse, then come back to compare them.
          </p>
          <Link
            to="/catalogue"
            className="mt-5 inline-flex items-center gap-2 text-xs text-[#43224e] underline underline-offset-4"
          >
            Explore jewellery <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </main>
  );
}

export function ComparePage({
  products,
}: {
  products: Product[];
}) {
  const { compareIds, toggleCompare, clearCompare } = useCompare();
  const compared = compareIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined);

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-12 sm:px-7 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
            SIDE-BY-SIDE DETAILS
          </p>
          <h1 className="font-serif text-4xl text-[#29242b]">
            Compare jewellery
          </h1>
          <p className="mt-2 text-xs text-[#79737c]">
            Compare up to three pieces. Confirm specifications and prices with
            the showroom.
          </p>
        </div>
        {compared.length > 0 && (
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex min-h-10 items-center gap-2 text-xs text-[#43224e] underline underline-offset-4"
          >
            <X size={14} /> Clear comparison
          </button>
        )}
      </div>
      {compared.length === 0 ? (
        <div className="mt-10 border-y border-[#e8e4e9] py-16 text-center">
          <Scale size={22} className="mx-auto text-[#80668b]" />
          <p className="mt-4 font-serif text-2xl text-[#29242b]">
            Choose up to three pieces to compare.
          </p>
          <Link
            to="/catalogue"
            className="mt-5 inline-flex items-center gap-2 text-xs text-[#43224e] underline underline-offset-4"
          >
            Browse catalogue <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-9 overflow-x-auto border border-[#e8e2ea]">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-40 bg-[#f7f4f8] p-4 text-[10px] font-semibold uppercase tracking-wide text-[#6c6470]"
                >
                  Product details
                </th>
                {compared.map((product) => (
                  <th
                    key={product.id}
                    scope="col"
                    className="min-w-52 border-l border-[#e8e2ea] p-4 align-top"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="font-serif text-lg text-[#43224e] hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[10px] text-[#817a84]">
                      Code {product.code}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleCompare(product.id)}
                      className="mt-3 text-[10px] text-[#756c78] underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Price",
                  getValue: (product: Product) =>
                    product.price === undefined
                      ? "Price on enquiry"
                      : formatPrice(product.price, product.currency),
                },
                {
                  label: "Category",
                  getValue: (product: Product) => product.category,
                },
                {
                  label: "Material",
                  getValue: (product: Product) => product.material,
                },
                {
                  label: "Purity",
                  getValue: (product: Product) =>
                    product.purity || "Not provided",
                },
                {
                  label: "Approx. weight",
                  getValue: (product: Product) =>
                    product.weight || "Not provided",
                },
                {
                  label: "Gemstone",
                  getValue: (product: Product) =>
                    product.gemstone || "Not provided",
                },
              ].map((row) => (
                <tr key={row.label} className="border-t border-[#e8e2ea]">
                  <th
                    scope="row"
                    className="bg-[#faf8fb] p-4 text-[10px] font-medium text-[#6c6470]"
                  >
                    {row.label}
                  </th>
                  {compared.map((product) => (
                    <td
                      key={product.id}
                      className="border-l border-[#e8e2ea] p-4 text-[#39333d]"
                    >
                      {row.getValue(product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export function OccasionPage({
  products,
  wishlistIds,
  onToggleWishlist,
}: SharedProductProps & { products: Product[] }) {
  const { occasion: slug } = useParams<{ occasion: string }>();
  const occasion = OCCASIONS.find((item) => item.slug === slug);

  if (!occasion) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-serif text-3xl">
          This occasion edit is not available.
        </h1>
        <Link
          to="/"
          className="mt-5 inline-block text-sm text-[#43224e] underline underline-offset-4"
        >
          Back to Shree Jewellers
        </Link>
      </main>
    );
  }

  const occasionProducts = products.filter((product) =>
    occasion.categories.includes(product.category),
  );

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-10 sm:px-7 lg:px-12">
      <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
        OCCASION EDIT · SAMPLE CATEGORY GROUPING
      </p>
      <h1 className="font-serif text-4xl text-[#29242b]">
        {occasion.title} jewellery
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#716a75]">
        {occasion.description}. This edit groups existing catalogue categories;
        it does not imply an item is reserved for an occasion.
      </p>
      <div className="mt-8">
        <ProductGrid
          products={occasionProducts}
          wishlistIds={wishlistIds}
          onToggleWishlist={onToggleWishlist}
        />
      </div>
    </main>
  );
}

export function MatchFinderPage({
  products,
  categories,
  wishlistIds,
  onToggleWishlist,
}: SharedProductProps & { products: Product[]; categories: CategoryOption[] }) {
  const [occasion, setOccasion] = useState("");
  const [budgetLabel, setBudgetLabel] = useState(PRICE_RANGES[0].label);
  const [jewelleryType, setJewelleryType] = useState<CatalogueCategory>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const budget =
    PRICE_RANGES.find((range) => range.label === budgetLabel) ??
    PRICE_RANGES[0];
  const selectedOccasion = OCCASIONS.find((item) => item.slug === occasion);
  const matches = products.filter((product) => {
    const matchesOccasion =
      !selectedOccasion ||
      selectedOccasion.categories.includes(product.category);
    const matchesType =
      jewelleryType === "all" ||
      (jewelleryType === "gold" &&
        /gold/i.test(product.material)) ||
      (jewelleryType === "diamond" &&
        /diamond/i.test(`${product.material} ${product.gemstone}`)) ||
      product.category === jewelleryType;
    const matchesBudget =
      budget.max === Infinity ||
      (product.price !== undefined &&
        product.price >= budget.min &&
        product.price < budget.max);
    return matchesOccasion && matchesType && matchesBudget;
  });

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-7 lg:px-12">
      <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
        A FEW THOUGHTFUL QUESTIONS
      </p>
      <h1 className="font-serif text-4xl text-[#29242b]">
        Jewellery Match Finder
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716a75]">
        Choose what you have in mind. Recommendations come from the jewellery
        currently listed in the catalogue.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setHasSearched(true);
        }}
        className="mt-8 grid gap-5 border border-[#e8e2ea] bg-[#faf8fb] p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4"
      >
        <label className="grid gap-2 text-[11px] text-[#514c53]">
          Occasion
          <select
            value={occasion}
            onChange={(event) => setOccasion(event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-xs"
          >
            <option value="">Any occasion</option>
            {OCCASIONS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-[11px] text-[#514c53]">
          Budget
          <select
            value={budgetLabel}
            onChange={(event) => setBudgetLabel(event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-xs"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-[11px] text-[#514c53]">
          Jewellery type
          <select
            value={jewelleryType}
            onChange={(event) =>
              setJewelleryType(event.currentTarget.value as CatalogueCategory)
            }
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-xs"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 bg-[#43224e] px-5 text-xs text-white hover:bg-[#573566]"
        >
          Find my edit <Sparkles size={15} />
        </button>
      </form>
      <p className="mt-3 text-[10px] leading-5 text-[#857d88]">
        Products without a listed price only appear under “Any price.” Please
        confirm prices with the showroom.
      </p>
      {hasSearched && (
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">
                YOUR MATCHES
              </p>
              <h2 className="font-serif text-2xl text-[#29242b]">
                {matches.length} {matches.length === 1 ? "piece" : "pieces"} to
                explore
              </h2>
            </div>
            <Link
              to="/contact"
              className="text-[10px] text-[#43224e] underline underline-offset-4"
            >
              Ask the showroom
            </Link>
          </div>
          <ProductGrid
            products={matches}
            wishlistIds={wishlistIds}
            onToggleWishlist={onToggleWishlist}
          />
        </section>
      )}
    </main>
  );
}

export function AboutPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-12 sm:px-7 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-3 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
            ABOUT SHREE JEWELLERS
          </p>
          <h1 className="font-serif text-4xl leading-tight text-[#29242b] sm:text-5xl">
            A more personal way to explore jewellery.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#716a75]">
            Choosing jewellery is personal. Explore the pieces listed by Shree
            Jewellers, then speak with the showroom about the details that
            matter to you.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#716a75]">
            Begin with a question, an occasion, or a saved inspiration. Use the
            catalogue as a starting point, then talk with the showroom about the
            details and choices that feel right for you.
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 bg-[#43224e] px-5 text-xs text-white"
          >
            Contact the showroom <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=82"
            alt="Jewellery display"
            className="aspect-[0.78] size-full object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=82"
            alt="Gold jewellery detail"
            className="mt-10 aspect-[0.78] size-full object-cover"
          />
        </div>
      </section>
      <section className="border-y border-[#ebe6ed] bg-[#faf8fb]">
        <div className="mx-auto grid max-w-[1480px] gap-0 px-4 py-5 sm:grid-cols-3 sm:px-7 lg:px-12">
          {[
            {
              title: "A direct conversation",
              text: "Ask the showroom about pieces, specifications and availability.",
            },
            {
              title: "Details to confirm",
              text: "Product details and availability are shown when provided.",
            },
            {
              title: "Your own pace",
              text: "Explore online, then choose how you want to get in touch.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="border-b border-[#e7e2e8] py-5 sm:border-b-0 sm:border-r sm:px-5"
            >
              <h2 className="font-serif text-xl text-[#43224e]">
                {item.title}
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#716a75]">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ContactPage({ products }: { products: Product[] }) {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section");
  const { hash } = useLocation();
  useEffect(() => {
    const sectionId = section || hash.slice(1);
    if (sectionId === "appointment" || sectionId === "custom-design") {
      window.requestAnimationFrame(() =>
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  }, [hash, section]);

  const contactBlocks = [
    {
      label: "PHONE",
      value: SHOP_CONFIG.phone || "Phone details to be provided",
      icon: Phone,
      href: SHOP_CONFIG.phone
        ? `tel:${SHOP_CONFIG.phone.replace(/[^\d+]/g, "")}`
        : undefined,
    },
    {
      label: "WHATSAPP",
      value: SHOP_CONFIG.whatsapp || "WhatsApp details to be provided",
      icon: MessageCircle,
      href: SHOP_CONFIG.whatsapp
        ? `https://wa.me/${SHOP_CONFIG.whatsapp.replace(/\D/g, "")}`
        : undefined,
    },
    {
      label: "SHOWROOM",
      value: SHOP_CONFIG.address || "Showroom address to be provided",
      icon: MapPin,
    },
    {
      label: "OPENING HOURS",
      value: SHOP_CONFIG.openingHours || "Please enquire for opening hours",
      icon: ArrowRight,
    },
  ];
  return (
    <main>
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-7 lg:px-12">
        <p className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#846a8e]">
          CONTACT
        </p>
        <h1 className="font-serif text-4xl text-[#29242b] sm:text-5xl">
          A good place to begin.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#716a75]">
          For a product question, a custom jewellery idea or a showroom visit,
          send Shree Jewellers an enquiry directly.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contactBlocks.map(({ label, value, icon: Icon, href }) => (
            <div key={label} className="border border-[#e8e2ea] bg-white p-5">
              <Icon size={18} className="text-[#80668b]" />
              <p className="mt-4 text-[9px] font-semibold tracking-[0.15em] text-[#846a8e]">
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  target={label === "WHATSAPP" ? "_blank" : undefined}
                  rel={label === "WHATSAPP" ? "noreferrer" : undefined}
                  className="mt-2 block text-xs leading-5 text-[#43224e] underline decoration-[#d8c6a1] underline-offset-4"
                >
                  {value}
                </a>
              ) : (
                <p className="mt-2 text-xs leading-5 text-[#514c53]">{value}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 overflow-hidden border border-[#e7e2e8]">
          {SHOP_CONFIG.mapEmbedUrl ? (
            <iframe
              title="Map to Shree Jewellers showroom"
              src={SHOP_CONFIG.mapEmbedUrl}
              loading="lazy"
              className="h-64 w-full border-0"
            />
          ) : (
            <div className="grid min-h-52 place-items-center bg-[#f5f2f5] text-center">
              <div className="px-5">
                <MapPin size={22} className="mx-auto text-[#8b7550]" />
                <p className="mt-3 text-xs text-[#716a75]">
                  The showroom map will appear here when the business address is
                  provided.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <EnquiryForm products={products} />
    </main>
  );
}
