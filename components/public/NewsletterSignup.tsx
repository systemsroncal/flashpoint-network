"use client";

import { FormEvent, useState } from "react";

export default function NewsletterSignup({
  className = "",
}: {
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      return;
    }
    // MVP: no ESP wired — confirm intent locally
    setStatus("ok");
    setEmail("");
  };

  return (
    <div className={className}>
      <form
        onSubmit={onSubmit}
        className="mx-auto mt-6 flex max-w-lg flex-col gap-2 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Email address"
          className="flex-1 border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--fpn-rojo)]"
          aria-label="Email address"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--fpn-rojo)] px-5 py-3 text-sm font-bold text-white hover:brightness-110"
        >
          Sign up
        </button>
      </form>
      {status === "ok" ? (
        <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
          Thanks — you&apos;re on the list. We&apos;ll be in touch.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          Enter a valid email address.
        </p>
      ) : null}
    </div>
  );
}
