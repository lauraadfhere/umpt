// Server-only: reads PARSE_* keys. Never import from a Client Component.
import { unstable_cache } from "next/cache";
import { isParseConfigured, query, writeHeaders, config, type ParseRecord } from "@/lib/parse";
import { DEFAULT_FAVICON_SETTINGS, normaliseFaviconSettings, type FaviconSettings } from "@/lib/favicon-config";

const FAVICON_CLASS = "SiteFavicon";
const FAVICON_KEY = "umpt-favicon";
const FAVICON_QUERY_TIMEOUT_MS = 4_000;

async function findRecord(): Promise<ParseRecord | null> {
  if (!isParseConfigured()) return null;
  try {
    const rows = await query(
      FAVICON_CLASS,
      new URLSearchParams({ where: JSON.stringify({ key: FAVICON_KEY }), limit: "1" }),
      FAVICON_QUERY_TIMEOUT_MS,
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function fromRecord(record: ParseRecord): FaviconSettings {
  const result = normaliseFaviconSettings(record as Record<string, unknown>);
  return "error" in result ? DEFAULT_FAVICON_SETTINGS : result;
}

async function loadFaviconSettings(): Promise<FaviconSettings> {
  try {
    const record = await findRecord();
    return record ? fromRecord(record) : DEFAULT_FAVICON_SETTINGS;
  } catch {
    return DEFAULT_FAVICON_SETTINGS;
  }
}

/** Cached public read — avoids blocking every document on a live Parse round-trip. */
export const getFaviconSettings = unstable_cache(loadFaviconSettings, ["site-favicon"], {
  revalidate: 120,
  tags: ["favicon"],
});

/** Admin dashboard: fresh values after upload/save. */
export async function getFaviconSettingsUncached(): Promise<FaviconSettings> {
  return loadFaviconSettings();
}

export async function saveFaviconSettings(settings: FaviconSettings): Promise<FaviconSettings> {
  const { url } = config();
  const existing = await findRecord();
  const endpoint = existing ? `${url}/classes/${FAVICON_CLASS}/${existing.objectId}` : `${url}/classes/${FAVICON_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ key: FAVICON_KEY, ...settings }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}