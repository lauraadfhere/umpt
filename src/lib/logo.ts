// Server-only: reads PARSE_* keys. Never import from a Client Component.
import { cache } from "react";
import { config, query, writeHeaders, type ParseRecord } from "@/lib/parse";
import { DEFAULT_LOGO_SETTINGS, normaliseLogoSettings, type LogoSettings } from "@/lib/logo-config";

const LOGO_CLASS = "SiteLogo";
const LOGO_KEY = "umpt-primary";

async function findRecord(): Promise<ParseRecord | null> {
  try {
    const rows = await query(LOGO_CLASS, new URLSearchParams({ where: JSON.stringify({ key: LOGO_KEY }), limit: "1" }));
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function fromRecord(record: ParseRecord): LogoSettings {
  const legacy = typeof record.url === "string" ? record.url : "";
  const input: Record<string, unknown> = { ...record };
  if (legacy && typeof record.headerUrl !== "string") input.headerUrl = legacy;
  if (legacy && typeof record.footerUrl !== "string") input.footerUrl = legacy;
  const result = normaliseLogoSettings(input);
  return "error" in result ? DEFAULT_LOGO_SETTINGS : result;
}

/** Public read: falls back to the text wordmark when nothing is saved or Parse is down. */
export const getLogoSettings = cache(async (): Promise<LogoSettings> => {
  try {
    const record = await findRecord();
    return record ? fromRecord(record) : DEFAULT_LOGO_SETTINGS;
  } catch {
    return DEFAULT_LOGO_SETTINGS;
  }
});

export async function saveLogoSettings(settings: LogoSettings): Promise<LogoSettings> {
  const { url } = config();
  const existing = await findRecord();
  const endpoint = existing ? `${url}/classes/${LOGO_CLASS}/${existing.objectId}` : `${url}/classes/${LOGO_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ key: LOGO_KEY, ...settings }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}
