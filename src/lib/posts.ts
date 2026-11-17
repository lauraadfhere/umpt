// Server-only: reads the posts already published on the shared Parse Server.
// Never import from a Client Component.
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { fileUrl, query, textValue, type ParseRecord } from "@/lib/parse";
import { looksLikeHtml, parseRichText, richTextToPlain } from "@/lib/richtext";

/** The classes the daily-essential CMS publishes into, in order of precedence when a slug repeats. */
const POST_CLASSES = ["Article", "BlogPost", "Note"] as const;
const PUBLISHED_STATUSES = new Set(["published", "publish", "live", "public"]);
/** Language of a post that carries no `locale` of its own. */
export const DEFAULT_POST_LOCALE = "en";

type Translation = { title: string; excerpt: string; content: string };

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authors: string[];
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
  coverImage: string;
  coverCaption: string;
  /** Times the post has been opened, as counted by the backend. */
  views: number;
  /** Language the title, excerpt and body are actually written in for this reader. */
  language: string;
  /** Every language this post exists in: its own plus its translations. */
  languages: string[];
};

export type Post = PostSummary & { content: string };

type StoredPost = Post & { translations: Record<string, Translation> };

function dateValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { iso?: unknown }).iso === "string") return (value as { iso: string }).iso;
  return null;
}

function contentValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join("\n\n");
  return textValue(value);
}

function listValue(value: unknown): string[] {
  const items = Array.isArray(value) ? value.map(textValue) : textValue(value).split(",");
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

/**
 * Most posts store the CMS account that saved them (a login handle such as "site_admin") in
 * `author`. Only values written like a person's name are shown; account handles stay private.
 */
function bylines(value: unknown): string[] {
  return listValue(value).filter((name) => !/^[a-z0-9._@-]+$/.test(name));
}

/** Categories are stored either as plain text or as a pointer to a Category row. */
function categoryValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const category = value as Record<string, unknown>;
    return textValue(category.name) || textValue(category.slug);
  }
  return "";
}

function imageValue(record: ParseRecord): string {
  for (const key of ["coverImage", "imageUrl", "image"]) {
    const url = fileUrl(record[key]);
    if (/^https?:\/\//i.test(url)) return url;
  }
  return "";
}

/** Summaries are shown as plain text, so any markup stored in them is reduced to its words. */
function plainText(value: string): string {
  const text = /[<&]/.test(value) ? richTextToPlain(parseRichText(value)) : value;
  return text.replace(/\s+/g, " ").trim();
}

function firstParagraph(content: string): string {
  if (!content) return "";
  if (looksLikeHtml(content)) {
    const paragraph = parseRichText(content).find((node) => node.type === "element" && node.tag === "p");
    return paragraph ? plainText(richTextToPlain([paragraph])) : "";
  }
  return plainText(content.split(/\r?\n\s*\r?\n/)[0]?.replace(/^#{1,6}\s+/, "") ?? "");
}

function translationsValue(value: unknown): Record<string, Translation> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, Translation> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const translation = { title: textValue(item.title), excerpt: textValue(item.excerpt), content: contentValue(item.content) };
    if (translation.title || translation.content) result[key.toLowerCase()] = translation;
  }
  return result;
}

function isPublished(record: ParseRecord): boolean {
  const status = textValue(record.status).toLowerCase();
  return !status || PUBLISHED_STATUSES.has(status);
}

function toPost(record: ParseRecord): StoredPost | null {
  const slug = textValue(record.slug).trim();
  const title = plainText(textValue(record.title));
  if (!slug || !title || !isPublished(record)) return null;

  const content = contentValue(record.content);
  const translations = translationsValue(record.translations);
  const language = textValue(record.locale).toLowerCase() || DEFAULT_POST_LOCALE;

  return {
    id: record.objectId,
    slug,
    title,
    excerpt: plainText(textValue(record.excerpt)) || firstParagraph(content),
    content,
    category: categoryValue(record.category),
    authors: bylines(record.authors ?? record.author),
    tags: listValue(record.tags),
    publishedAt: dateValue(record.publishedAt) || dateValue(record.createdAt),
    updatedAt: dateValue(record.updatedAt),
    coverImage: imageValue(record),
    coverCaption: plainText(textValue(record.imageCaption)),
    views: Math.max(0, Number(record.viewCount ?? record.views) || 0),
    language,
    languages: [...new Set([language, ...Object.keys(translations)])],
    translations,
  };
}

/** The post in the reader's language only when a full body translation exists — avoids mixed title/locale switching. */
function localize(stored: StoredPost, locale: string): Post {
  const { translations, ...post } = stored;
  const translation = translations[locale];
  if (!translation || locale === post.language) return post;
  const translatedBody = translation.content?.trim();
  if (!translatedBody) return post;
  return {
    ...post,
    title: plainText(translation.title) || post.title,
    excerpt: plainText(translation.excerpt) || post.excerpt,
    content: translatedBody,
    language: locale,
  };
}

function summarize(post: Post): PostSummary {
  const { content, ...summary } = post;
  void content;
  return summary;
}

/**
 * Runs one query against every post class. A class that cannot be read is skipped and logged as
 * long as another one answers; when none answers the error is thrown so pages can say so.
 */
async function queryPostClasses(parameters: Record<string, string>): Promise<ParseRecord[]> {
  const results = await Promise.allSettled(POST_CLASSES.map((className) => query(className, new URLSearchParams(parameters))));
  const records: ParseRecord[] = [];
  let firstError: unknown;
  const failures: { className: string; message: string }[] = [];

  results.forEach((result, index) => {
    const className = POST_CLASSES[index];
    if (result.status === "fulfilled") {
      records.push(...result.value);
    } else {
      const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
      firstError ??= result.reason;
      failures.push({ className, message });
    }
  });

  if (!records.length) {
    for (const failure of failures) {
      console.error(`[posts] Could not read the ${failure.className} class:`, failure.message);
    }
    throw firstError instanceof Error ? firstError : new Error("The post classes could not be read.");
  }

  for (const failure of failures) {
    console.warn(`[posts] Skipped ${failure.className}: ${failure.message}`);
  }
  return records;
}

/** Cached across requests so a slow or timing-out class does not block every home page load. */
const fetchSummaries = unstable_cache(
  async (): Promise<StoredPost[]> => {
    const records = await queryPostClasses({ order: "-publishedAt", limit: "300", include: "category", excludeKeys: "content" });
    const unique = new Map<string, StoredPost>();
    for (const record of records) {
      const post = toPost(record);
      if (post && !unique.has(post.slug)) unique.set(post.slug, post);
    }
    return [...unique.values()].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  },
  ["umpt-post-summaries"],
  { revalidate: 60, tags: ["posts"] },
);

const loadSummaries = cache(async (): Promise<StoredPost[]> => fetchSummaries());

const loadPost = cache(async (slug: string): Promise<StoredPost | null> => {
  const records = await queryPostClasses({ where: JSON.stringify({ slug }), order: "-publishedAt", limit: "5", include: "category" });
  for (const record of records) {
    const post = toPost(record);
    if (post) return post;
  }
  return null;
});

/** Every published post, newest first. Throws when the backend cannot be reached. */
export async function getPosts(locale: string): Promise<PostSummary[]> {
  return (await loadSummaries()).map((post) => summarize(localize(post, locale)));
}

export type ReadingData = { post: Post; previous: PostSummary | null; next: PostSummary | null };

/** One published post with its neighbours in the list (previous = newer, next = older). */
export async function getPost(slug: string, locale: string): Promise<ReadingData | null> {
  const [stored, posts] = await Promise.all([loadPost(slug), getPosts(locale)]);
  if (!stored) return null;
  const index = posts.findIndex((post) => post.slug === stored.slug);
  return {
    post: localize(stored, locale),
    previous: index > 0 ? posts[index - 1] : null,
    next: index !== -1 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}
