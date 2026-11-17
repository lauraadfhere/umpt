// Server-only admin CRUD for the Parse Book class.
import { config, query, textValue, writeHeaders, fileUrl, type ParseRecord } from "@/lib/parse";
import { slugify } from "@/lib/admin-posts";
import { detailsFromInput, detailsToParse, parseBookDetails } from "@/lib/book-details";
import { BUNDLED_BOOK_IMPORTS, type BookSeed } from "@/lib/book-seed";

export type Book = {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  year: string;
  excerpt: string;
  cover: string;
  buyUrl: string;
  isNew: boolean;
} & import("@/lib/book-details").BookDetails;

const BOOK_CLASS = "Book";
const OBJECT_ID = /^[A-Za-z0-9]{1,32}$/;

export type AdminBook = Book & {
  buyUrl: string;
  authorsText: string;
};

export type BookInput = BookSeed;

async function adminFetch(path: string, init: RequestInit = {}) {
  const { url } = config();
  const response = await fetch(`${url}/${path}`, { ...init, headers: { ...writeHeaders(), ...(init.headers ?? {}) }, cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; objectId?: string; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body;
}

function authorsValue(record: ParseRecord): string[] {
  const raw = record.authors ?? record.author;
  if (Array.isArray(raw)) return raw.map(textValue).filter(Boolean);
  const text = textValue(raw);
  return text ? text.split(/\s*,\s*/) : [];
}

function coverValue(record: ParseRecord): string {
  return fileUrl(record.cover) || fileUrl(record.coverImage) || textValue(record.cover) || textValue(record.coverImage);
}

function buyUrlValue(record: ParseRecord): string {
  return textValue(record.buyUrl) || textValue(record.amazonUrl) || textValue(record.storeUrl);
}

function toAdminBook(record: ParseRecord): AdminBook | null {
  const slug = textValue(record.slug);
  const title = textValue(record.title);
  if (!slug || !title) return null;
  const authors = authorsValue(record);
  const created = textValue(record.createdAt);
  const excerpt = textValue(record.excerpt) || textValue(record.description);
  return {
    id: record.objectId,
    slug,
    title,
    authors,
    authorsText: authors.join(", "),
    year: textValue(record.year) || created.slice(0, 4),
    excerpt,
    cover: coverValue(record),
    buyUrl: buyUrlValue(record),
    isNew: record.isNew === true,
    ...parseBookDetails(record, excerpt),
  };
}

function isSafeHttpUrl(url: string) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeImageUrl(url: string) {
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return isSafeHttpUrl(url);
}

export function readBookInput(body: unknown, existing?: AdminBook): BookInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return { error: "A title is required." };
  if (title.length > 220) return { error: "Keep the title under 220 characters." };

  const slugInput = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const slug = slugify(slugInput || title);

  const excerpt = typeof raw.excerpt === "string" ? raw.excerpt.trim().slice(0, 2000) : "";
  const year = typeof raw.year === "string" ? raw.year.trim().slice(0, 12) : typeof raw.year === "number" ? String(raw.year) : "";
  const cover = typeof raw.cover === "string" ? raw.cover.trim() : "";
  const buyUrl = typeof raw.buyUrl === "string" ? raw.buyUrl.trim() : typeof raw.amazonUrl === "string" ? raw.amazonUrl.trim() : "";
  if (cover && !isSafeImageUrl(cover)) return { error: "The cover must be a site path or an http(s) image link." };
  if (buyUrl && !isSafeHttpUrl(buyUrl)) return { error: "The buy link must start with http:// or https://." };

  const authors = Array.isArray(raw.authors)
    ? [...new Set(raw.authors.map((author) => String(author).trim()).filter(Boolean))].slice(0, 20)
    : typeof raw.authors === "string"
      ? [...new Set(raw.authors.split(",").map((author) => author.trim()).filter(Boolean))].slice(0, 20)
      : existing?.authors ?? [];

  const isNew = raw.isNew === true;
  const details = detailsFromInput(raw, excerpt);
  const sampleUrl = details.sampleUrl;
  if (sampleUrl && !isSafeHttpUrl(sampleUrl)) return { error: "The sample link must start with http:// or https://." };

  return { title, slug, authors, year, excerpt, cover, buyUrl, isNew, ...details };
}

function bookFields(input: BookInput) {
  return {
    title: input.title,
    slug: input.slug,
    authors: input.authors,
    year: input.year || undefined,
    excerpt: input.excerpt,
    cover: input.cover || undefined,
    coverImage: input.cover || undefined,
    buyUrl: input.buyUrl || undefined,
    amazonUrl: input.buyUrl || undefined,
    isNew: input.isNew,
    ...detailsToParse(input),
  };
}

export async function getAdminBooks(): Promise<AdminBook[]> {
  try {
    const body = await adminFetch(`classes/${BOOK_CLASS}?${new URLSearchParams({ order: "-updatedAt", limit: "200" })}`);
    return (body.results ?? []).map(toAdminBook).filter((book): book is AdminBook => book !== null);
  } catch {
    return [];
  }
}

export async function getAdminBookById(id: string): Promise<AdminBook | null> {
  if (!OBJECT_ID.test(id)) return null;
  try {
    const body = await adminFetch(`classes/${BOOK_CLASS}/${id}`);
    if (body && "objectId" in body) return toAdminBook(body as ParseRecord);
  } catch {
    return null;
  }
  return null;
}

export async function createAdminBook(input: BookInput): Promise<{ id: string }> {
  const created = await adminFetch(`classes/${BOOK_CLASS}`, { method: "POST", body: JSON.stringify(bookFields(input)) });
  if (!created.objectId) throw new Error("Parse did not return the new book id.");
  return { id: created.objectId };
}

export async function updateAdminBook(id: string, input: BookInput): Promise<void> {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid book id.");
  await adminFetch(`classes/${BOOK_CLASS}/${id}`, { method: "PUT", body: JSON.stringify(bookFields(input)) });
}

export async function deleteAdminBook(id: string): Promise<void> {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid book id.");
  await adminFetch(`classes/${BOOK_CLASS}/${id}`, { method: "DELETE" });
}

export async function importBundledBooks(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  let existingSlugs = new Set<string>();
  try {
    const rows = await query(BOOK_CLASS, new URLSearchParams({ keys: "slug", limit: "500" }));
    existingSlugs = new Set(rows.map((row) => textValue(row.slug)).filter(Boolean));
  } catch {
    // proceed — create may still work
  }

  for (const book of BUNDLED_BOOK_IMPORTS) {
    if (existingSlugs.has(book.slug)) {
      skipped += 1;
      continue;
    }
    await createAdminBook(book);
    existingSlugs.add(book.slug);
    created += 1;
  }
  return { created, skipped };
}