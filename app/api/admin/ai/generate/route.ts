import { NextResponse } from "next/server";
import { generateNewsArticle } from "@/lib/ai/generate";
import { getAiProviderKeys } from "@/lib/ai/keys";
import { requireStaffProfile } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

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

    const keys = await getAiProviderKeys();
    const result = await generateNewsArticle({
      prompt,
      modelId,
      keys,
      fillTitle: Boolean(body.fillTitle),
      fillExcerpt: Boolean(body.fillExcerpt),
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
      mock: Boolean(result.mock),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed. Try again.";
    const status =
      /unauthorized|api key|configure/i.test(message)
        ? 400
        : /end of life|no longer available|unknown model/i.test(message)
          ? 400
          : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
