"use client";

/* eslint-disable @next/next/no-img-element -- avatar preview points at Parse/R2 hosts */
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { ProfileSettings } from "@/lib/profile-config";
import { uploadAdminImage } from "@/lib/client-upload";
import { SUBJECT_KEYS } from "@/lib/authors";
import { Panel } from "@/components/ui/SectionTitle";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

export function ProfileForm({ initial }: { initial: ProfileSettings }) {
  const t = useTranslations("dashboard.profile");
  const tDash = useTranslations("dashboard");
  const tSubjects = useTranslations("subjects");
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function toggleSubject(key: string) {
    setSettings((current) => {
      const has = current.subjects.includes(key);
      return { ...current, subjects: has ? current.subjects.filter((item) => item !== key) : [...current.subjects, key].slice(0, 12) };
    });
    setSaved(false);
  }

  async function persistProfile(next: ProfileSettings) {
    const response = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = (await response.json().catch(() => ({}))) as ProfileSettings & { error?: string };
    if (!response.ok) throw new Error(data.error || t("saveError"));
    setSettings(data);
    setSaved(true);
    router.refresh();
    return data;
  }

  async function uploadAvatar(file: File) {
    setError("");
    setUploading(true);
    setSaved(false);
    try {
      const avatarUrl = await uploadAdminImage(file);
      const next = { ...settings, avatarUrl };
      setSettings(next);
      await persistProfile(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tDash("networkError"));
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
      await persistProfile(settings);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tDash("networkError"));
    } finally {
      setBusy(false);
    }
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

      <Panel title={t("detailsTitle")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="profile-name" className={labelClass}>
              {t("displayName")}
            </label>
            <input id="profile-name" value={settings.displayName} onChange={(event) => update("displayName", event.target.value)} maxLength={80} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="profile-affiliation" className={labelClass}>
              {t("affiliation")}
            </label>
            <input id="profile-affiliation" value={settings.affiliation} onChange={(event) => update("affiliation", event.target.value)} maxLength={160} className={inputClass} />
          </div>
          <div>
            <label htmlFor="profile-website" className={labelClass}>
              {t("website")}
            </label>
            <input id="profile-website" value={settings.website} onChange={(event) => update("website", event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-bio" className={labelClass}>
              {t("bio")}
            </label>
            <textarea id="profile-bio" value={settings.bio} onChange={(event) => update("bio", event.target.value)} rows={4} maxLength={800} className={inputClass} />
          </div>
        </div>
      </Panel>

      <Panel title={t("avatarTitle")}>
        <div className="flex flex-wrap items-center gap-5">
          <AuthorAvatar name={settings.displayName} src={settings.avatarUrl} className="size-16" useDefault={Boolean(settings.avatarUrl)} />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[13px] text-muted">{t("avatarHint")}</p>
            <label className="inline-block cursor-pointer border border-rule bg-panel-head px-3 py-2 text-[13px] font-semibold hover:bg-white">
              {uploading ? t("uploading") : t("uploadAvatar")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadAvatar(file);
                }}
              />
            </label>
            <div>
              <label htmlFor="profile-avatar-url" className={labelClass}>
                {t("avatarUrl")}
              </label>
              <input id="profile-avatar-url" value={settings.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} className={inputClass} />
            </div>
            {settings.avatarUrl ? (
              <button type="button" onClick={() => update("avatarUrl", "")} className="text-[13px] text-muted hover:text-new hover:underline">
                {t("removeAvatar")}
              </button>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel title={t("subjectsTitle")}>
        <p className="mb-3 text-[13px] text-muted">{t("subjectsHint")}</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_KEYS.map((key) => {
            const active = settings.subjects.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSubject(key)}
                aria-pressed={active}
                className={`border px-3 py-1.5 text-[13px] ${active ? "border-text bg-white font-semibold text-text" : "border-rule bg-panel text-muted hover:border-text"}`}
              >
                {tSubjects(`items.${key}`)}
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="border border-rule bg-panel px-4 py-4">
        <p className="mb-3 text-[13px] font-semibold text-text">{t("preview")}</p>
        <div className="flex gap-3">
          <AuthorAvatar name={settings.displayName} src={settings.avatarUrl} className="size-12" useDefault={Boolean(settings.avatarUrl)} />
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-link">{settings.displayName}</p>
            {settings.affiliation ? <p className="mt-0.5 text-[13px] text-muted">{settings.affiliation}</p> : null}
            {settings.bio ? <p className="mt-2 text-[13px] leading-[1.55] text-text">{settings.bio}</p> : null}
          </div>
        </div>
      </div>

      <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}
