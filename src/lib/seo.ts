import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Public address of the site, used for canonical links, the sitemap and structured data.
 * Production default is https://umpl.ca so robots/sitemap never fall back to localhost.
 */
export const PRODUCTION_SITE_URL = "https://umpl.ca";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000")
).replace(/\/+$/, "");
/** Origin used in robots.txt and sitemap.xml — never localhost. */
export const PUBLIC_SITE_URL = SITE_URL.includes("localhost") ? PRODUCTION_SITE_URL : SITE_URL;
export const SITE_HOST = PUBLIC_SITE_URL.replace(/^https?:\/\//, "").replace(/\/+$/, "");
export const SITE_NAME = "UMPT WORLD OF TOMORROW";

export const INDEXABLE_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

const OG_LOCALES: Record<string, string> = { en: "en_US", fr: "fr_FR", es: "es_ES", ar: "ar_AR" };

/** Absolute URL of a page; `path` is the part after the locale, e.g. "/posts/my-post" or "" for home. */
export function localeUrl(locale: string, path = "") {
  return `${SITE_URL}/${locale}${path}`;
}

/** hreflang map for a page. `locales` narrows it to the languages the page really exists in. */
export function languageAlternates(path: string, locales: readonly string[] = routing.locales) {
  const available = routing.locales.filter((locale) => locales.includes(locale));
  if (!available.length) return undefined;
  const fallback = available.includes(routing.defaultLocale) ? routing.defaultLocale : available[0];
  return {
    ...Object.fromEntries(available.map((locale) => [locale, localeUrl(locale, path)])),
    "x-default": localeUrl(fallback, path),
  };
}

/** Search engines cut descriptions at roughly this length, so longer text is trimmed at a word. */
export function metaDescription(value: string, max = 160) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).replace(/[\s,;:.–-]+$/, "")}…`;
}

type PageSeo = {
  locale: string;
  /** Path after the locale: "" for the home page, "/posts", "/posts/my-post". */
  path: string;
  /** Leave out on the home page so the site title is used. */
  title?: string;
  description: string;
  /** Languages the page exists in (defaults to all). */
  locales?: readonly string[];
  /** Locale whose URL is the canonical one, when this page shows text in another language. */
  canonicalLocale?: string;
  image?: string;
  index?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[]; section?: string; tags?: string[] };
};

/** Canonical link, hreflang alternates, Open Graph and Twitter tags for a public page. */
export function pageMetadata({ locale, path, title, description, locales, canonicalLocale, image, index = true, article }: PageSeo): Metadata {
  const url = localeUrl(locale, path);
  const summary = metaDescription(description);
  const shareTitle = title ?? SITE_NAME;
  const images = image ? [{ url: image }] : undefined;
  const available = routing.locales.filter((item) => !locales || locales.includes(item));

  return {
    ...(title ? { title } : {}),
    description: summary,
    alternates: {
      canonical: localeUrl(canonicalLocale ?? locale, path),
      languages: languageAlternates(path, locales),
    },
    openGraph: {
      type: article ? "article" : "website",
      siteName: SITE_NAME,
      title: shareTitle,
      description: summary,
      url,
      locale: OG_LOCALES[locale],
      alternateLocale: available.filter((item) => item !== locale).map((item) => OG_LOCALES[item]),
      images,
      ...(article ?? {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: shareTitle, description: summary, images: image ? [image] : undefined },
    robots: index ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS,
  };
}

/** Serialises structured data for a <script type="application/ld+json">; "<" is escaped so the text cannot close the tag. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function websiteJsonLd(locale: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: localeUrl(locale),
    description,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function contactPageJsonLd(locale: string, url: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: title,
    url,
    description: metaDescription(description),
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: localeUrl(locale) },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}

type ArticleSeo = {
  url: string;
  title: string;
  description: string;
  language: string;
  publishedAt: string | null;
  updatedAt: string | null;
  authors: string[];
  category: string;
  tags: string[];
  image: string;
  wordCount: number;
};

export function articleJsonLd(article: ArticleSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    headline: article.title.slice(0, 110),
    description: article.description,
    inLanguage: article.language,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.updatedAt || article.publishedAt ? { dateModified: article.updatedAt ?? article.publishedAt } : {}),
    ...(article.image ? { image: [article.image] } : {}),
    ...(article.authors.length ? { author: article.authors.map((name) => ({ "@type": "Person", name })) } : {}),
    ...(article.category ? { articleSection: article.category } : {}),
    ...(article.tags.length ? { keywords: article.tags.join(", ") } : {}),
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}