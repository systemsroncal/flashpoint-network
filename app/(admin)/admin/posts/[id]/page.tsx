import Link from "next/link";
import { Button, Typography } from "@mui/material";
import PageContainer from "@/components/admin/shared/PageContainer";
import PostForm from "@/components/admin/posts/PostForm";
import {
  getAdminCategories,
  getAdminPost,
  getAdminPostTagIds,
  getAdminTags,
} from "@/lib/admin/queries";
import { getSiteName, getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Named without the "EditPostPage" suffix used in the Turbopack overlay —
 * keeps the route clear while avoiding the well-known measure-label noise.
 * Missing posts render an in-page empty state instead of notFound() to avoid
 * the aborted-render path that triggers negative Performance.measure stamps
 * (Next.js #86060).
 */
export default async function Page({ params }: Props) {
  const { id } = await params;
  const [post, categories, tags, initialTagIds] = await Promise.all([
    getAdminPost(id),
    getAdminCategories(),
    getAdminTags(),
    getAdminPostTagIds(id).catch(() => [] as string[]),
  ]);

  if (!post) {
    return (
      <PageContainer title="News not found" description="That story id is missing or was deleted.">
        <Typography color="text.secondary" mb={2}>
          Id: {id}
        </Typography>
        <Button component={Link} href="/admin/posts" variant="contained">
          Back to News
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit news" description={post.title}>
      <PostForm
        post={post}
        categories={categories}
        tags={tags}
        initialTagIds={initialTagIds}
        siteName={getSiteName()}
        siteUrl={getSiteUrl()}
      />
    </PageContainer>
  );
}
