// Server-only: reads PARSE_* keys. Never import from a Client Component.
import { cache } from "react";
import { config, query, writeHeaders, type ParseRecord } from "@/lib/parse";
import {
  DEFAULT_HOME_POSTS_ACCENT,
  normaliseHomePostsAccentSettings,
  type HomePostsAccentSettings,
} from "@/lib/home-posts-accent-config";

const ACCENT_CLASS = "SiteHomePostsAccent";
const ACCENT_KEY = "umpt-home-posts";

async function findRecord(): Promise<ParseRecord | null> {
  try {
    const rows = await query(ACCENT_CLASS, new URLSearchParams({ where: JSON.stringify({ key: ACCENT_KEY }), limit: "1" }));
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function fromRecord(record: ParseRecord): HomePostsAccentSettings {
  const result = normaliseHomePostsAccentSettings(record as Record<string, unknown>);
  return "error" in result ? DEFAULT_HOME_POSTS_ACCENT : result;
}

/** Public read for the home page posts band. */
export const getHomePostsAccentSettings = cache(async (): Promise<HomePostsAccentSettings> => {
  try {
    const record = await findRecord();
    return record ? fromRecord(record) : DEFAULT_HOME_POSTS_ACCENT;
  } catch {
    return DEFAULT_HOME_POSTS_ACCENT;
  }
});

export async function saveHomePostsAccentSettings(settings: HomePostsAccentSettings): Promise<HomePostsAccentSettings> {
  const { url } = config();
  const existing = await findRecord();
  const endpoint = existing ? `${url}/classes/${ACCENT_CLASS}/${existing.objectId}` : `${url}/classes/${ACCENT_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ key: ACCENT_KEY, ...settings }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}