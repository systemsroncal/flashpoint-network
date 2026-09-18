import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import NewsArticleView from "@/components/public/NewsArticleView";
import { requireStaffProfile } from "@/lib/auth/session";
import { withPublicAuthAccess } from "@/lib/auth/public-auth-gate";
import { getAdminPost } from "@/lib/admin/queries";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getArticleSidebar } from "@/lib/data/home";
import { getPaywallSettings } from "@/lib/paywall/settings";
import { getSiteName } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) return { title: "Preview not found" };
  return {
    title: `Preview: ${post.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function NewsPreviewPage({ params }: Props) {
  const profile = await requireStaffProfile();
  if (!profile) {
    const { id } = await params;
    redirect(
      withPublicAuthAccess(
        `/login?next=${encodeURIComponent(`/preview/news/${id}`)}`,
      ),
    );
  }

  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  const [sidebar, paywall, banners] = await Promise.all([
    getArticleSidebar(post.id),
    getPaywallSettings(),
    getBannerWidgetsBySlots([
      "article_above_latest_patriot",
      "article_above_latest_ofc",
    ]),
  ]);

  return (
    <div>
      <div className="sticky top-0 z-30 border-b border-amber-300/80 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
        <strong>Preview</strong>
        {" — "}
        {post.status === "published" ? "Published" : `Status: ${post.status}`}
        {" · "}
        Visible only to staff · {getSiteName()}
      </div>
      <NewsArticleView
        post={post}
        latest={sidebar.latest}
        podcasts={sidebar.podcasts}
        popular={sidebar.popular}
        previous={sidebar.previous}
        next={sidebar.next}
        paywall={paywall}
        paywallBypass
        banners={banners}
      />
    </div>
  );
}
