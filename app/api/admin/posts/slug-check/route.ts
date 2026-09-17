import { NextResponse } from "next/server";
import { requireStaffProfile } from "@/lib/auth/session";
import { isAdminPostSlugAvailable } from "@/lib/admin/queries";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/posts/slug-check?slug=…&excludeId=…
 * Returns whether a news slug is available.
 */
export async function GET(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Unauthorized — staff login required." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const raw = String(searchParams.get("slug") || "").trim();
  const excludeId = String(searchParams.get("excludeId") || "").trim() || null;
  const slug = slugify(raw);

  if (!slug) {
    return NextResponse.json({
      slug: "",
      available: false,
      error: "Slug is required.",
    });
  }

  try {
    const available = await isAdminPostSlugAvailable(slug, excludeId);
    return NextResponse.json({
      slug,
      available,
      error: available
        ? null
        : "This slug is already used by another post. Choose a different permalink.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        slug,
        available: false,
        error: err instanceof Error ? err.message : "Slug check failed",
      },
      { status: 500 },
    );
  }
}
