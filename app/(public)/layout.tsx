import AdSenseScript from "@/components/public/AdSenseScript";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";
import { getSiteName } from "@/lib/env";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = getSiteName();
  return (
    <>
      <AdSenseScript />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={siteName} />
    </>
  );
}
