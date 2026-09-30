"use client";

import { useState } from "react";

const fieldLabel =
  "text-[length:clamp(1rem,2.5vw,1.2rem)] font-semibold leading-snug text-black";
const inputClass =
  "w-full rounded-md border border-[#d1d5db] bg-white px-4 py-3 text-base text-black outline-none focus:border-[#1b2a64] focus:ring-1 focus:ring-[#1b2a64]";

export default function AdvertiseForm() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("company", company);
      body.set("name", name);
      body.set("email", email);
      body.set("phone", phone);
      body.set("message", message);
      body.set("website_url", "");

      const res = await fetch("/api/advertise/submit", { method: "POST", body });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-[#d1d5db] bg-[#f8fafc] px-6 py-10 text-center">
        <p className="text-xl font-bold text-[#141921]">Thank you</p>
        <p className="mt-3 text-base leading-relaxed text-[#374151]">
          We received your inquiry and will follow up by email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-2">
        <span className={fieldLabel}>Company or organization</span>
        <input
          className={inputClass}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
        />
      </label>
      <label className="block space-y-2">
        <span className={fieldLabel}>Your name *</span>
        <input
          className={inputClass}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label className="block space-y-2">
        <span className={fieldLabel}>Email *</span>
        <input
          type="email"
          className={inputClass}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="block space-y-2">
        <span className={fieldLabel}>Phone</span>
        <input
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </label>
      <label className="block space-y-2">
        <span className={fieldLabel}>How would you like to advertise? *</span>
        <textarea
          className={`${inputClass} min-h-[140px]`}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Audience, budget range, timing, placements you are interested in…"
        />
      </label>
      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--fpn-rojo)] px-5 py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
