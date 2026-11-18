"use client";

/* eslint-disable @next/next/no-img-element -- previews use Parse/R2 URLs */
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { HeroBackgroundFit, HeroBackgroundMode, HeroContextSettings } from "@/lib/hero-context-config";
import {
  MAX_PANEL_OPACITY,
  MIN_HERO_OVERLAY,
  MIN_PANEL_OPACITY,
  maxHeroOverlayForMode,
} from "@/lib/hero-context-config";
import {
  DEFAULT_IMAGE_ADJUSTMENTS,
  heroBackgroundFilterCss,
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
import { uploadAdminImage } from "@/lib/client-upload";
import { HeroContextPanel } from "@/components/reading/HeroContextPanel";
import { CompactRichTextEditor } from "@/components/reading/CompactRichTextEditor";
import { Panel } from "@/components/ui/SectionTitle";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

function PreviewArt() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 180" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" strokeLinecap="round">
        <path d="M-40 230 L230 -40" stroke="#7b7b7b" strokeWidth="70" />
        <path d="M120 230 L330 20 L540 230" stroke="#7a7a7a" strokeWidth="46" />
        <path d="M760 240 L980 20 L1200 240" stroke="#7b7b7b" strokeWidth="64" />
      </g>
    </svg>
  );
}

export function HeroContextForm({ initial }: { initial: HeroContextSettings }) {
  const t = useTranslations("dashboard.heroContext");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof HeroContextSettings>(key: K, value: HeroContextSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      update("backgroundImageUrl", url);
      update("backgroundMode", "image");
    } catch {
      setError(tDash("networkError"));
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/admin/hero-context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json().catch(() => ({}))) as HeroContextSettings & { error?: string };
      if (!response.ok) {
        setError(data.error || t("saveError"));
        return;
      }
      setSettings(data);
      setSaved(true);
      router.refresh();
    } catch {
      setError(tDash("networkError"));
    } finally {
      setBusy(false);
    }
  }

  const modes: { key: HeroBackgroundMode; label: string; hint: string }[] = [
    { key: "pattern", label: t("modePattern"), hint: t("modePatternHint") },
    { key: "image", label: t("modeImage"), hint: t("modeImageHint") },
  ];

  const previewTitle = settings.titleOverride.trim() || t("previewDefaultTitle");
  const useImage = settings.backgroundMode === "image" && settings.backgroundImageUrl;
  const previewTiled = useImage && settings.backgroundFit === "tile";
  const overlayPct = settings.overlayOpacity;
  const overlayMax = maxHeroOverlayForMode(settings.backgroundMode);
  const useImagePreview = settings.backgroundMode === "image" && settings.backgroundImageUrl;

  const fits: { key: HeroBackgroundFit; label: string; hint: string }[] = [
    { key: "cover", label: t("fitCover"), hint: t("fitCoverHint") },
    { key: "tile", label: t("fitTile"), hint: t("fitTileHint") },
  ];

  const previewFilter = useImage ? heroBackgroundFilterCss(settings) : undefined;

  function resetImageAdjustments() {
    setSettings((current) => ({ ...current, ...DEFAULT_IMAGE_ADJUSTMENTS }));
    setSaved(false);
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {error && (
        <p role="alert" className="border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="border-s-4 border-edition bg-panel px-4 py-3 text-[14px] text-text">
          {t("saved")}
        </p>
      )}

      <p className="max-w-2xl text-[14px] leading-[1.55] text-muted">{t("hint")}</p>

      <Panel title={t("previewTitle")}>
        <div className="relative overflow-hidden bg-hero text-white">
          {useImage ? (
            <div
              className="pointer-events-none absolute inset-0 min-h-[200px] scale-[1.02]"
              style={{
                backgroundImage: `url(${settings.backgroundImageUrl})`,
                backgroundSize: previewTiled ? "120px 120px" : "cover",
                backgroundRepeat: previewTiled ? "repeat" : "no-repeat",
                backgroundPosition: "center",
                filter: previewFilter,
              }}
              aria-hidden
            />
          ) : (
            <PreviewArt />
          )}
          {useImagePreview ? (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(100deg, rgba(0,0,0,${overlayPct * 0.009}) 0%, rgba(0,0,0,${overlayPct * 0.004}) 42%, rgba(0,0,0,${overlayPct * 0.0065}) 100%)`,
              }}
              aria-hidden
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: overlayPct / 100 }} aria-hidden />
          )}
          <div className="relative flex min-h-[200px] flex-col justify-center gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[28px] font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] md:text-[34px]">{previewTitle}</p>
              {settings.showContextPanel && settings.contextHtml ? (
                <HeroContextPanel html={settings.contextHtml} panelOpacity={settings.panelOpacity} />
              ) : null}
            </div>
            <div className="h-[42px] w-full max-w-[320px] shrink-0 bg-white/95 px-3 text-[13px] italic text-[#9a9a9a] shadow-md md:max-w-[400px]">
              {t("previewSearchPlaceholder")}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={t("titleTitle")}>
        <label htmlFor="hero-title-override" className={labelClass}>
          {t("titleOverride")}
        </label>
        <input
          id="hero-title-override"
          value={settings.titleOverride}
          onChange={(event) => update("titleOverride", event.target.value)}
          className={inputClass}
          placeholder={t("titleOverridePlaceholder")}
          maxLength={120}
        />
        <p className="mt-1 text-[12px] text-muted">{t("titleOverrideHint")}</p>
      </Panel>

      <Panel title={t("modeTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((mode) => (
            <label
              key={mode.key}
              className={`cursor-pointer border px-4 py-3 ${settings.backgroundMode === mode.key ? "border-text bg-white" : "border-rule bg-panel hover:border-text"}`}
            >
              <input
                type="radio"
                name="hero-context-bg-mode"
                value={mode.key}
                checked={settings.backgroundMode === mode.key}
                onChange={() => update("backgroundMode", mode.key)}
                className="sr-only"
              />
              <span className="block text-[15px] font-semibold text-text">{mode.label}</span>
              <span className="mt-1 block text-[13px] text-muted">{mode.hint}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="hero-overlay" className={labelClass}>
            {t("overlay")} ({MIN_HERO_OVERLAY}–{overlayMax}%)
          </label>
          <input
            id="hero-overlay"
            type="range"
            min={MIN_HERO_OVERLAY}
            max={overlayMax}
            value={Math.min(settings.overlayOpacity, overlayMax)}
            onChange={(event) => update("overlayOpacity", Number(event.target.value))}
            className="w-full max-w-md"
          />
          <p className="mt-1 text-[13px] text-muted">{settings.overlayOpacity}%</p>
        </div>
      </Panel>

      {settings.backgroundMode === "image" && (
        <Panel title={t("imageTitle")}>
          <div className="space-y-4">
            {settings.backgroundImageUrl ? (
              <img src={settings.backgroundImageUrl} alt="" className="mx-auto max-h-40 w-full max-w-lg object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center border border-dashed border-rule text-[12px] text-muted">{t("noImage")}</div>
            )}
            <label className="inline-block cursor-pointer border border-rule bg-panel-head px-3 py-2 text-[13px] font-semibold hover:bg-white">
              {uploading ? t("uploading") : t("uploadImage")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void upload(file);
                }}
              />
            </label>
            <div>
              <label htmlFor="hero-bg-url" className={labelClass}>
                {t("imageUrl")}
              </label>
              <input
                id="hero-bg-url"
                value={settings.backgroundImageUrl}
                onChange={(event) => update("backgroundImageUrl", event.target.value)}
                className={inputClass}
              />
            </div>
            <Link href="/dashboard/uploads" className="text-[13px] text-link hover:underline">
              {t("uploadsHint")}
            </Link>
            <div>
              <p className={labelClass}>{t("fitTitle")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {fits.map((fit) => (
                  <label
                    key={fit.key}
                    className={`cursor-pointer border px-4 py-3 ${settings.backgroundFit === fit.key ? "border-text bg-white" : "border-rule bg-panel hover:border-text"}`}
                  >
                    <input
                      type="radio"
                      name="hero-context-bg-fit"
                      value={fit.key}
                      checked={settings.backgroundFit === fit.key}
                      onChange={() => update("backgroundFit", fit.key)}
                      className="sr-only"
                    />
                    <span className="block text-[14px] font-semibold text-text">{fit.label}</span>
                    <span className="mt-1 block text-[12px] text-muted">{fit.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 border border-rule bg-white p-4">
              <p className="text-[15px] font-semibold text-text">{t("adjustTitle")}</p>
              <p className="mb-4 mt-1 text-[13px] text-muted">{t("adjustHint")}</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="hero-img-brightness" className={labelClass}>
                    {t("brightness")} ({MIN_BRIGHTNESS}–{MAX_BRIGHTNESS}%)
                  </label>
                  <input
                    id="hero-img-brightness"
                    type="range"
                    min={MIN_BRIGHTNESS}
                    max={MAX_BRIGHTNESS}
                    value={settings.imageBrightness}
                    onChange={(e) => update("imageBrightness", Number(e.target.value))}
                    className="w-full max-w-md"
                  />
                  <p className="mt-1 text-[12px] text-muted">{settings.imageBrightness}%</p>
                </div>
                <div>
                  <label htmlFor="hero-img-contrast" className={labelClass}>
                    {t("contrast")} ({MIN_CONTRAST}–{MAX_CONTRAST}%)
                  </label>
                  <input
                    id="hero-img-contrast"
                    type="range"
                    min={MIN_CONTRAST}
                    max={MAX_CONTRAST}
                    value={settings.imageContrast}
                    onChange={(e) => update("imageContrast", Number(e.target.value))}
                    className="w-full max-w-md"
                  />
                  <p className="mt-1 text-[12px] text-muted">{settings.imageContrast}%</p>
                </div>
                <div>
                  <label htmlFor="hero-img-saturation" className={labelClass}>
                    {t("saturation")} ({MIN_SATURATION}–{MAX_SATURATION}%)
                  </label>
                  <input
                    id="hero-img-saturation"
                    type="range"
                    min={MIN_SATURATION}
                    max={MAX_SATURATION}
                    value={settings.imageSaturation}
                    onChange={(e) => update("imageSaturation", Number(e.target.value))}
                    className="w-full max-w-md"
                  />
                  <p className="mt-1 text-[12px] text-muted">{settings.imageSaturation}%</p>
                </div>
                <div>
                  <label htmlFor="hero-img-grayscale" className={labelClass}>
                    {t("grayscale")} (0–{MAX_GRAYSCALE}%)
                  </label>
                  <input
                    id="hero-img-grayscale"
                    type="range"
                    min={0}
                    max={MAX_GRAYSCALE}
                    value={settings.imageGrayscale}
                    onChange={(e) => update("imageGrayscale", Number(e.target.value))}
                    className="w-full max-w-md"
                  />
                  <p className="mt-1 text-[12px] text-muted">{settings.imageGrayscale}%</p>
                </div>
                <div>
                  <label htmlFor="hero-img-hue" className={labelClass}>
                    {t("hue")} (0–{MAX_HUE}°)
                  </label>
                  <input
                    id="hero-img-hue"
                    type="range"
                    min={0}
                    max={MAX_HUE}
                    value={settings.imageHueRotate}
                    onChange={(e) => update("imageHueRotate", Number(e.target.value))}
                    className="w-full max-w-md"
                  />
                  <p className="mt-1 text-[12px] text-muted">{settings.imageHueRotate}°</p>
                </div>
                <div>
                  <label htmlFor="hero-img-blur" className={labelClass}>
                    {t("blur")} (0–{MAX_BLUR}px)
                  </label>
                  <input
                    id="hero-img-blur"
                    type="range"
                    min={0}
                    max={MAX_BLUR}
                    value={settings.imageBlur}
                    onChange={(e) => update("imageBlur", Number(e.target.value))}
                    className="w-full max-w-md"
                  />
                  <p className="mt-1 text-[12px] text-muted">{settings.imageBlur}px</p>
                </div>
                <button
                  type="button"
                  onClick={resetImageAdjustments}
                  className="border border-rule bg-panel px-3 py-2 text-[13px] font-semibold hover:bg-white"
                >
                  {t("resetAdjustments")}
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel title={t("contextTitle")}>
        <label className="mb-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={settings.showContextPanel}
            onChange={(event) => update("showContextPanel", event.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block text-[14px] font-semibold text-text">{t("showPanel")}</span>
            <span className="mt-0.5 block text-[13px] text-muted">{t("showPanelHint")}</span>
          </span>
        </label>
        {settings.showContextPanel && (
          <>
            <CompactRichTextEditor
              id="hero-context-html"
              label={t("contextBody")}
              placeholder={t("contextPlaceholder")}
              value={settings.contextHtml}
              onChange={(html) => update("contextHtml", html)}
            />
            <div className="mt-4">
              <label htmlFor="hero-panel-opacity" className={labelClass}>
                {t("panelOpacity")} ({MIN_PANEL_OPACITY}–{MAX_PANEL_OPACITY}%)
              </label>
              <input
                id="hero-panel-opacity"
                type="range"
                min={MIN_PANEL_OPACITY}
                max={MAX_PANEL_OPACITY}
                value={settings.panelOpacity}
                onChange={(event) => update("panelOpacity", Number(event.target.value))}
                className="w-full max-w-md"
              />
              <p className="mt-1 text-[13px] text-muted">{settings.panelOpacity}%</p>
            </div>
          </>
        )}
      </Panel>

      <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}