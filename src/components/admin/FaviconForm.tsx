"use client";

/* eslint-disable @next/next/no-img-element -- icon previews point at Parse/R2 hosts */
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { FaviconSettings } from "@/lib/favicon-config";
import { uploadAdminImage } from "@/lib/client-upload";
import { Panel } from "@/components/ui/SectionTitle";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";
const ICON_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon";

export function FaviconForm({ initial }: { initial: FaviconSettings }) {
  const t = useTranslations("dashboard.favicon");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"favicon" | "apple" | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof FaviconSettings>(key: K, value: FaviconSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function persist(next: FaviconSettings) {
    const response = await fetch("/api/admin/favicon", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = (await response.json().catch(() => ({}))) as FaviconSettings & { error?: string };
    if (!response.ok) throw new Error(data.error || t("saveError"));
    setSettings(data);
    setSaved(true);
    router.refresh();
    return data;
  }

  async function upload(kind: "favicon" | "apple", file: File) {
    setError("");
    setSaved(false);
    setUploading(kind);
    try {
      const url = await uploadAdminImage(file);
      const next =
        kind === "favicon"
          ? { ...settings, faviconUrl: url }
          : { ...settings, appleTouchIconUrl: url };
      setSettings(next);
      await persist(next);
    } catch (err) {
      setError(err instanceof Error && err.message !== tDash("networkError") ? err.message : tDash("networkError"));
    } finally {
      setUploading(null);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await persist(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : tDash("networkError"));
    } finally {
      setBusy(false);
    }
  }

  const previewSrc = settings.faviconUrl
    ? `/site-icon?v=${encodeURIComponent(settings.faviconUrl.slice(-48))}`
    : "";
  const applePreviewSrc = settings.appleTouchIconUrl
    ? `/site-icon?apple=1&v=${encodeURIComponent(settings.appleTouchIconUrl.slice(-48))}`
    : previewSrc;

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

      <Panel title={t("faviconTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("faviconHint")}</p>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex size-16 items-center justify-center border border-rule bg-panel">
            {previewSrc ? (
              <img src={previewSrc} alt="" className="max-h-12 max-w-12 object-contain" />
            ) : (
              <span className="text-[11px] text-muted">{t("noIcon")}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <label className="inline-block cursor-pointer border border-rule bg-panel-head px-3 py-2 text-[13px] font-semibold hover:bg-white">
              {uploading === "favicon" ? t("uploading") : t("uploadIcon")}
              <input
                type="file"
                accept={ICON_ACCEPT}
                className="sr-only"
                disabled={Boolean(uploading)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void upload("favicon", file);
                }}
              />
            </label>
            <div>
              <label htmlFor="favicon-url" className={labelClass}>
                {t("iconUrl")}
              </label>
              <input
                id="favicon-url"
                value={settings.faviconUrl}
                onChange={(event) => update("faviconUrl", event.target.value)}
                className={inputClass}
                placeholder="https://… or /favicon.png"
              />
            </div>
            {settings.faviconUrl && (
              <button type="button" className="text-[13px] text-muted hover:text-link hover:underline" onClick={() => update("faviconUrl", "")}>
                {t("clearFavicon")}
              </button>
            )}
          </div>
        </div>
      </Panel>

      <Panel title={t("appleTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("appleHint")}</p>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex size-20 items-center justify-center border border-rule bg-panel">
            {applePreviewSrc ? (
              <img src={applePreviewSrc} alt="" className="max-h-16 max-w-16 object-contain" />
            ) : (
              <span className="text-[11px] text-muted">{t("noIcon")}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <label className="inline-block cursor-pointer border border-rule bg-panel-head px-3 py-2 text-[13px] font-semibold hover:bg-white">
              {uploading === "apple" ? t("uploading") : t("uploadIcon")}
              <input
                type="file"
                accept={ICON_ACCEPT}
                className="sr-only"
                disabled={Boolean(uploading)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void upload("apple", file);
                }}
              />
            </label>
            <div>
              <label htmlFor="apple-icon-url" className={labelClass}>
                {t("iconUrl")}
              </label>
              <input
                id="apple-icon-url"
                value={settings.appleTouchIconUrl}
                onChange={(event) => update("appleTouchIconUrl", event.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Panel>

      <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}