// Server-only admin CRUD for the Parse Project class.
import { config, query, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { slugify } from "@/lib/admin-posts";
import { sanitizeRichText } from "@/lib/richtext";

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  acronym: string;
  year: string;
  contextHtml: string;
  reportHtml: string;
};

const PROJECT_CLASS = "Project";
const OBJECT_ID = /^[A-Za-z0-9]{1,32}$/;

export type ProjectInput = {
  title: string;
  slug: string;
  acronym: string;
  year: string;
  contextHtml: string;
  reportHtml: string;
};

async function adminFetch(path: string, init: RequestInit = {}) {
  const { url } = config();
  const response = await fetch(`${url}/${path}`, { ...init, headers: { ...writeHeaders(), ...(init.headers ?? {}) }, cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; objectId?: string; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body;
}

function toAdminProject(record: ParseRecord): AdminProject | null {
  const slug = textValue(record.slug);
  const title = textValue(record.title);
  if (!slug || !title) return null;
  const created = textValue(record.createdAt);
  const yearRaw = record.year;
  const year =
    typeof yearRaw === "number" && Number.isFinite(yearRaw)
      ? String(yearRaw)
      : textValue(yearRaw) || created.slice(0, 4);
  return {
    id: record.objectId,
    slug,
    title,
    acronym: textValue(record.acronym) || slug.split("-")[0]?.toUpperCase() || title.slice(0, 8),
    year,
    contextHtml: textValue(record.context) || textValue(record.contextHtml),
    reportHtml: textValue(record.report) || textValue(record.reportHtml),
  };
}

export function readProjectInput(body: unknown, existing?: AdminProject): ProjectInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return { error: "A title is required." };
  if (title.length > 220) return { error: "Keep the title under 220 characters." };

  const slugInput = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const slug = slugify(slugInput || title);
  if (!slug) return { error: "A URL slug is required." };

  const acronym = typeof raw.acronym === "string" ? raw.acronym.trim().slice(0, 32) : existing?.acronym ?? "";
  const year =
    typeof raw.year === "string"
      ? raw.year.trim().slice(0, 12)
      : typeof raw.year === "number"
        ? String(raw.year)
        : existing?.year ?? "";

  const contextHtml = sanitizeRichText(typeof raw.contextHtml === "string" ? raw.contextHtml : existing?.contextHtml ?? "").html;
  const reportHtml = sanitizeRichText(typeof raw.reportHtml === "string" ? raw.reportHtml : existing?.reportHtml ?? "").html;

  return { title, slug, acronym: acronym || slug.split("-")[0].toUpperCase(), year, contextHtml, reportHtml };
}

function projectFields(input: ProjectInput) {
  const yearNum = Number(input.year);
  return {
    title: input.title,
    slug: input.slug,
    acronym: input.acronym,
    year: Number.isFinite(yearNum) ? yearNum : input.year || undefined,
    context: input.contextHtml,
    contextHtml: input.contextHtml,
    report: input.reportHtml,
    reportHtml: input.reportHtml,
  };
}

export async function getAdminProjects(): Promise<AdminProject[]> {
  try {
    const body = await adminFetch(`classes/${PROJECT_CLASS}?${new URLSearchParams({ order: "acronym", limit: "500" })}`);
    return (body.results ?? []).map(toAdminProject).filter((project): project is AdminProject => project !== null);
  } catch {
    return [];
  }
}

export async function getAdminProjectById(id: string): Promise<AdminProject | null> {
  if (!OBJECT_ID.test(id)) return null;
  try {
    const body = await adminFetch(`classes/${PROJECT_CLASS}/${id}`);
    if (body && "objectId" in body) return toAdminProject(body as ParseRecord);
  } catch {
    return null;
  }
  return null;
}

export async function createAdminProject(input: ProjectInput): Promise<{ id: string }> {
  const created = await adminFetch(`classes/${PROJECT_CLASS}`, { method: "POST", body: JSON.stringify(projectFields(input)) });
  if (!created.objectId) throw new Error("Parse did not return the new project id.");
  return { id: created.objectId };
}

export async function updateAdminProject(id: string, input: ProjectInput): Promise<void> {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid project id.");
  await adminFetch(`classes/${PROJECT_CLASS}/${id}`, { method: "PUT", body: JSON.stringify(projectFields(input)) });
}

export async function deleteAdminProject(id: string): Promise<void> {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid project id.");
  await adminFetch(`classes/${PROJECT_CLASS}/${id}`, { method: "DELETE" });
}

/** One-time helper: import legacy Proceeding rows into Project when Project is empty. */
export async function importLegacyProceedings(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  let existingSlugs = new Set<string>();
  try {
    const rows = await query(PROJECT_CLASS, new URLSearchParams({ keys: "slug", limit: "500" }));
    existingSlugs = new Set(rows.map((row) => textValue(row.slug)).filter(Boolean));
  } catch {
    /* continue */
  }

  let legacy: ParseRecord[] = [];
  try {
    legacy = await query("Proceeding", new URLSearchParams({ limit: "500" }));
  } catch {
    return { created: 0, skipped: 0 };
  }

  for (const record of legacy) {
    const title = textValue(record.title);
    if (!title) continue;
    const acronym = textValue(record.acronym) || title.split(/\s+/)[0];
    const slug = slugify(acronym || title);
    if (existingSlugs.has(slug)) {
      skipped += 1;
      continue;
    }
    const year = Number(record.year) || new Date().getFullYear();
    await createAdminProject({
      title,
      slug,
      acronym,
      year: String(year),
      contextHtml: "",
      reportHtml: "",
    });
    existingSlugs.add(slug);
    created += 1;
  }
  return { created, skipped };
}