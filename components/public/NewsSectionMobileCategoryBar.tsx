"use client";

import { usePathname } from "next/navigation";
import MobileCategoryBar, {
  type MobileCategoryItem,
} from "@/components/public/MobileCategoryBar";
import { isNewsSectionPath } from "@/lib/navigation/news-section";

export default function NewsSectionMobileCategoryBar({
  items,
}: {
  items: MobileCategoryItem[];
}) {
  const pathname = usePathname() || "/";
  if (!isNewsSectionPath(pathname)) return null;
  return <MobileCategoryBar items={items} />;
}
