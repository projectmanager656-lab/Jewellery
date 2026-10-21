import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Menu,
  Phone,
  Scale,
  Search,
  X,
} from "lucide-react";
import { SHOP_CONFIG } from "../config";
import type { CatalogueCategory } from "../types";
import type { CategoryOption } from "../types";
import { useCompare } from "../state/CompareContext";

interface HeaderProps {
  categories: CategoryOption[];
  category: CatalogueCategory;
  search: string;
  wishlistCount: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectCategory: (value: CatalogueCategory) => void;
}

interface FooterProps {
  categories: CategoryOption[];
  onSelectCategory: (value: CatalogueCategory) => void;
}

export function Announcement() {
  return (
    <div className="bg-[#3e214a] px-4 py-2 text-center text-[9px] font-medium tracking-[0.16em] text-white sm:text-[10px]">
      A CONSIDERED COLLECTION · SHREE JEWELLERS
    </div>
  );
}

export function Header({
  categories,
  category,
  search,
  wishlistCount,
  onSearchChange,
  onSearchSubmit,
  onSelectCategory,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { compareIds } = useCompare();

  function selectCategory(value: CatalogueCategory) {
    onSelectCategory(value);
    setMenuOpen(false);
  }

  function searchField() {
    return (
      <label className="flex h-10 items-center gap-2 border-b border-[#ded9e0] px-2 text-[#756c78] focus-within:border-[#4a2c55]">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Search jewellery</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearchSubmit();
          }}
          placeholder="Search jewellery"
          className="min-w-0 flex-1 bg-transparent text-xs text-[#29242b] outline-none placeholder:text-[#928a95]"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
          >
            <X size={14} />
          </button>
        )}
      </label>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#ece8ed] bg-white/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1480px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-7 lg:grid-cols-[1fr_minmax(240px,470px)_1fr] lg:px-12">
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center text-[#43224e] hover:bg-[#f5f1f6] lg:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link
          to="/"
          className="col-start-2 row-start-1 grid justify-items-center leading-none lg:col-start-1 lg:justify-self-start"
        >
          <span className="font-serif text-[29px] text-[#43224e] sm:text-[32px]">
            {SHOP_CONFIG.name}
          </span>
          <span className="mt-1.5 text-[7px] font-medium tracking-[0.28em] text-[#77717a]">
            FINE JEWELLERY
          </span>
        </Link>
        <div className="hidden lg:block">{searchField()}</div>
        <div className="col-start-3 row-start-1 flex items-center justify-self-end gap-3 sm:gap-5">
          <Link
            to="/compare"
            aria-label={`Compare products, ${compareIds.length} selected`}
            className="relative grid size-9 place-items-center text-[#43224e] hover:text-[#7b6185]"
          >
            <Scale size={18} strokeWidth={1.6} />
            {compareIds.length > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#4a2c55] text-[9px] text-white">
                {compareIds.length}
              </span>
            )}
          </Link>
          <Link
            to="/wishlist"
            aria-label={`My Jewellery Box, ${wishlistCount} saved items`}
            className="relative grid size-9 place-items-center text-[#43224e] hover:text-[#7b6185]"
          >
            <Heart size={18} strokeWidth={1.6} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#4a2c55] text-[9px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          {SHOP_CONFIG.phone ? (
            <a
              href={`tel:${SHOP_CONFIG.phone.replace(/[^\d+]/g, "")}`}
              className="hidden items-center gap-2 text-[11px] text-[#43224e] sm:flex"
            >
              <Phone size={15} /> {SHOP_CONFIG.phone}
            </a>
          ) : (
            <Link
              to="/contact"
              className="hidden items-center gap-2 text-[11px] text-[#43224e] sm:flex"
            >
              <Phone size={15} /> Contact
            </Link>
          )}
        </div>
      </div>
      <div className="border-y border-[#3e214a] bg-[#3e214a]">
        <nav
          aria-label="Main navigation"
          className="mx-auto hidden max-w-[1480px] flex-wrap items-center justify-center gap-x-7 gap-y-2 px-6 py-3 lg:flex"
        >
          <Link
            to="/"
            className="shrink-0 text-[10px] text-white/80 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/catalogue"
            className="shrink-0 text-[10px] text-white/80 hover:text-white"
          >
            Jewellery
          </Link>
          <Link
            to="/match-finder"
            className="shrink-0 text-[10px] text-white/80 hover:text-white"
          >
            Match finder
          </Link>
          <Link
            to="/compare"
            className="shrink-0 text-[10px] text-white/80 hover:text-white"
          >
            Compare
          </Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none text-[10px] text-white/80 hover:text-white">Shop by category <span aria-hidden="true">⌄</span></summary>
            <div className="absolute left-1/2 top-full z-50 mt-3 grid w-64 -translate-x-1/2 grid-cols-2 gap-1 border border-[#ece6ed] bg-white p-3 text-[#43224e] shadow-xl">
              {categories.filter((item) => item.value !== "all").map((item) => (
                <button key={item.value} type="button" aria-current={category === item.value ? "page" : undefined} onClick={() => selectCategory(item.value)} className={`px-3 py-2 text-left text-xs hover:bg-[#f8f5f8] ${category === item.value ? "font-semibold text-[#43224e]" : "text-[#5f5663]"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </details>
          <Link
            to="/about"
            className="shrink-0 text-[10px] text-white/80 hover:text-white"
          >
            Our story
          </Link>
          <Link
            to="/contact"
            className="flex shrink-0 items-center gap-1 text-[10px] text-white/80 hover:text-white"
          >
            Contact <ArrowUpRight size={12} />
          </Link>
        </nav>
      </div>
      <div className="px-4 pb-3 lg:hidden">{searchField()}</div>
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full max-h-[75vh] overflow-auto border-b border-[#e8e2eb] bg-white px-5 py-3 shadow-lg lg:hidden"
        >
          <div className="grid grid-cols-2 gap-x-5 border-b border-[#eeeaf0] pb-2">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              All jewellery
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Our story
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Contact us
            </Link>
            <Link
              to="/match-finder"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Jewellery match finder
            </Link>
            <Link
              to="/compare"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Compare jewellery
            </Link>
            <Link
              to="/contact?section=appointment"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Book a showroom visit
            </Link>
            <Link
              to="/contact?section=custom-design"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-[#43224e]"
            >
              Custom jewellery studio
            </Link>
          </div>
          <details className="border-b border-[#f0edf0] py-3">
            <summary className="cursor-pointer text-sm font-medium text-[#43224e]">Shop by category</summary>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {categories.filter((item) => item.value !== "all").map((item) => (
                <button key={item.value} type="button" onClick={() => selectCategory(item.value)} className={`px-2 py-2 text-left text-xs ${category === item.value ? "font-semibold text-[#43224e]" : "text-[#514c53]"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </details>
        </nav>
      )}
    </header>
  );
}

export function Footer({ categories, onSelectCategory }: FooterProps) {
  const navigate = useNavigate();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  function chooseFooterCategory(value: CatalogueCategory) {
    onSelectCategory(value);
    navigate("/catalogue");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="mt-16 bg-[#241c27] text-white">
      <div className="mx-auto grid max-w-[1480px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.15fr_1.2fr] lg:px-12">
        <div>
          <Link to="/" className="font-serif text-3xl">
            {SHOP_CONFIG.name}
          </Link>
          <p className="mt-4 max-w-56 text-sm leading-6 text-white/60">
            A considered collection, with a personal showroom conversation
            always close by.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-white/70">
          <h2 className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-[#d8c6a1]">
            EXPLORE
          </h2>
          {categories.filter((item) => !["all", "gold", "diamond"].includes(item.value)).slice(0, 8).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => chooseFooterCategory(item.value)}
              className="w-fit text-left hover:text-white"
            >
              {item.label}
            </button>
          ))}
          <Link to="/wishlist" className="hover:text-white">
            My Jewellery Box
          </Link>
          <Link to="/compare" className="hover:text-white">
            Compare jewellery
          </Link>
          <Link to="/match-finder" className="hover:text-white">
            Jewellery Match Finder
          </Link>
          <Link to="/contact?section=appointment" className="hover:text-white">
            Book a showroom visit
          </Link>
          <Link
            to="/contact?section=custom-design"
            className="hover:text-white"
          >
            Custom jewellery studio
          </Link>
          <Link to="/about" className="hover:text-white">
            About Shree Jewellers
          </Link>
        </div>
        <div className="flex flex-col gap-3 text-sm text-white/70">
          <h2 className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-[#d8c6a1]">
            VISIT THE SHOWROOM
          </h2>
          {SHOP_CONFIG.phone ? (
            <a
              href={`tel:${SHOP_CONFIG.phone.replace(/[^\d+]/g, "")}`}
              className="hover:text-white"
            >
              {SHOP_CONFIG.phone}
            </a>
          ) : (
            <Link to="/contact" className="hover:text-white">
              Phone details to be provided
            </Link>
          )}
          <p>{SHOP_CONFIG.address || "Showroom address to be provided"}</p>
          <p>
            {SHOP_CONFIG.openingHours || "Please enquire for opening hours"}
          </p>
          <div className="flex gap-4 pt-1 text-[11px]">
            {SHOP_CONFIG.instagramUrl && (
              <a
                href={SHOP_CONFIG.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Instagram
              </a>
            )}
            {SHOP_CONFIG.facebookUrl && (
              <a
                href={SHOP_CONFIG.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-[#d8c6a1]">
            DIRECT ENQUIRIES
          </h2>
          <p className="max-w-sm text-sm leading-6 text-white/60">
            Ask the showroom about a piece, its current specifications, or
            arranging a visit.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {SHOP_CONFIG.phone ? (
              <a
                href={`tel:${SHOP_CONFIG.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 text-xs hover:border-white/60"
              >
                <Phone size={15} />
                Call now
              </a>
            ) : (
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 text-xs hover:border-white/60"
              >
                <Phone size={15} />
                Call the showroom
              </Link>
            )}
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center gap-2 bg-[#d9c8a3] px-4 text-xs text-[#241c27] hover:bg-white"
            >
              WhatsApp enquiry <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-4 text-[10px] text-white/45">
        <span>
          © {new Date().getFullYear()} {SHOP_CONFIG.name}. Catalogue and
          enquiries only.
        </span>
        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          className="hover:text-white"
        >
          Privacy policy
        </button>
      </div>
      {privacyOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPrivacyOpen(false);
          }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-5"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            className="relative max-w-lg bg-white p-7 text-[#29242b] shadow-2xl sm:p-10"
          >
            <button
              type="button"
              onClick={() => setPrivacyOpen(false)}
              aria-label="Close privacy policy"
              className="absolute right-4 top-4 grid size-9 place-items-center text-lg text-[#514c53]"
            >
              ×
            </button>
            <p className="text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">
              THE FINE PRINT
            </p>
            <h2 id="privacy-title" className="mt-3 font-serif text-3xl">
              Privacy, plainly.
            </h2>
            <p className="mt-4 text-xs leading-6 text-[#716a75]">
              This preview does not store enquiry details. When you choose
              WhatsApp, your enquiry is shared with the showroom through
              WhatsApp. Before launch, replace this notice with the business’s
              actual privacy policy.
            </p>
            <button
              type="button"
              onClick={() => setPrivacyOpen(false)}
              className="mt-6 min-h-11 bg-[#43224e] px-5 text-xs text-white"
            >
              Understood
            </button>
          </section>
        </div>
      )}
    </footer>
  );
}
