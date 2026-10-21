import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Copy, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SHOP_CONFIG } from "../config";
import type { Product } from "../types";

interface EnquiryFormProps {
  products: Product[];
  product?: Product;
}

interface EnquiryFields {
  name: string;
  phone: string;
  interest: string;
  message: string;
}

function makeEnquiry(
  fields: EnquiryFields,
  products: Product[],
  product?: Product,
): string {
  const selected =
    product || products.find((item) => item.id === fields.interest);
  const productUrl = selected
    ? `${window.location.origin}${window.location.pathname}#/product/${selected.id}`
    : "";

  return [
    `Enquiry for ${SHOP_CONFIG.name}`,
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    `Interested in: ${selected?.name || fields.interest || "Jewellery enquiry"}`,
    ...(productUrl ? [`Product page: ${productUrl}`] : []),
    `Message: ${fields.message || "Please share more details."}`,
  ].join("\n");
}

export function EnquiryForm({ products, product }: EnquiryFormProps) {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState<EnquiryFields>({
    name: "",
    phone: "",
    interest: product?.id || "",
    message: "",
  });

  function updateField(field: keyof EnquiryFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (SHOP_CONFIG.whatsapp) {
      const phone = SHOP_CONFIG.whatsapp.replace(/\D/g, "");
      const message = makeEnquiry(fields, products, product);
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  async function copyEnquiry() {
    try {
      await navigator.clipboard.writeText(makeEnquiry(fields, products, product));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id="contact"
      className="mx-auto max-w-[1480px] scroll-mt-32 px-4 py-12 sm:px-7 lg:px-12"
      aria-labelledby="enquiry-heading"
    >
      <div className="grid overflow-hidden border border-[#e9e4ea] md:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-[#f7f4f8] p-6 sm:p-9">
          <p className="text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">
            A PERSONAL ENQUIRY
          </p>
          <h2
            id="enquiry-heading"
            className="mt-3 font-serif text-3xl text-[#29242b]"
          >
            Let’s find your piece.
          </h2>
          <p className="mt-3 max-w-md text-xs leading-6 text-[#716a75]">
            Share what caught your eye, or tell us about a custom design you
            have in mind.
          </p>
          <div className="mt-7 space-y-4 text-xs">
            {SHOP_CONFIG.phone ? (
              <a
                href={`tel:${SHOP_CONFIG.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 text-[#43224e]"
              >
                <Phone size={15} />
                {SHOP_CONFIG.phone}
              </a>
            ) : (
              <Link
                to="/contact"
                className="flex items-center gap-3 text-[#43224e]"
              >
                <Phone size={15} />
                Shop phone number to be provided
              </Link>
            )}
            {SHOP_CONFIG.whatsapp ? (
              <a
                href={`https://wa.me/${SHOP_CONFIG.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-[#43224e]"
              >
                <MessageCircle size={15} />
                WhatsApp showroom enquiry
              </a>
            ) : (
              <Link
                to="/contact"
                className="flex items-center gap-3 text-[#43224e]"
              >
                <MessageCircle size={15} />
                WhatsApp showroom enquiry
              </Link>
            )}
            <p className="leading-5 text-[#716a75]">
              {SHOP_CONFIG.address || "Showroom address to be provided"}
            </p>
            <p className="text-[#716a75]">
              {SHOP_CONFIG.openingHours || "Please enquire for opening hours"}
            </p>
          </div>
          {SHOP_CONFIG.mapEmbedUrl && (
            <iframe
              title="Showroom map"
              src={SHOP_CONFIG.mapEmbedUrl}
              loading="lazy"
              className="mt-7 h-40 w-full border-0"
            />
          )}
        </div>
        <div className="p-6 sm:p-9">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[11px] text-[#514c53]">
              Your name
              <input
                required
                autoComplete="name"
                value={fields.name}
                onChange={(event) =>
                  updateField("name", event.currentTarget.value)
                }
                className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
                placeholder="Name"
              />
            </label>
            <label className="grid gap-1.5 text-[11px] text-[#514c53]">
              Phone number
              <input
                required
                type="tel"
                autoComplete="tel"
                value={fields.phone}
                onChange={(event) =>
                  updateField("phone", event.currentTarget.value)
                }
                className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
                placeholder="Your preferred contact number"
              />
            </label>
            <label className="grid gap-1.5 text-[11px] text-[#514c53] sm:col-span-2">
              Interested in
              <select
                value={product?.id || fields.interest}
                onChange={(event) =>
                  updateField("interest", event.currentTarget.value)
                }
                disabled={Boolean(product)}
                className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
              >
                <option value="">Choose a piece or collection</option>
                <option value="Custom jewellery enquiry">
                  Custom jewellery enquiry
                </option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[11px] text-[#514c53] sm:col-span-2">
              Message
              <textarea
                rows={3}
                value={fields.message}
                onChange={(event) =>
                  updateField("message", event.currentTarget.value)
                }
                className="resize-y border-b border-[#dcd6de] bg-transparent px-1 py-2 text-sm outline-none focus:border-[#43224e]"
                placeholder="What would you like to know?"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#43224e] px-5 text-xs font-medium text-white hover:bg-[#573566] sm:col-span-2 sm:justify-self-start"
            >
              Prepare enquiry <MessageCircle size={15} />
            </button>
          </form>
          {submitted && (
            <div
              className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eeeaf0] pt-4"
              role="status"
            >
              <p className="text-xs leading-5 text-[#5d5661]">
                {SHOP_CONFIG.whatsapp
                  ? "Your enquiry is ready in WhatsApp."
                  : "Your enquiry is prepared. Copy it to share with the showroom."}
              </p>
              <button
                type="button"
                onClick={copyEnquiry}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#43224e]"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy enquiry"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
