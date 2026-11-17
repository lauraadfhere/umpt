"use client";

/* eslint-disable @next/next/no-img-element -- logo previews point at Parse/R2 hosts */
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { LogoMode, LogoSettings } from "@/lib/logo-config";
import { uploadAdminImage } from "@/lib/client-upload";
import { MAX_LOGO_WIDTH, MIN_LOGO_WIDTH } from "@/lib/logo-config";
import { Panel } from "@/components/ui/SectionTitle";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

export function LogoForm({ initial }: { initial: LogoSettings }) {
  const t = useTranslations("dashboard.logo");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"header" | "footer" | "og" | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof LogoSettings>(key: K, value: LogoSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function upload(kind: "header" | "footer" | "og", file: File) {
    setError("");
    setUploading(kind);
    try {
      const url = await uploadAdminImage(file);
      if (kind === "header") update("headerUrl", url);
      else if (kind === "footer") update("footerUrl", url);
      else update("ogImageUrl", url);
    } catch {
      setError(tDash("networkError"));
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
      const response = await fetch("/api/admin/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json().catch(() => ({}))) as LogoSettings & { error?: string };
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

  const modes: { key: LogoMode; label: string; hint: string }[] = [
    { key: "text", label: t("modeText"), hint: t("modeTextHint") },
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

      <Panel title={t("modeTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((mode) => (
            <label
              key={mode.key}
              className={`cursor-pointer border px-4 py-3 ${settings.mode === mode.key ? "border-text bg-white" : "border-rule bg-panel hover:border-text"}`}
            >
              <input
                type="radio"
                name="logo-mode"
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

      {settings.mode === "text" ? (
        <Panel title={t("textTitle")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["textShort", t("textShort")],
                ["textBadge", t("textBadge")],
                ["textLine1", t("textLine1")],
                ["textLine2", t("textLine2")],
                ["textRoundel", t("textRoundel")],
                ["textOrg1", t("textOrg1")],
                ["textOrg2", t("textOrg2")],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`logo-${key}`} className={labelClass}>
                  {label}
                </label>
                <input
                  id={`logo-${key}`}
                  value={settings[key]}
                  maxLength={key === "textBadge" ? 4 : undefined}
                  onChange={(event) => update(key, event.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-muted">{t("textPreviewHint")}</p>
          <div className="mt-3 flex items-center gap-1.5 bg-chrome px-4 py-3 text-white">
            <span className="text-[13px] font-bold tracking-tight">{settings.textShort || "UMPT"}</span>
            <span className="grid size-[22px] place-items-center rounded-full bg-white text-[9px] font-bold text-black">
              {(settings.textBadge || "DL").slice(0, 4).toUpperCase()}
            </span>
            <span className="flex flex-col text-[11px] font-bold leading-[1.05] tracking-wide uppercase">
              <span>{settings.textLine1}</span>
              <span>{settings.textLine2}</span>
            </span>
          </div>
        </Panel>
      ) : (
        <Panel title={t("imageTitle")}>
          <div className="grid gap-6 md:grid-cols-2">
            {(
              [
                ["header", "headerUrl", "headerWidth", t("headerImage")],
                ["footer", "footerUrl", "footerWidth", t("footerImage")],
              ] as const
            ).map(([kind, urlKey, widthKey, label]) => (
              <div key={kind} className="space-y-3">
                <p className="text-[13px] font-semibold text-text">{label}</p>
                {settings[urlKey] ? (
                  <img src={settings[urlKey]} alt="" className="h-16 w-auto max-w-full bg-chrome object-contain p-2" style={{ width: settings[widthKey] }} />
                ) : (
                  <div className="flex h-16 items-center justify-center border border-dashed border-rule text-[12px] text-muted">{t("noImage")}</div>
                )}
                <label className="inline-block cursor-pointer border border-rule bg-panel-head px-3 py-2 text-[13px] font-semibold hover:bg-white">
                  {uploading === kind ? t("uploading") : t("uploadImage")}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={Boolean(uploading)}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) void upload(kind, file);
                    }}
                  />
                </label>
                <div>
                  <label htmlFor={`logo-${urlKey}`} className={labelClass}>
                    {t("imageUrl")}
                  </label>
                  <input id={`logo-${urlKey}`} value={settings[urlKey]} onChange={(event) => update(urlKey, event.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`logo-${widthKey}`} className={labelClass}>
                    {t("width")} ({MIN_LOGO_WIDTH}–{MAX_LOGO_WIDTH}px)
                  </label>
                  <input
                    id={`logo-${widthKey}`}
                    type="number"
                    min={MIN_LOGO_WIDTH}
                    max={MAX_LOGO_WIDTH}
                    value={settings[widthKey]}
                    onChange={(event) => update(widthKey, Number(event.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title={t("ogTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("ogHint")}</p>
        {settings.ogImageUrl ? <img src={settings.ogImageUrl} alt="" className="mb-3 h-28 w-auto max-w-full border border-rule object-cover" /> : null}
        <div className="flex flex-wrap items-end gap-4">
          <label className="inline-block cursor-pointer border border-rule bg-panel-head px-3 py-2 text-[13px] font-semibold hover:bg-white">
            {uploading === "og" ? t("uploading") : t("uploadImage")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={Boolean(uploading)}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload("og", file);
              }}
            />
          </label>
          <div className="min-w-0 flex-1">
            <label htmlFor="logo-og" className={labelClass}>
              {t("imageUrl")}
            </label>
            <input id="logo-og" value={settings.ogImageUrl} onChange={(event) => update("ogImageUrl", event.target.value)} className={inputClass} />
          </div>
        </div>
      </Panel>

      <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}
