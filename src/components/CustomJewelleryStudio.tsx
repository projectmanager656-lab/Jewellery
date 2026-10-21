import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Check, Copy, ImagePlus, MessageCircle, X } from "lucide-react";
import { SHOP_CONFIG } from "../config";

interface CustomDesignFields {
  name: string;
  phone: string;
  occasion: string;
  jewelleryType: string;
  budget: string;
  description: string;
}

export function CustomJewelleryStudio() {
  const [fields, setFields] = useState<CustomDesignFields>({
    name: "",
    phone: "",
    occasion: "",
    jewelleryType: "",
    budget: "",
    description: "",
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (!referenceImage) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(referenceImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [referenceImage]);

  function update(field: keyof CustomDesignFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    setFileError("");
    if (file && !file.type.startsWith("image/")) {
      setFileError("Choose an image file.");
      event.currentTarget.value = "";
      setReferenceImage(null);
      return;
    }
    if (file && file.size > 8 * 1024 * 1024) {
      setFileError("Choose an image smaller than 8 MB.");
      event.currentTarget.value = "";
      setReferenceImage(null);
      return;
    }
    setReferenceImage(file);
  }

  function enquiryMessage(): string {
    return [
      `Custom jewellery enquiry for ${SHOP_CONFIG.name}`,
      `Name: ${fields.name}`,
      `Phone: ${fields.phone}`,
      `Occasion: ${fields.occasion || "Not specified"}`,
      `Jewellery type: ${fields.jewelleryType || "Not specified"}`,
      `Budget: ${fields.budget || "Please discuss"}`,
      `Design brief: ${fields.description}`,
      `Reference image selected: ${referenceImage?.name || "No image selected"}`,
    ].join("\n");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (SHOP_CONFIG.whatsapp) {
      const number = SHOP_CONFIG.whatsapp.replace(/\D/g, "");
      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(enquiryMessage())}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(enquiryMessage());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id="custom-design"
      className="scroll-mt-32 border border-[#e9e4ea] bg-white p-5 sm:p-7"
      aria-labelledby="custom-design-title"
    >
      <p className="text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">
        DESIGNED AROUND YOUR IDEA
      </p>
      <h2
        id="custom-design-title"
        className="mt-2 font-serif text-2xl text-[#29242b]"
      >
        Custom Jewellery Studio
      </h2>
      <p className="mt-2 text-xs leading-5 text-[#716a75]">
        Describe the piece you have in mind. You can preview a reference image
        here; this site does not upload or store it.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[11px] text-[#514c53]">
          Your name
          <input
            required
            autoComplete="name"
            value={fields.name}
            onChange={(event) => update("name", event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53]">
          Phone number
          <input
            required
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            onChange={(event) => update("phone", event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53]">
          Occasion
          <input
            value={fields.occasion}
            onChange={(event) => update("occasion", event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
            placeholder="Optional"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53]">
          Jewellery type
          <input
            value={fields.jewelleryType}
            onChange={(event) =>
              update("jewelleryType", event.currentTarget.value)
            }
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
            placeholder="Ring, pendant, necklace..."
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53] sm:col-span-2">
          Budget or range
          <input
            value={fields.budget}
            onChange={(event) => update("budget", event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
            placeholder="Optional"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53] sm:col-span-2">
          Describe your design
          <textarea
            required
            rows={4}
            value={fields.description}
            onChange={(event) =>
              update("description", event.currentTarget.value)
            }
            className="resize-y border-b border-[#dcd6de] bg-transparent px-1 py-2 text-sm outline-none focus:border-[#43224e]"
            placeholder="Share materials, style references or details important to you."
          />
        </label>
        <div className="sm:col-span-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[#ded9df] px-4 text-xs text-[#43224e] hover:bg-[#faf8fb]">
            <ImagePlus size={16} />
            Choose reference image
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-[10px] text-[#847d87]">
            Image stays in this page session, max 8 MB. If you contact by
            WhatsApp, attach it manually after the message opens.
          </p>
          {fileError && (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {fileError}
            </p>
          )}
          {previewUrl && (
            <div className="relative mt-4 w-fit">
              <img
                src={previewUrl}
                alt="Local preview of your selected design reference"
                className="max-h-56 max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setReferenceImage(null)}
                aria-label="Remove reference image"
                className="absolute -right-3 -top-3 grid size-8 place-items-center rounded-full bg-white text-[#43224e] shadow"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#43224e] px-5 text-xs text-white sm:justify-self-start"
        >
          Prepare custom enquiry <MessageCircle size={15} />
        </button>
      </form>
      {submitted && (
        <div
          className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eeeaf0] pt-4"
          role="status"
        >
          <p className="text-xs leading-5 text-[#5d5661]">
            {SHOP_CONFIG.whatsapp
              ? "Your design brief is prepared in WhatsApp. Attach the selected image there before sending."
              : "Your brief is prepared locally and was not sent. Copy the message and share the image separately with the showroom."}
          </p>
          <button
            type="button"
            onClick={copyBrief}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#43224e]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy brief"}
          </button>
        </div>
      )}
    </section>
  );
}
