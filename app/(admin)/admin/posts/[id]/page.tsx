import { notFound } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import PostForm from "@/components/admin/posts/PostForm";
import { getAdminCategories, getAdminPost } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getAdminPost(id),
    getAdminCategories(),
  ]);
  if (!post) notFound();

  return (
    <PageContainer title="Edit post" description={post.title}>
      <PostForm post={post} categories={categories} />
    </PageContainer>
  );
}
