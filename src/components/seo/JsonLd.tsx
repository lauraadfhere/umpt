import { jsonLd } from "@/lib/seo";

/** Structured data for search engines. The payload is serialised with "<" escaped, so it cannot break out of the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
