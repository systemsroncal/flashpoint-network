import JsonLd from "@/components/seo/JsonLd";
import { buildWebPageJsonLd } from "@/lib/seo/web-page-json-ld";

type Props = {
  title: string;
  description?: string;
  path: string;
};

export default function StaticWebPageJsonLd({ title, description, path }: Props) {
  return (
    <JsonLd
      data={buildWebPageJsonLd({ title, description, path })}
    />
  );
}
