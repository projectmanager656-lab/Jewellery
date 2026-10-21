import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Check, Copy, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SHOP_CONFIG } from "../config";

interface VisitRequest {
  name: string;
  phone: string;
  date: string;
  time: string;
  note: string;
}

function localToday(): string {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function AppointmentForm() {
  const [fields, setFields] = useState<VisitRequest>({
    name: "",
    phone: "",
    date: "",
    time: "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  function update(field: keyof VisitRequest, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function message(): string {
    return [
      `Showroom visit request for ${SHOP_CONFIG.name}`,
      `Name: ${fields.name}`,
      `Phone: ${fields.phone}`,
      `Preferred date: ${fields.date}`,
      `Preferred time: ${fields.time}`,
      `Note: ${fields.note || "No additional note"}`,
      "Please confirm availability; this is a request, not a confirmed appointment.",
    ].join("\n");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (SHOP_CONFIG.whatsapp) {
      const phone = SHOP_CONFIG.whatsapp.replace(/\D/g, "");
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message())}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(message());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id="appointment"
      className="scroll-mt-32 border border-[#e9e4ea] bg-white p-5 sm:p-7"
      aria-labelledby="visit-request-title"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center bg-[#f4eff6] text-[#654c70]">
          <CalendarDays size={18} />
        </span>
        <div>
          <h2
            id="visit-request-title"
            className="font-serif text-2xl text-[#29242b]"
          >
            Book a showroom visit
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#716a75]">
            Send a preferred date and time. The showroom must confirm
            availability before your visit is booked.
          </p>
        </div>
      </div>
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
          Preferred date
          <input
            required
            type="date"
            min={localToday()}
            value={fields.date}
            onChange={(event) => update("date", event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53]">
          Preferred time
          <input
            required
            type="time"
            value={fields.time}
            onChange={(event) => update("time", event.currentTarget.value)}
            className="h-11 border-b border-[#dcd6de] bg-transparent px-1 text-sm outline-none focus:border-[#43224e]"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] text-[#514c53] sm:col-span-2">
          What would you like to discuss?
          <textarea
            rows={2}
            value={fields.note}
            onChange={(event) => update("note", event.currentTarget.value)}
            className="resize-y border-b border-[#dcd6de] bg-transparent px-1 py-2 text-sm outline-none focus:border-[#43224e]"
            placeholder="Optional"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#43224e] px-5 text-xs text-white sm:justify-self-start"
        >
          Prepare visit request <CalendarDays size={15} />
        </button>
        {!SHOP_CONFIG.whatsapp && (
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center gap-2 text-xs text-[#43224e] sm:justify-self-start"
          >
            <Phone size={14} />
            Showroom contact details are pending
          </Link>
        )}
      </form>
      {submitted && (
        <div
          className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eeeaf0] pt-4"
          role="status"
        >
          <p className="text-xs leading-5 text-[#5d5661]">
            {SHOP_CONFIG.whatsapp
              ? "Your visit request is prepared in WhatsApp. The showroom still needs to confirm the appointment."
              : "Your request is prepared locally and has not been sent. Copy it to share with the showroom."}
          </p>
          <button
            type="button"
            onClick={copyRequest}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#43224e]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy request"}
          </button>
        </div>
      )}
    </section>
  );
}
