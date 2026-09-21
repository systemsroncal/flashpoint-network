import { jsonLdScriptContent } from "@/lib/seo/json-ld";

type Props = {
  data: unknown | unknown[];
};

export default function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(payload) }}
    />
  );
}
