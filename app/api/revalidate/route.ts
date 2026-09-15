import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * On-demand ISR helper. Protect with REVALIDATE_SECRET when set.
 * POST { paths: ["/","/news/slug"] } or ?path=/
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const header = request.headers.get("x-revalidate-secret");
    const query = request.nextUrl.searchParams.get("secret");
    if (header !== secret && query !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  let paths: string[] = [];
  try {
    const body = (await request.json()) as { paths?: string[]; path?: string };
    if (Array.isArray(body.paths)) paths = body.paths;
    else if (typeof body.path === "string") paths = [body.path];
  } catch {
    const single = request.nextUrl.searchParams.get("path");
    if (single) paths = [single];
  }

  if (paths.length === 0) paths = ["/", "/news", "/events"];

  for (const path of paths) {
    if (typeof path === "string" && path.startsWith("/")) {
      revalidatePath(path);
    }
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}
