import AdSenseScript from "@/components/public/AdSenseScript";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdSenseScript />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
