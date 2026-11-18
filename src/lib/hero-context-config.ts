import {
  DEFAULT_IMAGE_ADJUSTMENTS,
  MAX_BLUR,
  MAX_BRIGHTNESS,
  MAX_CONTRAST,
  MAX_GRAYSCALE,
  MAX_HUE,
  MAX_SATURATION,
  MIN_BRIGHTNESS,
  MIN_CONTRAST,
  MIN_SATURATION,
} from "@/lib/hero-image-filters";

export type HeroBackgroundMode = "pattern" | "image";
export type HeroBackgroundFit = "cover" | "tile";

export type HeroContextSettings = {
  backgroundMode: HeroBackgroundMode;
  /** How the image fills the hero when mode is image. */
  backgroundFit: HeroBackgroundFit;
  backgroundImageUrl: string;
  /** Dark veil on the hero (0–55 pattern, 0–38 image). Lower = brighter background. */
  overlayOpacity: number;
  /** Replaces the page hero title when set (home and other hero pages). */
  titleOverride: string;
  /** Rich HTML shown in the dark context panel. */
  contextHtml: string;
  showContextPanel: boolean;
  /** Panel backdrop opacity (50–95). */
  panelOpacity: number;
  /** CSS filter adjustments when backgroundMode is image (see hero-image-filters.ts). */
  imageBrightness: number;
  imageContrast: number;
  imageSaturation: number;
  imageGrayscale: number;
  imageHueRotate: number;
  imageBlur: number;
};

export const MIN_HERO_OVERLAY = 0;
export const MAX_HERO_OVERLAY_PATTERN = 55;
/** Photo backgrounds stay brighter so faces and detail remain visible. */
export const MAX_HERO_OVERLAY_IMAGE = 38;

export function maxHeroOverlayForMode(mode: HeroBackgroundMode): number {
  return mode === "image" ? MAX_HERO_OVERLAY_IMAGE : MAX_HERO_OVERLAY_PATTERN;
}
export const MIN_PANEL_OPACITY = 50;
export const MAX_PANEL_OPACITY = 95;

export const DEFAULT_HERO_CONTEXT: HeroContextSettings = {
  backgroundMode: "pattern",
  backgroundFit: "cover",
  backgroundImageUrl: "",
  overlayOpacity: 14,
  titleOverride: "",
  contextHtml: "",
  showContextPanel: false,
  panelOpacity: 78,
  ...DEFAULT_IMAGE_ADJUSTMENTS,
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

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

export function normaliseHeroContextSettings(
  input: Partial<Record<keyof HeroContextSettings, unknown>>,
): HeroContextSettings | { error: string } {
  const backgroundMode = input.backgroundMode === "image" ? "image" : "pattern";
  const backgroundFit = input.backgroundFit === "tile" ? "tile" : "cover";
  const backgroundImageUrl = typeof input.backgroundImageUrl === "string" ? input.backgroundImageUrl.trim() : "";
  const titleOverride = typeof input.titleOverride === "string" ? input.titleOverride.trim().slice(0, 120) : "";
  const contextHtml = typeof input.contextHtml === "string" ? input.contextHtml.trim().slice(0, 12_000) : "";
  const showContextPanel = input.showContextPanel === true;

  if (!isSafeImageUrl(backgroundImageUrl)) {
    return { error: "Background must be a site path or an http(s) URL." };
  }
  if (backgroundMode === "image" && !backgroundImageUrl) {
    return { error: "Upload or paste a background image, or switch to the default pattern." };
  }

  return {
    backgroundMode,
    backgroundFit,
    backgroundImageUrl,
    overlayOpacity: clamp(
      input.overlayOpacity,
      MIN_HERO_OVERLAY,
      maxHeroOverlayForMode(backgroundMode),
      backgroundMode === "image" ? 14 : 22,
    ),
    titleOverride,
    contextHtml,
    showContextPanel,
    panelOpacity: clamp(input.panelOpacity, MIN_PANEL_OPACITY, MAX_PANEL_OPACITY, DEFAULT_HERO_CONTEXT.panelOpacity),
    imageBrightness: clamp(input.imageBrightness, MIN_BRIGHTNESS, MAX_BRIGHTNESS, DEFAULT_IMAGE_ADJUSTMENTS.imageBrightness),
    imageContrast: clamp(input.imageContrast, MIN_CONTRAST, MAX_CONTRAST, DEFAULT_IMAGE_ADJUSTMENTS.imageContrast),
    imageSaturation: clamp(input.imageSaturation, MIN_SATURATION, MAX_SATURATION, DEFAULT_IMAGE_ADJUSTMENTS.imageSaturation),
    imageGrayscale: clamp(input.imageGrayscale, 0, MAX_GRAYSCALE, DEFAULT_IMAGE_ADJUSTMENTS.imageGrayscale),
    imageHueRotate: clamp(input.imageHueRotate, 0, MAX_HUE, DEFAULT_IMAGE_ADJUSTMENTS.imageHueRotate),
    imageBlur: clamp(input.imageBlur, 0, MAX_BLUR, DEFAULT_IMAGE_ADJUSTMENTS.imageBlur),
  };
}