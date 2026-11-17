// Server-only admin post writes against the shared Article / BlogPost / Note classes.
import { config, query, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { DEFAULT_POST_LOCALE, type Post, type PostSummary } from "@/lib/posts";
import { sanitizeRichText } from "@/lib/richtext";
import { routing } from "@/i18n/routing";

const POST_CLASSES = ["Article", "BlogPost", "Note"] as const;
const DEFAULT_POST_CLASS = "Article";
const OBJECT_ID = /^[A-Za-z0-9]{1,32}$/;

export type CategoryOption = { id: string; name: string; slug: string };
export type PostTranslation = { title: string; excerpt: string; content: string };

export type AdminPost = Post & {
  status: "published" | "draft";
  locale: string | null;
  translations: Record<string, PostTranslation>;
  className: string;
  seoTitle: string;
  seoDescription: string;
};

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locale: string | null;
  status: "published" | "draft";
  category: string | null;
  publishedAt: string | null;
  coverImage: string | null;
  coverCaption: string;
  authors: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  translations: Record<string, PostTranslation>;
};

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "") || `post-${Date.now()}`
  );
}

function isSafeImageUrl(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function dateValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { iso?: unknown }).iso === "string") return (value as { iso: string }).iso;
  return null;
}

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
    const value = record[key];
    if (typeof value === "string" && /^https?:\/\//i.test(value)) return value;
    if (value && typeof value === "object" && typeof (value as { url?: unknown }).url === "string") {
      const url = (value as { url: string }).url;
      if (/^https?:\/\//i.test(url)) return url;
    }
  }
  return "";
}

function translationsValue(value: unknown): Record<string, PostTranslation> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, PostTranslation> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const translation = {
      title: textValue(item.title),
      excerpt: textValue(item.excerpt),
      content: textValue(item.content),
    };
    if (translation.title || translation.content) result[key.toLowerCase()] = translation;
  }
  return result;
}

function toAdminPost(record: ParseRecord, className: string): AdminPost | null {
  const slug = textValue(record.slug).trim();
  const title = textValue(record.title).trim();
  if (!slug || !title) return null;
  const content = textValue(record.content);
  const translations = translationsValue(record.translations);
  const language = textValue(record.locale).toLowerCase() || DEFAULT_POST_LOCALE;
  const status = textValue(record.status).toLowerCase() === "draft" ? "draft" : "published";
  return {
    id: record.objectId,
    slug,
    title,
    excerpt: textValue(record.excerpt),
    content,
    category: categoryValue(record.category),
    authors: Array.isArray(record.authors)
      ? [...new Set(record.authors.map(textValue).map((name) => name.trim()).filter(Boolean))]
      : textValue(record.author)
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name && !/^[a-z0-9._@-]+$/.test(name)),
    tags: Array.isArray(record.tags) ? record.tags.map(textValue).filter(Boolean) : [],
    publishedAt: dateValue(record.publishedAt) || dateValue(record.createdAt),
    updatedAt: dateValue(record.updatedAt),
    coverImage: imageValue(record),
    coverCaption: textValue(record.imageCaption),
    views: Math.max(0, Number(record.viewCount ?? record.views) || 0),
    language,
    languages: [...new Set([language, ...Object.keys(translations)])],
    status,
    locale: textValue(record.locale).toLowerCase() || null,
    translations,
    className,
    seoTitle: textValue(record.seoTitle),
    seoDescription: textValue(record.seoDescription),
  };
}

async function adminFetch(path: string, init: RequestInit = {}) {
  const { url } = config();
  const response = await fetch(`${url}/${path}`, { ...init, headers: { ...writeHeaders(), ...(init.headers ?? {}) }, cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; objectId?: string; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body;
}

export async function getCategories(): Promise<CategoryOption[]> {
  try {
    const rows = await query("Category", new URLSearchParams({ limit: "100", order: "name" }));
    return rows
      .map((record) => ({ id: record.objectId, name: textValue(record.name), slug: textValue(record.slug) }))
      .filter((category) => category.name || category.slug);
  } catch {
    return [];
  }
}

export async function getAdminPosts(): Promise<PostSummary[]> {
  const results = await Promise.all(
    POST_CLASSES.map(async (className) => {
      try {
        const body = await adminFetch(`classes/${className}?${new URLSearchParams({ order: "-updatedAt", limit: "500", include: "category", excludeKeys: "content" })}`);
        return (body.results ?? []).map((record) => toAdminPost(record, className)).filter((post): post is AdminPost => Boolean(post));
      } catch {
        return [] as AdminPost[];
      }
    }),
  );

  const unique = new Map<string, AdminPost>();
  for (const post of results.flat()) {
    if (!unique.has(post.slug)) unique.set(post.slug, post);
  }
  return [...unique.values()]
    .sort((a, b) => (b.updatedAt ?? b.publishedAt ?? "").localeCompare(a.updatedAt ?? a.publishedAt ?? ""))
    .map(({ content, translations, className, locale, seoTitle, seoDescription, status, ...summary }) => {
      void content;
      void translations;
      void className;
      void locale;
      void seoTitle;
      void seoDescription;
      return { ...summary, status } as PostSummary & { status: "published" | "draft" };
    });
}

/** Full admin list including draft status for the dashboard table. */
export async function getAdminPostRows(): Promise<(PostSummary & { status: "published" | "draft"; className: string })[]> {
  const results = await Promise.all(
    POST_CLASSES.map(async (className) => {
      try {
        const body = await adminFetch(`classes/${className}?${new URLSearchParams({ order: "-updatedAt", limit: "500", include: "category", excludeKeys: "content" })}`);
        return (body.results ?? []).map((record) => toAdminPost(record, className)).filter((post): post is AdminPost => Boolean(post));
      } catch {
        return [] as AdminPost[];
      }
    }),
  );
  const unique = new Map<string, AdminPost>();
  for (const post of results.flat()) {
    if (!unique.has(post.id)) unique.set(post.id, post);
  }
  return [...unique.values()]
    .sort((a, b) => (b.updatedAt ?? b.publishedAt ?? "").localeCompare(a.updatedAt ?? a.publishedAt ?? ""))
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      authors: post.authors,
      tags: post.tags,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      coverImage: post.coverImage,
      coverCaption: post.coverCaption,
      views: post.views,
      language: post.language,
      languages: post.languages,
      status: post.status,
      className: post.className,
    }));
}

export async function getAdminPostById(id: string): Promise<AdminPost | null> {
  if (!OBJECT_ID.test(id)) return null;
  for (const className of POST_CLASSES) {
    try {
      const body = await adminFetch(`classes/${className}/${id}`);
      if (body && "objectId" in body) {
        return toAdminPost(body as ParseRecord, className);
      }
    } catch {
      // Try the next class.
    }
  }
  return null;
}

async function categoryPointer(name: string) {
  const rows = await query("Category", new URLSearchParams({ where: JSON.stringify({ $or: [{ name }, { slug: name }] }), limit: "1" }));
  const match = rows[0];
  return match ? { __type: "Pointer", className: "Category", objectId: match.objectId } : null;
}

async function postFields(input: PostInput) {
  const fields: Record<string, unknown> = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    status: input.status,
    translations: input.translations,
    coverImage: input.coverImage,
    imageCaption: input.coverCaption || null,
    authors: input.authors,
    tags: input.tags,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };
  if (input.locale) fields.locale = input.locale;
  if (input.publishedAt) fields.publishedAt = { __type: "Date", iso: input.publishedAt };
  if (input.category) {
    const pointer = await categoryPointer(input.category);
    if (pointer) fields.category = pointer;
    else fields.category = input.category;
  } else {
    fields.category = null;
  }
  return fields;
}

export function readPostInput(body: unknown, existingPublishedAt: string | null = null): { input: PostInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return { error: "A title is required." };
  if (title.length > 200) return { error: "Keep the title under 200 characters." };

  const rawContent = typeof raw.content === "string" ? raw.content : "";
  const { html: content, text } = sanitizeRichText(rawContent);
  if (!text) return { error: "Post content is required." };

  const slugInput = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const status = raw.status === "draft" ? "draft" : "published";
  const localeRaw = typeof raw.locale === "string" ? raw.locale.trim().toLowerCase() : "";
  const locale = (routing.locales as readonly string[]).includes(localeRaw) ? localeRaw : null;
  const category = typeof raw.category === "string" && raw.category.trim() ? raw.category.trim() : null;
  const excerpt = typeof raw.excerpt === "string" ? raw.excerpt.trim().slice(0, 500) : "";
  const publishedAt = status === "published" ? existingPublishedAt || new Date().toISOString() : null;
  const coverImage = typeof raw.coverImage === "string" && raw.coverImage.trim() ? raw.coverImage.trim() : null;
  if (coverImage && !isSafeImageUrl(coverImage)) return { error: "The cover must be a site path or an http(s) image link." };
  const coverCaption = typeof raw.coverCaption === "string" ? raw.coverCaption.trim().slice(0, 200) : "";
  const seoTitle = typeof raw.seoTitle === "string" ? raw.seoTitle.trim().slice(0, 70) : "";
  const seoDescription = typeof raw.seoDescription === "string" ? raw.seoDescription.trim().slice(0, 180) : "";
  const tags = Array.isArray(raw.tags)
    ? [...new Set(raw.tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 20)
    : typeof raw.tags === "string"
      ? [...new Set(raw.tags.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20)
      : [];
  const authors = Array.isArray(raw.authors)
    ? [...new Set(raw.authors.map((author) => String(author).trim()).filter(Boolean))].slice(0, 20)
    : typeof raw.authors === "string"
      ? [...new Set(raw.authors.split(",").map((author) => author.trim()).filter(Boolean))].slice(0, 20)
      : [];

  const translations: Record<string, PostTranslation> = {};
  if (raw.translations && typeof raw.translations === "object" && !Array.isArray(raw.translations)) {
    for (const [key, value] of Object.entries(raw.translations as Record<string, unknown>)) {
      const code = key.trim().toLowerCase();
      if (!(routing.locales as readonly string[]).includes(code)) continue;
      if (!value || typeof value !== "object") continue;
      const entry = value as Record<string, unknown>;
      const entryTitle = typeof entry.title === "string" ? entry.title.trim() : "";
      const entryExcerpt = typeof entry.excerpt === "string" ? entry.excerpt.trim() : "";
      const rawEntryContent = typeof entry.content === "string" ? entry.content : "";
      const { html: entryContent, text: entryText } = sanitizeRichText(rawEntryContent);
      if (entryTitle.length > 200) return { error: `Keep the ${code} title under 200 characters.` };
      if (!entryTitle && !entryText) continue;
      translations[code] = { title: entryTitle, excerpt: entryExcerpt, content: entryContent };
    }
  }

  return {
    input: {
      title,
      slug: slugify(slugInput || title),
      content,
      excerpt,
      locale,
      status,
      category,
      publishedAt,
      coverImage,
      coverCaption,
      authors,
      tags,
      seoTitle,
      seoDescription,
      translations,
    },
  };
}

export async function createAdminPost(input: PostInput): Promise<{ id: string }> {
  const created = await adminFetch(`classes/${DEFAULT_POST_CLASS}`, { method: "POST", body: JSON.stringify(await postFields(input)) });
  if (!created.objectId) throw new Error("Parse did not return the new post id.");
  return { id: created.objectId };
}

export async function updateAdminPost(id: string, input: PostInput): Promise<void> {
  const existing = await getAdminPostById(id);
  if (!existing) throw new Error("That post no longer exists.");
  await adminFetch(`classes/${existing.className}/${id}`, { method: "PUT", body: JSON.stringify(await postFields(input)) });
}

export async function deleteAdminPost(id: string): Promise<void> {
  const existing = await getAdminPostById(id);
  if (!existing) throw new Error("That post no longer exists.");
  await adminFetch(`classes/${existing.className}/${id}`, { method: "DELETE" });
}
