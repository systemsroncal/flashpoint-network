import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

/** Legacy /posts/:slug → /news/:slug */
export default async function LegacyPostsRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/news/${slug}`);
}
