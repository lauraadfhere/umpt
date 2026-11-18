import type { HeroContextSettings } from "@/lib/hero-context-config";

export const MIN_IMAGE_ADJUST = 0;
export const MAX_BRIGHTNESS = 150;
export const MIN_BRIGHTNESS = 50;
export const MAX_CONTRAST = 200;
export const MIN_CONTRAST = 50;
export const MAX_SATURATION = 200;
export const MIN_SATURATION = 0;
export const MAX_GRAYSCALE = 100;
export const MAX_HUE = 360;
export const MAX_BLUR = 12;

export type HeroImageAdjustments = Pick<
  HeroContextSettings,
  "imageBrightness" | "imageContrast" | "imageSaturation" | "imageGrayscale" | "imageHueRotate" | "imageBlur"
>;

export const DEFAULT_IMAGE_ADJUSTMENTS: HeroImageAdjustments = {
  imageBrightness: 108,
  imageContrast: 102,
  imageSaturation: 100,
  imageGrayscale: 0,
  imageHueRotate: 0,
  imageBlur: 0,
};

export function heroBackgroundFilterCss(settings: Partial<HeroImageAdjustments>): string {
  const b = settings.imageBrightness ?? DEFAULT_IMAGE_ADJUSTMENTS.imageBrightness;
  const c = settings.imageContrast ?? DEFAULT_IMAGE_ADJUSTMENTS.imageContrast;
  const s = settings.imageSaturation ?? DEFAULT_IMAGE_ADJUSTMENTS.imageSaturation;
  const g = settings.imageGrayscale ?? DEFAULT_IMAGE_ADJUSTMENTS.imageGrayscale;
  const h = settings.imageHueRotate ?? DEFAULT_IMAGE_ADJUSTMENTS.imageHueRotate;
  const blur = settings.imageBlur ?? DEFAULT_IMAGE_ADJUSTMENTS.imageBlur;

  const parts = [
    `brightness(${b}%)`,
    `contrast(${c}%)`,
    `saturate(${s}%)`,
    g > 0 ? `grayscale(${g}%)` : "",
    h > 0 ? `hue-rotate(${h}deg)` : "",
    blur > 0 ? `blur(${blur}px)` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : "none";
}