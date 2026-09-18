import {
  getLegalParagraphs,
  isLegalSectionHeading,
  type LegalPageKey,
  LEGAL_PAGES,
} from "@/lib/static-pages/legal";
import { resolveLegalPlaceholders } from "@/lib/static-pages/contact-info";

export default function LegalDocumentView({ pageKey }: { pageKey: LegalPageKey }) {
  const meta = LEGAL_PAGES[pageKey];
  const paragraphs = getLegalParagraphs(pageKey);

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14 lg:px-10">
      <h1
        className="font-bold tracking-[-0.02em] text-[#141921] text-[2.35rem] leading-[1.1] md:text-[3.2rem] md:leading-[1.05]"
      >
        {meta.title}
      </h1>
      <p className="mt-4 text-xl font-bold tracking-tight text-[#000028] md:text-[1.82rem] md:leading-snug">
        Last Updated: {meta.lastUpdated}
      </p>

      <div className="mt-10 md:mt-12">
        {paragraphs.map((paragraph, index) => {
          const text = resolveLegalPlaceholders(paragraph);
          const section = isLegalSectionHeading(text);
          return (
            <p
              key={`${index}-${text.slice(0, 24)}`}
              className={
                section
                  ? "mt-8 mb-3 text-[18px] font-bold leading-7 text-[#000028] md:mt-10 md:text-[22px] md:leading-8"
                  : "mb-4 text-[18px] font-normal leading-7 text-[#000028] md:text-[22px] md:leading-[28px]"
              }
            >
              {text}
            </p>
          );
        })}
      </div>
    </article>
  );
}
