import { getProceedings, latestFirst } from "@/lib/catalog";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

export async function GET(request: Request) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
  const { proceedings, source } = await getProceedings();

  const items = latestFirst(proceedings)
    .slice(0, 30)
    .map((item) => {
      const link = `${origin}/en/proceedings?q=${encodeURIComponent(item.acronym)}`;
      // Sample records carry placeholder dates, so only real Parse records get a pubDate.
      const date = source === "parse" && item.addedAt ? new Date(item.addedAt) : null;
      return [
        "    <item>",
        `      <title>${escapeXml(`${item.acronym} ’${String(item.year).slice(-2)}: ${item.title}`)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="false">${escapeXml(item.id)}</guid>`,
        date && !Number.isNaN(date.getTime()) ? `      <pubDate>${date.toUTCString()}</pubDate>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>UMPT Digital Library: recently loaded proceedings</title>
    <link>${escapeXml(`${origin}/en/proceedings`)}</link>
    <description>The newest proceedings added to the UMPT Digital Library.</description>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
