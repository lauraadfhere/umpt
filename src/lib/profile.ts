// Server-only: reads PARSE_* keys. Never import from a Client Component.
import { unstable_cache } from "next/cache";
import { config, fileUrl, query, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { DEFAULT_PROFILE_SETTINGS, normaliseProfileSettings, type ProfileSettings } from "@/lib/profile-config";

const PROFILE_CLASS = "SiteProfile";
const PROFILE_KEY = "umpt-author";

/** Always uses the server write key so profile reads match what admin saves (public find often misses ACL-restricted rows). */
async function findRecord(): Promise<ParseRecord | null> {
  try {
    const { url } = config();
    const parameters = new URLSearchParams({ where: JSON.stringify({ key: PROFILE_KEY }), limit: "1" });
    const response = await fetch(`${url}/classes/${PROFILE_CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
    const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
    if (!response.ok) return null;
    return body.results?.[0] ?? null;
  } catch {
    return null;
  }
}

function fromRecord(record: ParseRecord): ProfileSettings {
  const avatarUrl = textValue(record.avatarUrl) || fileUrl(record.avatar) || fileUrl(record.avatarFile);
  const result = normaliseProfileSettings({ ...(record as Partial<Record<keyof ProfileSettings, unknown>>), avatarUrl });
  return "error" in result ? DEFAULT_PROFILE_SETTINGS : result;
}

async function loadProfileSettings(): Promise<ProfileSettings> {
  try {
    const record = await findRecord();
    return record ? fromRecord(record) : DEFAULT_PROFILE_SETTINGS;
  } catch {
    return DEFAULT_PROFILE_SETTINGS;
  }
}

/** Public read: falls back to the default editorial profile when nothing is saved. */
export const getProfileSettings = unstable_cache(loadProfileSettings, ["site-profile"], {
  revalidate: 30,
  tags: ["profile"],
});

/** Dashboard and admin API: bypass Next cache so uploads show immediately after reload. */
export async function getProfileSettingsUncached(): Promise<ProfileSettings> {
  return loadProfileSettings();
}

export async function saveProfileSettings(settings: ProfileSettings): Promise<ProfileSettings> {
  const { url } = config();
  const existing = await findRecord();
  const endpoint = existing ? `${url}/classes/${PROFILE_CLASS}/${existing.objectId}` : `${url}/classes/${PROFILE_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      key: PROFILE_KEY,
      ...settings,
      avatar: settings.avatarUrl || undefined,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}
