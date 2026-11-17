"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { AdminProject } from "@/lib/admin-projects";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Panel } from "@/components/ui/SectionTitle";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

function slugifyClient(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProjectForm({ mode, initial }: { mode: "create" | "edit"; initial?: AdminProject }) {
  const t = useTranslations("dashboard.projects");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [acronym, setAcronym] = useState(initial?.acronym ?? "");
  const [year, setYear] = useState(initial?.year ?? String(new Date().getFullYear()));
  const [contextHtml, setContextHtml] = useState(initial?.contextHtml ?? "");
  const [reportHtml, setReportHtml] = useState(initial?.reportHtml ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { title, slug, acronym, year, contextHtml, reportHtml };
      const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initial?.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; slug?: string; id?: string };
      if (!response.ok) {
        setError(data.error || t("saveError"));
        return;
      }
      if (mode === "create" && data.id) {
        router.push(`/dashboard/projects/${data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError(tDash("networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 pb-12">
      {error && (
        <p role="alert" className="border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <Panel title={t("detailsTitle")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="project-title" className={labelClass}>
              {t("title")}
            </label>
            <input
              id="project-title"
              required
              value={title}
              onChange={(event) => {
                const next = event.target.value;
                setTitle(next);
                if (!slugTouched) setSlug(slugifyClient(next));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-slug" className={labelClass}>
              {t("slug")}
            </label>
            <input
              id="project-slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugifyClient(event.target.value));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-acronym" className={labelClass}>
              {t("acronym")}
            </label>
            <input id="project-acronym" value={acronym} onChange={(event) => setAcronym(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="project-year" className={labelClass}>
              {t("year")}
            </label>
            <input id="project-year" value={year} onChange={(event) => setYear(event.target.value)} className={inputClass} inputMode="numeric" />
          </div>
        </div>
        {mode === "edit" && slug ? (
          <p className="mt-4 text-[13px] text-muted">
            <Link href={`/projects/${slug}`} className="text-link hover:underline">
              {t("viewPublic")}
            </Link>
          </p>
        ) : null}
      </Panel>

      <Panel title={t("contextTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("contextHint")}</p>
        <RichTextEditor id="project-context" label={t("context")} placeholder={t("contextPlaceholder")} value={contextHtml} onChange={setContextHtml} />
      </Panel>

      <Panel title={t("reportTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("reportHint")}</p>
        <RichTextEditor id="project-report" label={t("report")} placeholder={t("reportPlaceholder")} value={reportHtml} onChange={setReportHtml} />
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
          {busy ? t("saving") : mode === "create" ? t("create") : t("save")}
        </button>
        <Link href="/dashboard/projects" className="text-[14px] text-muted hover:text-link hover:underline">
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}