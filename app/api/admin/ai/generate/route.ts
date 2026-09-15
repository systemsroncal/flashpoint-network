import { NextResponse } from "next/server";
import { generateNewsArticle } from "@/lib/ai/generate";
import { getAiProviderKeys } from "@/lib/ai/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
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

    return NextResponse.json({
      title: result.title ?? null,
      excerpt: result.excerpt ?? null,
      bodyHtml: result.bodyHtml,
      // Do not echo keys or raw provider payloads
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Generation failed. Try again.",
      },
      { status: 400 },
    );
  }
}
