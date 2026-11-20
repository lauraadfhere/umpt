// Shared by server and client: no Parse or secrets here.

export type FaviconSettings = {
  faviconUrl: string;
  /** Optional larger icon for iOS home screen; falls back to faviconUrl. */
  appleTouchIconUrl: string;
};

export const DEFAULT_FAVICON_SETTINGS: FaviconSettings = {
  faviconUrl: "",
  appleTouchIconUrl: "",
};

/** Instant same-origin icon endpoints (served by app routes, not Parse). */
export const SITE_FAVICON_PATH = "/site-icon";
export const SITE_APPLE_ICON_PATH = "/site-icon?apple=1";
export const STATIC_FAVICON_SVG = "/favicon.svg";

function isSafeIconUrl(url: string) {
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function normaliseFaviconSettings(input: Partial<Record<keyof FaviconSettings, unknown>>): FaviconSettings | { error: string } {
  const faviconUrl = typeof input.faviconUrl === "string" ? input.faviconUrl.trim() : "";
  const appleTouchIconUrl = typeof input.appleTouchIconUrl === "string" ? input.appleTouchIconUrl.trim() : "";

  if (!isSafeIconUrl(faviconUrl) || !isSafeIconUrl(appleTouchIconUrl)) {
    return { error: "Each icon must be a site path (/favicon.png) or an http(s) link." };
  }

  return { faviconUrl, appleTouchIconUrl };
}

/**
 * Next.js metadata.icons — always same-origin via /site-icon (proxies CMS upload or falls back).
 * Do not also list /favicon.svg here: browsers often prefer that static SVG and ignore the custom icon.
 */
export function faviconMetadataIcons(cacheKey = "1") {
  const v = encodeURIComponent(cacheKey);
  const iconUrl = `${SITE_FAVICON_PATH}?v=${v}`;
  const appleUrl = `${SITE_FAVICON_PATH}?apple=1&v=${v}`;
  return {
    icon: [{ url: iconUrl }],
    apple: [{ url: appleUrl }],
    shortcut: [{ url: iconUrl }],
  };
}

export function resolveIconSource(settings: FaviconSettings, apple: boolean): string {
  if (apple) {
    return settings.appleTouchIconUrl || settings.faviconUrl;
  }
  return settings.faviconUrl;
}