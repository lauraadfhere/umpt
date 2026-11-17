// Server-only site pages (About, Contact, Privacy, …) stored in Parse.
import { config, query, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { sanitizeRichText } from "@/lib/richtext";

const PAGE_CLASS = "SitePage";
const OBJECT_ID = /^[A-Za-z0-9]{1,32}$/;

export const MANAGED_PAGES = [
  { slug: "about", title: "About" },
  { slug: "contact", title: "Contact" },
  { slug: "privacy", title: "Privacy" },
  { slug: "terms", title: "Terms" },
] as const;

export type ManagedPageSlug = (typeof MANAGED_PAGES)[number]["slug"];

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: "published" | "draft";
  updatedAt: string | null;
};

export type SitePageInput = {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: "published" | "draft";
};

function dateValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { iso?: unknown }).iso === "string") return (value as { iso: string }).iso;
  return null;
}

function toPage(record: ParseRecord): SitePage | null {
  const slug = textValue(record.slug).trim();
  const title = textValue(record.title).trim();
  if (!slug || !title) return null;
  return {
    id: record.objectId,
    slug,
    title,
    content: textValue(record.content),
    seoTitle: textValue(record.seoTitle),
    seoDescription: textValue(record.seoDescription),
    status: record.status === "draft" ? "draft" : "published",
    updatedAt: dateValue(record.updatedAt),
  };
}

async function adminQuery(parameters: URLSearchParams): Promise<ParseRecord[]> {
  const { url } = config();
  const response = await fetch(`${url}/classes/${PAGE_CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

export async function getManagedPages(): Promise<SitePage[]> {
  const bySlug = new Map<string, SitePage>();
  try {
    const records = await adminQuery(new URLSearchParams({ limit: "50", order: "slug" }));
    for (const record of records) {
      const page = toPage(record);
      if (page) bySlug.set(page.slug, page);
    }
  } catch {
    // Fall through to the known list so the dashboard still shows every managed page.
  }

  return MANAGED_PAGES.map((item) => {
    const existing = bySlug.get(item.slug);
    return (
      existing ?? {
        id: "",
        slug: item.slug,
        title: item.title,
        content: "",
        seoTitle: "",
        seoDescription: "",
        status: "draft" as const,
        updatedAt: null,
      }
    );
  });
}

export async function getSitePage(slug: string): Promise<SitePage | null> {
  const records = await adminQuery(new URLSearchParams({ where: JSON.stringify({ slug }), limit: "1" }));
  return records.map(toPage).find(Boolean) ?? null;
}

export async function getPublishedSitePage(slug: string): Promise<SitePage | null> {
  try {
    const rows = await query(PAGE_CLASS, new URLSearchParams({ where: JSON.stringify({ slug, status: "published" }), limit: "1" }));
    return rows.map(toPage).find(Boolean) ?? null;
  } catch {
    return null;
  }
}

export function readSitePageInput(body: unknown): { input: SitePageInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return { error: "A title is required." };
  if (title.length > 200) return { error: "Keep the title under 200 characters." };
  const rawContent = typeof raw.content === "string" ? raw.content : "";
  const { html: content, text } = sanitizeRichText(rawContent);
  if (!text) return { error: "Page content is required." };
  const seoTitle = typeof raw.seoTitle === "string" ? raw.seoTitle.trim().slice(0, 70) : "";
  const seoDescription = typeof raw.seoDescription === "string" ? raw.seoDescription.trim().slice(0, 180) : "";
  const status = raw.status === "draft" ? "draft" : "published";
  return { input: { title, content, seoTitle, seoDescription, status } };
}

export async function saveSitePage(slug: ManagedPageSlug, input: SitePageInput): Promise<{ id: string }> {
  const existing = await getSitePage(slug);
  const fields = { slug, title: input.title, content: input.content, seoTitle: input.seoTitle, seoDescription: input.seoDescription, status: input.status };
  const { url } = config();

  if (existing?.id && OBJECT_ID.test(existing.id)) {
    const response = await fetch(`${url}/classes/${PAGE_CLASS}/${existing.id}`, {
      method: "PUT",
      headers: writeHeaders(),
      body: JSON.stringify(fields),
      cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
    return { id: existing.id };
  }

  const response = await fetch(`${url}/classes/${PAGE_CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify(fields),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || `Parse returned ${response.status}.`);
  return { id: body.objectId };
}
