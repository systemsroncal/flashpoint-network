import { NextResponse } from "next/server";
import { ProviderHttpError } from "@/lib/ai/generate";
import {
  defaultPageSeoModelId,
  suggestPublicPageSeo,
} from "@/lib/ai/page-seo";
import { getAiProviderKeys } from "@/lib/ai/keys";
import { getPublicPageByKey } from "@/lib/public-pages/registry";
import { requireStaffProfile } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { pageKey?: string; modelId?: string };
    const pageKey = String(body.pageKey || "").trim();
    const def = getPublicPageByKey(pageKey);
    if (!def) {
      return NextResponse.json({ error: "Unknown page." }, { status: 400 });
    }

    const keys = await getAiProviderKeys();
    const modelId =
      String(body.modelId || "").trim() || defaultPageSeoModelId(keys);

    const result = await suggestPublicPageSeo({
      pageLabel: def.label,
      path: def.path,
      defaultTitle: def.defaultTitle,
      defaultDescription: def.defaultDescription,
      modelId,
      keys,
    });

    return NextResponse.json(result);
  } catch (err) {
    const status =
      err instanceof ProviderHttpError
        ? err.status >= 400 && err.status < 600
          ? err.status
          : 502
        : 502;
    const message = err instanceof Error ? err.message : "Suggestion failed.";
    return NextResponse.json({ error: message }, { status });
  }
}
