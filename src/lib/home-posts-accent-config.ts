// Shared by server and client: no Parse or secrets here.

export type HomePostsAccentMode = "default" | "image";

export type HomePostsAccentSettings = {
  mode: HomePostsAccentMode;
  imageUrl: string;
  /** Accessible description when mode is image. */
  alt: string;
  /** 0–100, applied as opacity on the decorative image. */
  opacity: number;
};

export const MIN_ACCENT_OPACITY = 20;
export const MAX_ACCENT_OPACITY = 100;
export const DEFAULT_HOME_POSTS_ACCENT: HomePostsAccentSettings = {
  mode: "default",
  imageUrl: "",
  alt: "",
  opacity: 55,
};

function isSafeImageUrl(url: string) {
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function clampOpacity(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(MAX_ACCENT_OPACITY, Math.max(MIN_ACCENT_OPACITY, Math.round(number)));
}

/** Normalises settings from storage or a request. */
export function normaliseHomePostsAccentSettings(
  input: Partial<Record<keyof HomePostsAccentSettings, unknown>>,
): HomePostsAccentSettings | { error: string } {
  const mode = input.mode === "image" ? "image" : "default";
  const imageUrl = typeof input.imageUrl === "string" ? input.imageUrl.trim() : "";
  const alt = typeof input.alt === "string" ? input.alt.trim().slice(0, 120) : "";

  if (!isSafeImageUrl(imageUrl)) {
    return { error: "Image must be a site path (/media.png) or an http(s) link." };
  }
  if (mode === "image" && !imageUrl) {
    return { error: "Upload or paste an image URL, or switch to the default illustration." };
  }

  return {
    mode,
    imageUrl,
    alt,
    opacity: clampOpacity(input.opacity, DEFAULT_HOME_POSTS_ACCENT.opacity),
  };
}