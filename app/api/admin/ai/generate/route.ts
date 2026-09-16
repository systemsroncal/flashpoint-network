import { NextResponse } from "next/server";
import {
  generateNewsArticle,
  ProviderHttpError,
  isNvidiaFunctionNotFound,
} from "@/lib/ai/generate";
import { getAiProviderKeys } from "@/lib/ai/keys";
import { getAdminCategories, getAdminTags } from "@/lib/admin/queries";
import { requireStaffProfile } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function httpStatusForError(err: unknown): number {
  if (err instanceof ProviderHttpError) {
    if (err.status === 404 || err.status === 410) return 400;
    if (err.status >= 400 && err.status < 600) return err.status;
    return 502;
  }
  const message = err instanceof Error ? err.message : "";
  if (
    /unauthorized|api key|configure|unknown model|not available for this API key|function not found|end of life|no longer available|pick another model/i.test(
      message,
    ) ||
    isNvidiaFunctionNotFound(message)
  ) {
    return 400;
  }
  return 502;
}

export async function POST(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Unauthorized — staff login required." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      prompt?: string;
      modelId?: string;
      fillTitle?: boolean;
      fillExcerpt?: boolean;
    };
    const prompt = String(body.prompt || "").trim();
    const modelId = String(body.modelId || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }
    if (!modelId) {
      return NextResponse.json({ error: "Select a model." }, { status: 400 });
    }

    const [keys, categories, tags] = await Promise.all([
      getAiProviderKeys(),
      getAdminCategories().catch(() => []),
      getAdminTags().catch(() => []),
    ]);

    const result = await generateNewsArticle({
      prompt,
      modelId,
      keys,
      fillTitle: Boolean(body.fillTitle),
      fillExcerpt: Boolean(body.fillExcerpt),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    });

    if (!result.bodyHtml?.trim()) {
      return NextResponse.json(
        { error: "Model returned empty body HTML." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      title: result.title ?? null,
      excerpt: result.excerpt ?? null,
      bodyHtml: result.bodyHtml,
      seoTitle: result.seoTitle ?? null,
      seoDescription: result.seoDescription ?? null,
      seoKeywords: result.seoKeywords ?? null,
      ogTitle: result.ogTitle ?? null,
      ogDescription: result.ogDescription ?? null,
      categoryId: result.categoryId ?? null,
      categorySlug: result.categorySlug ?? null,
      tagIds: result.tagIds ?? [],
      tagSlugs: result.tagSlugs ?? [],
      mock: Boolean(result.mock),
      usedModelId: result.usedModelId ?? null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed. Try again.";
    const status = httpStatusForError(err);
    console.error("[ai/generate]", status, message);
    return NextResponse.json({ error: message }, { status });
  }
}
