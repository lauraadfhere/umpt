import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPosts, type PostSummary } from "@/lib/posts";
import { languageAlternates, PUBLIC_SITE_URL } from "@/lib/seo";

// Built on request so a newly published post is listed straight away.
export const dynamic = "force-dynamic";

const PAGES = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/posts", changeFrequency: "daily", priority: 0.9 },
  { path: "/blogs", changeFrequency: "daily", priority: 0.85 },
  { path: "/proceedings", changeFrequency: "weekly", priority: 0.6 },
  { path: "/books", changeFrequency: "weekly", priority: 0.6 },
  { path: "/people", changeFrequency: "weekly", priority: 0.5 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/questions", changeFrequency: "daily", priority: 0.55 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
] as const;

function publicLocaleUrl(locale: string, path = "") {
  return `${PUBLIC_SITE_URL}/${locale}${path}`;
}

function publicLanguageAlternates(path: string, locales: readonly string[] = routing.locales) {
  const available = routing.locales.filter((locale) => locales.includes(locale));
  if (!available.length) return undefined;
  const fallback = available.includes(routing.defaultLocale) ? routing.defaultLocale : available[0];
  return {
    ...Object.fromEntries(available.map((locale) => [locale, publicLocaleUrl(locale, path)])),
    "x-default": publicLocaleUrl(fallback, path),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PAGES) {
    for (const locale of routing.locales) {
      entries.push({
        url: publicLocaleUrl(locale, page.path),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: publicLanguageAlternates(page.path) },
      });
    }
  }

  let posts: PostSummary[] = [];
  try {
    posts = await getPosts(routing.defaultLocale);
  } catch (error) {
    // The fixed pages are still worth serving when the backend is down.
    console.error("[sitemap] Posts could not be loaded:", error instanceof Error ? error.message : error);
  }

  for (const post of posts) {
    const path = `/posts/${post.slug}`;
    const modified = post.updatedAt ?? post.publishedAt;
    // Only the languages a post is written in are listed; the others show the same text and point back to these.
    for (const locale of routing.locales.filter((item) => post.languages.includes(item))) {
      entries.push({
        url: publicLocaleUrl(locale, path),
        ...(modified ? { lastModified: new Date(modified) } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: publicLanguageAlternates(path, post.languages) },
      });
    }
  }

  return entries;
}
