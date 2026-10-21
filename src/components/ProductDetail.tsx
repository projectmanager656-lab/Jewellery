import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Heart,
  Phone,
  Scale,
} from "lucide-react";
import { SHOP_CONFIG } from "../config";
import { formatPrice } from "../utils/formatPrice";
import type { Product } from "../types";
import { EnquiryForm } from "./EnquiryForm";
import { ProductImage } from "./ProductImage";
import { useCompare } from "../state/CompareContext";

interface ProductDetailProps {
  products: Product[];
  loading: boolean;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onRecentlyViewed: (productId: string) => void;
}

function productPageUrl(product: Product): string {
  return `${window.location.origin}${window.location.pathname}#/product/${product.id}`;
}

export function ProductDetail({
  products,
  loading,
  wishlistIds,
  onToggleWishlist,
  onRecentlyViewed,
}: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const product = products.find((item) => item.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const gallery = product?.gallery?.length
    ? product.gallery
    : product?.image
      ? [product.image]
      : [];
  const { compareIds, canAddMore, toggleCompare } = useCompare();

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} | ${SHOP_CONFIG.name}`;
    onRecentlyViewed(product.id);
    return () => {
      document.title = `${SHOP_CONFIG.name} | Fine Jewellery`;
    };
  }, [product, onRecentlyViewed]);

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="font-serif text-3xl">
          {loading ? "Loading this piece…" : "This piece isn’t in the current catalogue."}
        </p>
        <Link
          to="/catalogue"
          className="mt-5 inline-block text-sm text-[#43224e] underline underline-offset-4"
        >
          Back to the collection
        </Link>
      </main>
    );
  }

  const message = `Hello, I'm interested in ${product.name} (code ${product.code}). Could you share current details? ${productPageUrl(product)}`;
  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-7 lg:px-12 lg:pt-9">
      <nav
        aria-label="Breadcrumb"
        className="mb-7 flex items-center gap-2 text-[10px] text-[#89828c]"
      >
        <Link to="/catalogue" className="hover:text-[#43224e]">
          Jewellery
        </Link>
        <ChevronRight size={13} />
        <span>{product.category}</span>
        <ChevronRight size={13} />
        <span className="text-[#342d37]">{product.name}</span>
      </nav>
      <Link
        to="/catalogue"
        className="mb-6 inline-flex items-center gap-2 text-xs text-[#43224e] lg:hidden"
      >
        <ArrowLeft size={15} /> Back to the collection
      </Link>
      <div className="grid gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <section aria-label={`${product.name} image gallery`}>
          <div className="product-detail-image overflow-hidden bg-[#f5f2f5]">
            <ProductImage
              src={gallery[activeImage]}
              alt={`${product.name}, view ${activeImage + 1}`}
              className="size-full"
            />
          </div>
          {gallery.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-pressed={activeImage === index}
                onClick={() => setActiveImage(index)}
                className={`product-thumb overflow-hidden border ${activeImage === index ? "border-[#43224e]" : "border-transparent"}`}
              >
                <ProductImage
                  src={image}
                  alt=""
                  className="size-full"
                  imageClassName="size-full object-cover"
                />
              </button>
            ))}
          </div>}
        </section>
        <section className="lg:sticky lg:top-40 lg:self-start">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-[#846a8e]">
            {product.category.toUpperCase()} · SHREE JEWELLERS
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-4xl leading-tight text-[#29242b] sm:text-[44px]">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              aria-label={
                isWishlisted
                  ? `Remove ${product.name} from wishlist`
                  : `Add ${product.name} to wishlist`
              }
              aria-pressed={isWishlisted}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#e8e2ea] text-[#43224e]"
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="mt-3 text-sm text-[#77717a]">{product.material || "Material details available from the showroom"}</p>
          <p className="mt-2 text-xs text-[#756c78]">{product.availability === false ? "Currently unavailable. Contact the showroom to ask about its status." : "Available to enquire"}</p>
          <p className="mt-3 text-[10px] text-[#89828c]">
            Product code: {product.code}
          </p>
          <p className="mt-5 flex items-center gap-2 text-lg font-medium text-[#342d37]">
            {product.price === undefined
              ? "Price on enquiry"
              : formatPrice(product.price, product.currency)}
          </p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#69636d]">
            {product.description || "Contact the showroom for more details about this piece."}
          </p>
          <dl className="mt-7 grid grid-cols-2 gap-x-6 border-y border-[#e8e4e9] py-5">
            <div className="border-b border-[#eeeaf0] py-3">
              <dt className="text-[10px] text-[#89828c]">Material</dt>
              <dd className="mt-1 text-xs text-[#342d37]">
                {product.material || "Please enquire"}
              </dd>
            </div>
            <div className="border-b border-[#eeeaf0] py-3">
              <dt className="text-[10px] text-[#89828c]">Approx. weight</dt>
              <dd className="mt-1 text-xs text-[#342d37]">{product.weight || "Please enquire"}</dd>
            </div>
            <div className="py-3">
              <dt className="text-[10px] text-[#89828c]">Purity</dt>
              <dd className="mt-1 text-xs text-[#342d37]">{product.purity || "Please enquire"}</dd>
            </div>
            <div className="py-3">
              <dt className="text-[10px] text-[#89828c]">Gemstone</dt>
              <dd className="mt-1 text-xs text-[#342d37]">
                {product.gemstone || "Please enquire"}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[10px] leading-5 text-[#918a95]">
            Please confirm current specifications and availability with the
            showroom.
          </p>
          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            disabled={!isCompared && !canAddMore}
            aria-pressed={isCompared}
            className="mt-4 inline-flex min-h-9 items-center gap-2 text-[11px] text-[#43224e] underline decoration-[#d8c6a1] underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Scale size={15} />
            {isCompared ? "Remove from comparison" : "Add to comparison"}
          </button>
          <div className="mt-7 flex flex-wrap gap-3">
            {SHOP_CONFIG.phone ? (
              <a
                href={`tel:${SHOP_CONFIG.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#43224e] px-6 text-xs font-medium text-white hover:bg-[#573566]"
              >
                <Phone size={16} /> Call now
              </a>
            ) : (
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#43224e] px-6 text-xs font-medium text-white hover:bg-[#573566]"
              >
                <Phone size={16} /> Call now
              </Link>
            )}
            {SHOP_CONFIG.whatsapp ? (
              <a
                href={`https://wa.me/${SHOP_CONFIG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#d8c6a1] px-5 text-xs font-medium text-[#43224e] hover:bg-[#faf7f0]"
              >
                WhatsApp enquiry <ArrowUpRight size={15} />
              </a>
            ) : (
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#d8c6a1] px-5 text-xs font-medium text-[#43224e] hover:bg-[#faf7f0]"
              >
                WhatsApp enquiry <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
          <Link
            to="/catalogue"
            className="mt-7 inline-flex items-center gap-2 text-xs text-[#43224e] underline decoration-[#d8c6a1] underline-offset-4"
          >
            Continue browsing <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      <EnquiryForm products={products} product={product} />
    </main>
  );
}
