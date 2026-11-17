"use client";

/* eslint-disable @next/next/no-img-element -- previews point at Parse/R2 hosts */
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { HomePostsAccentMode, HomePostsAccentSettings } from "@/lib/home-posts-accent-config";
import { MAX_ACCENT_OPACITY, MIN_ACCENT_OPACITY } from "@/lib/home-posts-accent-config";
import { uploadAdminImage } from "@/lib/client-upload";
import { Panel } from "@/components/ui/SectionTitle";
import { HandDrawnAccent } from "@/components/ui/HandDrawnAccent";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

export function HomePostsAccentForm({ initial }: { initial: HomePostsAccentSettings }) {
  const t = useTranslations("dashboard.homePosts");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof HomePostsAccentSettings>(key: K, value: HomePostsAccentSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      update("imageUrl", url);
      update("mode", "image");
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
      const response = await fetch("/api/admin/home-posts-accent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json().catch(() => ({}))) as HomePostsAccentSettings & { error?: string };
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

  const modes: { key: HomePostsAccentMode; label: string; hint: string }[] = [
    { key: "default", label: t("modeDefault"), hint: t("modeDefaultHint") },
    { key: "image", label: t("modeImage"), hint: t("modeImageHint") },
  ];

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
        <div className="relative min-h-[200px] overflow-hidden border border-rule bg-white">
          {settings.mode === "image" && settings.imageUrl ? (
            <img
              src={settings.imageUrl}
              alt=""
              className="pointer-events-none absolute -end-6 top-1/2 h-[min(440px,90%)] w-[min(400px,48vw)] -translate-y-1/2 object-contain rtl:-scale-x-100"
              style={{ opacity: settings.opacity / 100 }}
            />
          ) : (
            <HandDrawnAccent className="absolute -end-6 top-1/2 h-[min(440px,90%)] w-[min(400px,48vw)] -translate-y-1/2 rtl:-scale-x-100" />
          )}
          <div className="relative max-w-[360px] px-5 py-8">
            <p className="text-[18px] font-semibold text-text">{t("previewPostsTitle")}</p>
            <p className="mt-4 border border-rule bg-panel px-3 py-2 text-[13px] text-muted">{t("previewTabLatest")}</p>
            <p className="mt-1 border border-rule bg-panel px-3 py-2 text-[13px] text-muted">{t("previewTabViewed")}</p>
          </div>
        </div>
      </Panel>

      <Panel title={t("modeTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((mode) => (
            <label
              key={mode.key}
              className={`cursor-pointer border px-4 py-3 ${settings.mode === mode.key ? "border-text bg-white" : "border-rule bg-panel hover:border-text"}`}
            >
              <input
                type="radio"
                name="home-posts-accent-mode"
                value={mode.key}
                checked={settings.mode === mode.key}
                onChange={() => update("mode", mode.key)}
                className="sr-only"
              />
              <span className="block text-[15px] font-semibold text-text">{mode.label}</span>
              <span className="mt-1 block text-[13px] text-muted">{mode.hint}</span>
            </label>
          ))}
        </div>
      </Panel>

      {settings.mode === "image" && (
        <Panel title={t("imageTitle")}>
          <div className="space-y-4">
            {settings.imageUrl ? (
              <img
                src={settings.imageUrl}
                alt=""
                className="mx-auto max-h-48 w-auto max-w-full bg-chrome object-contain p-2"
                style={{ opacity: settings.opacity / 100 }}
              />
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
              <label htmlFor="home-posts-image-url" className={labelClass}>
                {t("imageUrl")}
              </label>
              <input
                id="home-posts-image-url"
                value={settings.imageUrl}
                onChange={(event) => update("imageUrl", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="home-posts-alt" className={labelClass}>
                {t("altText")}
              </label>
              <input id="home-posts-alt" value={settings.alt} onChange={(event) => update("alt", event.target.value)} className={inputClass} />
              <p className="mt-1 text-[12px] text-muted">{t("altHint")}</p>
            </div>
            <div>
              <label htmlFor="home-posts-opacity" className={labelClass}>
                {t("opacity")} ({MIN_ACCENT_OPACITY}–{MAX_ACCENT_OPACITY}%)
              </label>
              <input
                id="home-posts-opacity"
                type="range"
                min={MIN_ACCENT_OPACITY}
                max={MAX_ACCENT_OPACITY}
                value={settings.opacity}
                onChange={(event) => update("opacity", Number(event.target.value))}
                className="w-full max-w-md"
              />
              <p className="mt-1 text-[13px] text-muted">{settings.opacity}%</p>
            </div>
          </div>
        </Panel>
      )}

      <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}