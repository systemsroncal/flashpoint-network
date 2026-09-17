"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsletterSignup({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error">("idle");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      return;
    }
    // Account creation happens on /register — no separate newsletter ESP.
    router.push(`/register?email=${encodeURIComponent(trimmed)}`);
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
      {status === "error" ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          Enter a valid email address.
        </p>
      ) : null}
    </div>
  );
}
