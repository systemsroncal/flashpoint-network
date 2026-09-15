import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichHtml from "@/components/public/RichHtml";
import { getMinistryProgramBySlug } from "@/lib/data/ministry-programs";
import { getSiteName } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getMinistryProgramBySlug(slug);
  if (!program) return { title: "Not found" };
  return {
    title: program.title,
    description: program.excerpt ?? program.description ?? undefined,
  };
}

export default async function MinistryProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getMinistryProgramBySlug(slug);
  if (!program) notFound();

  const siteName = getSiteName();
  const blurb =
    program.description ||
    program.excerpt ||
    `${program.title} on FlashPoint Television Network.`;

  return (
    <article className="bg-white text-black">
      <div className="border-b border-black/10 bg-[var(--fpn-navy)] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 lg:px-10">
          <Link
            href="/ministry-programs"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/55 transition hover:text-white"
          >
            ← Ministry Programs
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--fpn-rojo)]">
            {siteName}
          </p>
          <h1 className="mt-2 max-w-3xl font-article text-3xl font-black tracking-tight md:text-5xl">
            {program.title}
          </h1>
          {program.schedule_note ? (
            <p className="mt-3 text-sm font-semibold text-white/75">
              {program.schedule_note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 md:grid-cols-[minmax(0,420px)_1fr] md:px-8 lg:px-10">
        <div className="relative aspect-square overflow-hidden rounded-[12px] bg-[#0B1220]">
          {program.featured_image_url ? (
            <Image
              src={program.featured_image_url}
              alt={program.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width:768px) 100vw, 420px"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold uppercase tracking-wide text-white/40">
              Ministry
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-base leading-7 text-black/75 md:text-lg">{blurb}</p>
          {program.body ? (
            <div className="mt-6">
              <RichHtml html={program.body} />
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ministry-programs"
              className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
            >
              All ministry programs
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
