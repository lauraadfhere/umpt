// Shared by server and client: no Parse or secrets here.

export type LogoMode = "text" | "image";

export type LogoSettings = {
  mode: LogoMode;
  /** Wordmark short name shown next to the badge when mode is "text". */
  textShort: string;
  textLine1: string;
  textLine2: string;
  /** Letters inside the white circle (e.g. "DL"). */
  textBadge: string;
  textRoundel: string;
  textOrg1: string;
  textOrg2: string;
  headerUrl: string;
  footerUrl: string;
  headerWidth: number;
  footerWidth: number;
  ogImageUrl: string;
};

export const MIN_LOGO_WIDTH = 60;
export const MAX_LOGO_WIDTH = 400;

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  mode: "text",
  textShort: "UMPT",
  textLine1: "Digital",
  textLine2: "Library",
  textBadge: "DL",
  textRoundel: "umpt",
  textOrg1: "UMPT Publishing",
  textOrg2: "Platform",
  headerUrl: "",
  footerUrl: "",
  headerWidth: 160,
  footerWidth: 144,
  ogImageUrl: "",
};

function isSafeLogoUrl(url: string) {
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function clampWidth(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(MAX_LOGO_WIDTH, Math.max(MIN_LOGO_WIDTH, Math.round(number)));
}

function pickText(value: unknown, fallback: string, max = 40) {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, max);
}

/** Normalises settings from storage or a request. */
export function normaliseLogoSettings(input: Partial<Record<keyof LogoSettings, unknown>>): LogoSettings | { error: string } {
  const mode = input.mode === "image" ? "image" : "text";
  const headerUrl = typeof input.headerUrl === "string" ? input.headerUrl.trim() : "";
  const footerUrl = typeof input.footerUrl === "string" ? input.footerUrl.trim() : "";
  const ogImageUrl = typeof input.ogImageUrl === "string" ? input.ogImageUrl.trim() : "";

  if (!isSafeLogoUrl(headerUrl) || !isSafeLogoUrl(footerUrl) || !isSafeLogoUrl(ogImageUrl)) {
    return { error: "Each image must be a site path (/logo.png) or an http(s) link." };
  }
  if (mode === "image" && !headerUrl) {
    return { error: "Upload or paste a header image, or switch to the text logo." };
  }

  return {
    mode,
    textShort: pickText(input.textShort, DEFAULT_LOGO_SETTINGS.textShort, 24),
    textLine1: pickText(input.textLine1, DEFAULT_LOGO_SETTINGS.textLine1, 24),
    textLine2: pickText(input.textLine2, DEFAULT_LOGO_SETTINGS.textLine2, 24),
    textBadge: pickText(input.textBadge, DEFAULT_LOGO_SETTINGS.textBadge, 4).toUpperCase(),
    textRoundel: pickText(input.textRoundel, DEFAULT_LOGO_SETTINGS.textRoundel, 12),
    textOrg1: pickText(input.textOrg1, DEFAULT_LOGO_SETTINGS.textOrg1, 40),
    textOrg2: pickText(input.textOrg2, DEFAULT_LOGO_SETTINGS.textOrg2, 40),
    headerUrl,
    footerUrl: footerUrl || headerUrl,
    headerWidth: clampWidth(input.headerWidth, DEFAULT_LOGO_SETTINGS.headerWidth),
    footerWidth: clampWidth(input.footerWidth, DEFAULT_LOGO_SETTINGS.footerWidth),
    ogImageUrl,
  };
}
