// Shared by server and client: no Parse or secrets here.

export type ProfileSettings = {
  displayName: string;
  affiliation: string;
  bio: string;
  avatarUrl: string;
  website: string;
  subjects: string[];
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  displayName: "UMPT Editorial",
  affiliation: "UMPT WORLD OF TOMORROW",
  bio: "",
  avatarUrl: "",
  website: "",
  subjects: [],
};

function isSafeUrl(url: string) {
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function pickText(value: unknown, fallback: string, max: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, max);
}

/** Normalises profile settings from storage or a request. */
export function normaliseProfileSettings(input: Partial<Record<keyof ProfileSettings, unknown>>): ProfileSettings | { error: string } {
  const avatarUrl = typeof input.avatarUrl === "string" ? input.avatarUrl.trim() : "";
  const website = typeof input.website === "string" ? input.website.trim() : "";
  if (!isSafeUrl(avatarUrl) || !isSafeUrl(website)) {
    return { error: "Avatar and website must be a site path or an http(s) link." };
  }

  const subjects = Array.isArray(input.subjects)
    ? [...new Set(input.subjects.map((item) => String(item).trim().toLowerCase()).filter(Boolean))].slice(0, 12)
    : typeof input.subjects === "string"
      ? [...new Set(input.subjects.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))].slice(0, 12)
      : [];

  const displayName = pickText(input.displayName, DEFAULT_PROFILE_SETTINGS.displayName, 80);
  if (!displayName) return { error: "A display name is required." };

  return {
    displayName,
    affiliation: pickText(input.affiliation, "", 160),
    bio: pickText(input.bio, "", 800),
    avatarUrl,
    website,
    subjects,
  };
}

export function namesMatch(a: string, b: string) {
  return a.replace(/\s+/g, " ").trim().toLowerCase() === b.replace(/\s+/g, " ").trim().toLowerCase();
}
