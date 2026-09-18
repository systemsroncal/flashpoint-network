"use client";

import { useMemo, useRef, useState } from "react";
import {
  HELP_CENTER_AREAS,
  JOURNALISM_AREA,
  JOURNALISM_ISSUES,
} from "@/lib/help-center/options";

const fieldLabel =
  "text-[length:clamp(1rem,2.5vw,1.3rem)] font-semibold leading-snug text-black";
const inputClass =
  "w-full rounded-md border border-[#d1d5db] bg-white px-5 py-3 text-[length:clamp(1rem,2.5vw,1.3rem)] text-black outline-none focus:border-[#1b2a64] focus:ring-1 focus:ring-[#1b2a64]";
const selectClass = `${inputClass} appearance-none bg-[length:14px] bg-[right_1.25rem_center] bg-no-repeat pr-12`;

export default function HelpCenterForm() {
  const [email, setEmail] = useState("");
  const [helpArea, setHelpArea] = useState<string>(HELP_CENTER_AREAS[0]);
  const [journalismIssue, setJournalismIssue] = useState<string>(
    JOURNALISM_ISSUES[0],
  );
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showJournalism = helpArea === JOURNALISM_AREA;

  const fileLabel = useMemo(() => {
    if (files.length === 0) return null;
    return files.map((f) => f.name).join(", ");
  }, [files]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("email", email);
      body.set("help_area", helpArea);
      if (showJournalism) body.set("journalism_issue", journalismIssue);
      body.set("subject", subject);
      body.set("description", description);
      body.set("website_url", "");
      for (const file of files) {
        body.append("attachments", file);
      }

      const res = await fetch("/api/help-center/submit", {
        method: "POST",
        body,
      });
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
        <p className="text-[length:clamp(1.25rem,3vw,1.75rem)] font-bold text-[#141921]">
          Thank you
        </p>
        <p className="mt-3 text-[length:clamp(1rem,2.5vw,1.125rem)] leading-relaxed text-[#374151]">
          Your request was submitted. A member of our support staff will respond
          as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2.5">
        <label className={fieldLabel} htmlFor="hc-email">
          Your email address
        </label>
        <input
          id="hc-email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className={fieldLabel} htmlFor="hc-area">
          Pick the area you need help with, and we will find the best way to
          assist you
        </label>
        <div className="relative">
          <select
            id="hc-area"
            required
            className={selectClass}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath fill='%238f9ca3' d='M1 1l6 6 6-6'/%3E%3C/svg%3E")`,
            }}
            value={helpArea}
            onChange={(e) => setHelpArea(e.target.value)}
          >
            {HELP_CENTER_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showJournalism ? (
        <div className="flex flex-col gap-2.5">
          <label className={fieldLabel} htmlFor="hc-journalism">
            Journalism Issue (optional)
          </label>
          <select
            id="hc-journalism"
            className={selectClass}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath fill='%238f9ca3' d='M1 1l6 6 6-6'/%3E%3C/svg%3E")`,
            }}
            value={journalismIssue}
            onChange={(e) => setJournalismIssue(e.target.value)}
          >
            {JOURNALISM_ISSUES.map((issue) => (
              <option key={issue} value={issue}>
                {issue}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        <label className={fieldLabel} htmlFor="hc-subject">
          Subject
        </label>
        <input
          id="hc-subject"
          type="text"
          required
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className={fieldLabel} htmlFor="hc-description">
          Description
        </label>
        <textarea
          id="hc-description"
          required
          rows={7}
          className={`${inputClass} min-h-[160px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-[length:clamp(0.9rem,2.2vw,1.125rem)] leading-relaxed text-[#6b7280]">
          Please enter the details of your request. For typo corrections, include
          the article title or link. A member of our support staff will respond
          as soon as possible.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className={fieldLabel}>Attachments (optional)</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            setFiles(picked.slice(0, 5));
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const picked = Array.from(e.dataTransfer.files ?? []);
            setFiles(picked.slice(0, 5));
          }}
          className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-md border border-dashed border-[#d1d5db] bg-white px-4 py-6 text-center text-[length:clamp(0.95rem,2.3vw,1.2rem)] text-[#8f9ca3]"
        >
          <span>
            <span className="font-normal text-[#1b2a64] underline">
              Add file
            </span>
            {" or drop files here"}
          </span>
          {fileLabel ? (
            <span className="mt-2 block max-w-full truncate text-sm text-[#374151]">
              {fileLabel}
            </span>
          ) : null}
        </button>
      </div>

      {error ? (
        <p className="text-sm font-medium text-[#b80529]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-[58px] w-[209px] items-center justify-center rounded-lg bg-[#b80529] text-[length:clamp(1rem,2.5vw,1.15rem)] font-bold text-white hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
