"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const ACCORDION = [
  {
    id: "editorial",
    title: "Contact Editorial",
    body:
      "For news tips, corrections, and editorial questions, email tips@fptn.com or use the form on our help center when available.",
  },
  {
    id: "oped",
    title: "Op-Ed.",
    body:
      "To submit an opinion piece for consideration, contact our editorial team with your draft, bio, and contact information at tips@fptn.com.",
  },
  {
    id: "media",
    title: "Media Inquiries",
    body:
      "Members of the press may reach our team at press@fptn.com. Please include your outlet, deadline, and the nature of your request.",
  },
  {
    id: "rights",
    title: "Rights and Permissions",
    body:
      "For licensing, reprint, or permission requests regarding FlashPoint Television Network content, contact press@fptn.com with details of the requested use.",
  },
  {
    id: "advertising",
    title: "Advertising",
    body:
      "For sponsorship and advertising opportunities, email partnerships@fptn.com.",
  },
  {
    id: "leadership",
    title: "Editorial Leadership US Editions",
    body:
      "For questions about U.S. editorial leadership and standards, contact press@fptn.com.",
  },
  {
    id: "regional",
    title: "Regional Offices",
    body:
      "For regional or local inquiries, email info@fptn.com and include your location and topic.",
  },
] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 text-[#6b7280] transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactView() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-14 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,459px)] lg:gap-12">
        <div className="min-w-0">
          <h1
            className="font-bold text-[#141921] text-[2.35rem] leading-tight md:text-[3.35rem]"
          >
            Contact Us
          </h1>

          <div className="mt-8 rounded border border-[#e2e8f0] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-2xl font-bold text-[#2f2f2f]">Help Center</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#2f2f2f]">
              Need help with your FlashPoint Television Network account, accessing
              content, watching programming, or using our website? Visit our Help
              Center for answers to common questions and technical support.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex h-[58px] min-w-[209px] items-center justify-center rounded-lg bg-[#b80529] px-4 text-center text-[18px] font-bold text-white hover:brightness-110"
            >
              Help Center
            </Link>
          </div>

          <div className="mt-6 rounded border border-[#e2e8f0] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-2xl font-bold text-[#2f2f2f]">
              Contact Customer Service
            </h2>
            <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-[#2f2f2f]">
              <p>
                Need assistance with your account, login, subscriptions, streaming
                access, or another technical issue? Our support team is here to help.
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:support@fptn.com"
                  className="underline hover:text-[var(--fpn-rojo)]"
                >
                  support@fptn.com
                </a>
              </p>
              <p>
                <span className="font-semibold">Support Hours:</span>
                <br />
                Monday–Friday: 8:00 AM–8:00 PM CT
                <br />
                Saturday–Sunday: 10:00 AM–6:00 PM CT
              </p>
            </div>
          </div>

          <div className="mt-8 divide-y-2 divide-[#e5e7eb] border-t-2 border-[#e5e7eb]">
            {ACCORDION.map((item) => {
              const open = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-3 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span className="text-2xl font-bold text-[#2f2f2f]">
                      {item.title}
                    </span>
                    <Chevron open={open} />
                  </button>
                  {open ? (
                    <p className="pb-4 text-[17px] leading-relaxed text-[#2f2f2f]">
                      {item.body}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="lg:pt-2">
          <div
            className="flex flex-col items-center justify-between gap-6 rounded-[21px] bg-[#b80529] px-6 pb-8 pt-10 text-center text-white lg:min-h-[520px]"
          >
            <h2 className="max-w-[340px] text-[2rem] font-bold leading-tight md:text-[2.85rem] md:leading-[1.05]">
              Get The Full Story. As It Is.
            </h2>
            <p className="max-w-[400px] text-[21px] leading-snug">
              Find out the rest of this story, and the scoops and exclusive
              information.
            </p>
            <Link
              href="/register"
              className="flex min-h-[58px] w-full max-w-[419px] items-center justify-center rounded-lg bg-white px-3 py-2 text-center text-[17px] font-bold text-black hover:bg-white/95"
            >
              Create your FPTN All Access account for Free
            </Link>
            <div className="relative mx-auto mt-2 h-[200px] w-[200px] md:h-[280px] md:w-[280px]">
              <Image
                src="/brand/fpn-logo-mark.svg"
                alt=""
                width={280}
                height={280}
                className="h-full w-full object-contain opacity-90"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
