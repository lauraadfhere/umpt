import { cache } from "react";
import { config, query, writeHeaders, type ParseRecord } from "@/lib/parse";
import {
  DEFAULT_HERO_CONTEXT,
  normaliseHeroContextSettings,
  type HeroContextSettings,
} from "@/lib/hero-context-config";

const CLASS = "SiteHeroContext";
const KEY = "umpt-home-hero";

async function findRecord(): Promise<ParseRecord | null> {
  try {
    const rows = await query(CLASS, new URLSearchParams({ where: JSON.stringify({ key: KEY }), limit: "1" }));
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function fromRecord(record: ParseRecord): HeroContextSettings {
  const parsed = normaliseHeroContextSettings(record as Record<string, unknown>);
  return "error" in parsed ? DEFAULT_HERO_CONTEXT : parsed;
}

export const getHeroContextSettings = cache(async (): Promise<HeroContextSettings> => {
  try {
    const record = await findRecord();
    return record ? fromRecord(record) : DEFAULT_HERO_CONTEXT;
  } catch {
    return DEFAULT_HERO_CONTEXT;
  }
});

export async function saveHeroContextSettings(settings: HeroContextSettings): Promise<HeroContextSettings> {
  const { url } = config();
  const existing = await findRecord();
  const endpoint = existing ? `${url}/classes/${CLASS}/${existing.objectId}` : `${url}/classes/${CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ key: KEY, ...settings }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}