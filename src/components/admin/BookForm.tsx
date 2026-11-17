"use client";

/* eslint-disable @next/next/no-img-element -- cover previews point at Parse/R2 hosts */
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { AdminBook } from "@/lib/admin-books";
import { EMPTY_BOOK_DETAILS } from "@/lib/book-details";
import { uploadAdminImage } from "@/lib/client-upload";
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

function detailState(initial?: AdminBook) {
  return {
    isbn: initial?.isbn ?? "",
    description: initial?.description ?? "",
    pageCount: initial?.pageCount ?? "",
    readingAge: initial?.readingAge ?? "",
    language: initial?.language ?? EMPTY_BOOK_DETAILS.language,
    format: initial?.format ?? "",
    category: initial?.category ?? "",
    publishedAt: initial?.publishedAt ?? "",
    publisher: initial?.publisher ?? "",
    sampleUrl: initial?.sampleUrl ?? "",
    price: initial?.price ?? "",
  };
}

export function BookForm({ mode, initial }: { mode: "create" | "edit"; initial?: AdminBook }) {
  const t = useTranslations("dashboard.books");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [authors, setAuthors] = useState(initial?.authorsText ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [buyUrl, setBuyUrl] = useState(initial?.buyUrl ?? "");
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [details, setDetails] = useState(detailState(initial));
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function setDetail<K extends keyof typeof details>(key: K, value: (typeof details)[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  async function uploadCover(file: File) {
    setCoverUploading(true);
    setError("");
    try {
      setCover(await uploadAdminImage(file));
    } catch {
      setError(tDash("networkError"));
    } finally {
      setCoverUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { title, slug, authors, year, excerpt, cover, buyUrl, isNew, ...details };
      const response = await fetch(mode === "create" ? "/api/admin/books" : `/api/admin/books/${initial?.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; id?: string };
      if (!response.ok) {
        setError(data.error || t("saveError"));
        return;
      }
      router.push("/dashboard/books");
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

      <Panel title={t("detailsTitle")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="book-title" className={labelClass}>
              {t("title")}
            </label>
            <input
              id="book-title"
              required
              maxLength={220}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugTouched) setSlug(slugifyClient(event.target.value));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="book-slug" className={labelClass}>
              {t("slug")}
            </label>
            <input
              id="book-slug"
              required
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="book-year" className={labelClass}>
              {t("year")}
            </label>
            <input id="book-year" value={year} onChange={(event) => setYear(event.target.value)} placeholder="2026" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-authors" className={labelClass}>
              {t("authors")}
            </label>
            <input id="book-authors" value={authors} onChange={(event) => setAuthors(event.target.value)} placeholder={t("authorsHint")} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-excerpt" className={labelClass}>
              {t("shortDescription")}
            </label>
            <textarea id="book-excerpt" rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-cover" className={labelClass}>
              {t("cover")}
            </label>
            <input id="book-cover" value={cover} onChange={(event) => setCover(event.target.value)} placeholder="/books/cover.webp" className={inputClass} />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer bg-panel px-3 py-2 text-[13px] font-semibold text-text hover:bg-[#eee]">
                {coverUploading ? t("uploadingCover") : t("uploadCover")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={coverUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadCover(file);
                    event.target.value = "";
                  }}
                />
              </label>
              {cover && <img src={cover} alt="" className="h-24 w-[72px] border border-rule object-cover" />}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] sm:col-span-2">
            <input type="checkbox" className="size-4 accent-link" checked={isNew} onChange={(event) => setIsNew(event.target.checked)} />
            {t("markNew")}
          </label>
        </div>
      </Panel>

      <Panel title={t("productTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("productHint")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="book-isbn" className={labelClass}>
              {t("isbn")}
            </label>
            <input id="book-isbn" value={details.isbn} onChange={(event) => setDetail("isbn", event.target.value)} placeholder="978-3-16-148410-0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-format" className={labelClass}>
              {t("format")}
            </label>
            <input id="book-format" value={details.format} onChange={(event) => setDetail("format", event.target.value)} placeholder="Kindle Edition" className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-price" className={labelClass}>
              {t("price")}
            </label>
            <input id="book-price" value={details.price} onChange={(event) => setDetail("price", event.target.value)} placeholder="$3.70" className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-pages" className={labelClass}>
              {t("pageCount")}
            </label>
            <input id="book-pages" value={details.pageCount} onChange={(event) => setDetail("pageCount", event.target.value)} placeholder="216" className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-reading-age" className={labelClass}>
              {t("readingAge")}
            </label>
            <input id="book-reading-age" value={details.readingAge} onChange={(event) => setDetail("readingAge", event.target.value)} placeholder="8 - 17 years" className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-language" className={labelClass}>
              {t("language")}
            </label>
            <input id="book-language" value={details.language} onChange={(event) => setDetail("language", event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-category" className={labelClass}>
              {t("category")}
            </label>
            <input id="book-category" value={details.category} onChange={(event) => setDetail("category", event.target.value)} placeholder="Health, Fitness & Dieting" className={inputClass} />
          </div>
          <div>
            <label htmlFor="book-published" className={labelClass}>
              {t("publishedAt")}
            </label>
            <input id="book-published" value={details.publishedAt} onChange={(event) => setDetail("publishedAt", event.target.value)} placeholder="November 15, 2026" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-publisher" className={labelClass}>
              {t("publisher")}
            </label>
            <input id="book-publisher" value={details.publisher} onChange={(event) => setDetail("publisher", event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-buy" className={labelClass}>
              {t("buyUrl")}
            </label>
            <input
              id="book-buy"
              type="url"
              value={buyUrl}
              onChange={(event) => setBuyUrl(event.target.value)}
              placeholder="https://www.amazon.com/dp/..."
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-sample" className={labelClass}>
              {t("sampleUrl")}
            </label>
            <input
              id="book-sample"
              type="url"
              value={details.sampleUrl}
              onChange={(event) => setDetail("sampleUrl", event.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="book-description" className={labelClass}>
              {t("longDescription")}
            </label>
            <textarea
              id="book-description"
              rows={8}
              value={details.description}
              onChange={(event) => setDetail("description", event.target.value)}
              className={inputClass}
              placeholder={t("longDescriptionHint")}
            />
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-3">
        {mode === "edit" && initial?.slug ? (
          <Link href={`/books/${initial.slug}`} className="border border-rule px-5 py-2.5 text-[14px] font-semibold text-text hover:border-link hover:text-link">
            {t("viewPublic")}
          </Link>
        ) : null}
        <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
          {busy ? t("saving") : mode === "create" ? t("create") : t("save")}
        </button>
      </div>
    </form>
  );
}