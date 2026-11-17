"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import type { SitePage } from "@/lib/site-pages";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Panel } from "@/components/ui/SectionTitle";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

export function PageForm({ page }: { page: SitePage }) {
  const t = useTranslations("dashboard.pages");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle);
  const [seoDescription, setSeoDescription] = useState(page.seoDescription);
  const [status, setStatus] = useState(page.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, seoTitle, seoDescription, status }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || t("saveError"));
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError(tDash("networkError"));
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
        <div className="grid gap-4">
          <div>
            <label htmlFor="page-title" className={labelClass}>
              {t("title")}
            </label>
            <input id="page-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} className={inputClass} />
          </div>
          <div>
            <label htmlFor="page-status" className={labelClass}>
              {t("status")}
            </label>
            <select id="page-status" value={status} onChange={(event) => setStatus(event.target.value === "draft" ? "draft" : "published")} className={inputClass}>
              <option value="published">{t("published")}</option>
              <option value="draft">{t("draft")}</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel title={t("seoTitle")}>
        <div className="grid gap-4">
          <div>
            <label htmlFor="page-seo-title" className={labelClass}>
              {t("seoPageTitle")}
            </label>
            <input id="page-seo-title" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} maxLength={70} className={inputClass} />
          </div>
          <div>
            <label htmlFor="page-seo-description" className={labelClass}>
              {t("seoDescription")}
            </label>
            <textarea id="page-seo-description" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} maxLength={180} rows={3} className={inputClass} />
          </div>
        </div>
      </Panel>

      <Panel title={t("contentTitle")}>
        <RichTextEditor id="page-content" label={t("content")} placeholder={t("contentPlaceholder")} value={content} onChange={setContent} />
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
          {busy ? t("saving") : t("save")}
        </button>
        <Link href="/dashboard/pages" className="text-[14px] text-link hover:underline">
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
