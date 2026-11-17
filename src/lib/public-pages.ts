import { getPublishedSitePage, type ManagedPageSlug, type SitePage } from "@/lib/site-pages";

export type ResolvedSitePage = {
  slug: ManagedPageSlug;
  title: string;
  contentHtml: string;
  seoTitle: string;
  seoDescription: string;
  fromCms: boolean;
};

/** Published CMS page when available; otherwise the translated fallback for a stable public URL. */
export async function resolveSitePage(
  slug: ManagedPageSlug,
  fallback: { title: string; bodyHtml: string; metaDescription: string },
): Promise<ResolvedSitePage> {
  let cms: SitePage | null = null;
  try {
    cms = await getPublishedSitePage(slug);
  } catch {
    cms = null;
  }

  if (cms?.content) {
    return {
      slug,
      title: cms.title || fallback.title,
      contentHtml: cms.content,
      seoTitle: cms.seoTitle || cms.title || fallback.title,
      seoDescription: cms.seoDescription || fallback.metaDescription,
      fromCms: true,
    };
  }

  return {
    slug,
    title: fallback.title,
    contentHtml: fallback.bodyHtml,
    seoTitle: fallback.title,
    seoDescription: fallback.metaDescription,
    fromCms: false,
  };
}

export function plainParagraphsToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${part.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`)
    .join("");
}
