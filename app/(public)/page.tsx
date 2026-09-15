import HomeView from "@/components/public/HomeView";
import { getHomePayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomePayload();
  return <HomeView data={data} />;
}
