"use client";

/* eslint-disable @next/next/no-img-element -- cover previews point at Parse/R2 hosts */
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import type { CategoryOption, PostTranslation } from "@/lib/admin-posts";
import { uploadAdminImage } from "@/lib/client-upload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Panel } from "@/components/ui/SectionTitle";

export type PostFormValues = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locale: string;
  status: string;
  category: string;
  publishedAt: string | null;
  coverImage: string | null;
  coverCaption: string;
  authors: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  translations?: Record<string, PostTranslation>;
};

function slugifyClient(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

const translationLanguages = [
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "ar", name: "العربية" },
] as const;

type TranslationDraft = { title: string; excerpt: string; content: string };

export function PostForm({ mode, initial, categories }: { mode: "create" | "edit"; initial?: PostFormValues; categories: CategoryOption[] }) {
  const t = useTranslations("dashboard.posts");
  const tEditor = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [postLocale, setPostLocale] = useState(initial?.locale || "en");
  const [status, setStatus] = useState(initial?.status === "draft" ? "draft" : "published");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage ?? null);
  const [coverCaption, setCoverCaption] = useState(initial?.coverCaption ?? "");
  const [authors, setAuthors] = useState((initial?.authors ?? []).join(", "));
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [translations, setTranslations] = useState<Record<string, TranslationDraft>>(() => ({
    fr: { title: "", excerpt: "", content: "", ...initial?.translations?.fr },
    es: { title: "", excerpt: "", content: "", ...initial?.translations?.es },
    ar: { title: "", excerpt: "", content: "", ...initial?.translations?.ar },
  }));

  const effectiveSlug = slugTouched ? slug : slugifyClient(title);

  function updateTranslation(code: string, field: keyof TranslationDraft, value: string) {
    setTranslations((current) => ({ ...current, [code]: { ...current[code], [field]: value } }));
  }

  async function uploadCover(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError(t("coverTypeError"));
      return;
    }
    setCoverUploading(true);
    try {
      setCoverImage(await uploadAdminImage(file));
    } catch {
      setError(tEditor("networkError"));
    } finally {
      setCoverUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.replace(/<[^>]*>/g, "").trim()) {
      setError(t("contentRequired"));
      return;
    }
    setBusy(true);
    setError("");

    const payload = {
      title,
      slug: effectiveSlug,
      excerpt,
      content,
      locale: postLocale,
      status,
      category,
      publishedAt: initial?.publishedAt ?? null,
      coverImage,
      coverCaption,
      authors,
      tags,
      seoTitle,
      seoDescription,
      translations,
    };

    try {
      const response =
        mode === "create"
          ? await fetch("/api/admin/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
          : await fetch(`/api/admin/posts/${initial?.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || t("saveError"));
        setBusy(false);
        return;
      }
      router.push("/dashboard/posts");
      router.refresh();
    } catch {
      setError(tEditor("networkError"));
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
        <div className="grid gap-4">
          <div>
            <label htmlFor="post-title" className={labelClass}>
              {t("title")}
            </label>
            <input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="post-slug" className={labelClass}>
                {t("slug")}
              </label>
              <input
                id="post-slug"
                value={effectiveSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                className={inputClass}
              />
              <p className="mt-1 text-[12px] text-muted">/{locale}/posts/{effectiveSlug || "slug"}</p>
            </div>
            <div>
              <label htmlFor="post-category" className={labelClass}>
                {t("category")}
              </label>
              {categories.length > 0 ? (
                <select id="post-category" value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                  <option value="">{t("noCategory")}</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.name || item.slug}>
                      {item.name || item.slug}
                    </option>
                  ))}
                </select>
              ) : (
                <input id="post-category" value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass} />
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="post-locale" className={labelClass}>
                {t("language")}
              </label>
              <select id="post-locale" value={postLocale} onChange={(event) => setPostLocale(event.target.value)} className={inputClass}>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label htmlFor="post-status" className={labelClass}>
                {t("status")}
              </label>
              <select id="post-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
                <option value="published">{t("published")}</option>
                <option value="draft">{t("draft")}</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="post-excerpt" className={labelClass}>
              {t("excerpt")}
            </label>
            <textarea id="post-excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label htmlFor="post-authors" className={labelClass}>
              {t("authors")}
            </label>
            <input id="post-authors" value={authors} onChange={(event) => setAuthors(event.target.value)} placeholder={t("authorsHint")} className={inputClass} />
            <p className="mt-1 text-[12px] text-muted">{t("authorsProfileHint")}</p>
          </div>
          <div>
            <label htmlFor="post-tags" className={labelClass}>
              {t("tags")}
            </label>
            <input id="post-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder={t("tagsHint")} className={inputClass} />
          </div>
        </div>
      </Panel>

      <Panel title={t("seoTitle")}>
        <div className="grid gap-4">
          <div>
            <label htmlFor="post-seo-title" className={labelClass}>
              {t("seoPageTitle")}
            </label>
            <input id="post-seo-title" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} maxLength={70} className={inputClass} />
            <p className="mt-1 text-[12px] text-muted">{t("seoTitleHint")}</p>
          </div>
          <div>
            <label htmlFor="post-seo-description" className={labelClass}>
              {t("seoDescription")}
            </label>
            <textarea id="post-seo-description" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} maxLength={180} rows={3} className={inputClass} />
            <p className="mt-1 text-[12px] text-muted">{t("seoDescriptionHint")}</p>
          </div>
        </div>
      </Panel>

      <Panel title={t("coverTitle")}>
        <div className="flex flex-wrap items-start gap-5">
          {coverImage ? (
            <img src={coverImage} alt="" className="h-40 w-32 border border-rule object-cover" />
          ) : (
            <div className="flex h-40 w-32 items-center justify-center border border-dashed border-rule text-center text-[12px] text-muted">{t("noCover")}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="post-cover" className="inline-block cursor-pointer border border-rule bg-panel-head px-4 py-2 text-[13px] font-semibold hover:bg-white">
              {coverUploading ? t("uploading") : coverImage ? t("replaceCover") : t("uploadCover")}
            </label>
            <input
              id="post-cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={coverUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void uploadCover(file);
              }}
            />
            {coverImage && (
              <button type="button" onClick={() => setCoverImage(null)} className="block text-[13px] text-link hover:underline">
                {t("removeCover")}
              </button>
            )}
            <div>
              <label htmlFor="post-cover-caption" className={labelClass}>
                {t("coverCaption")}
              </label>
              <input id="post-cover-caption" value={coverCaption} onChange={(event) => setCoverCaption(event.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={t("contentTitle")}>
        <RichTextEditor id="post-content" label={t("content")} placeholder={t("contentPlaceholder")} value={content} onChange={setContent} />
      </Panel>

      <Panel title={t("translationsTitle")}>
        <p className="mb-4 text-[13px] text-muted">{t("translationsHint")}</p>
        {translationLanguages.map((language) => (
          <div key={language.code} className="mt-5 space-y-4 border-t border-rule pt-5 first:mt-0 first:border-t-0 first:pt-0">
            <h3 className="text-[14px] font-semibold">
              {language.name} ({language.code})
            </h3>
            <div>
              <label htmlFor={`translation-${language.code}-title`} className={labelClass}>
                {t("title")}
              </label>
              <input
                id={`translation-${language.code}-title`}
                dir={language.code === "ar" ? "rtl" : "ltr"}
                value={translations[language.code].title}
                onChange={(event) => updateTranslation(language.code, "title", event.target.value)}
                maxLength={200}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`translation-${language.code}-excerpt`} className={labelClass}>
                {t("excerpt")}
              </label>
              <textarea
                id={`translation-${language.code}-excerpt`}
                dir={language.code === "ar" ? "rtl" : "ltr"}
                value={translations[language.code].excerpt}
                onChange={(event) => updateTranslation(language.code, "excerpt", event.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
            <RichTextEditor
              key={`${language.code}-${mode}`}
              id={`translation-${language.code}-content`}
              label={`${language.name} ${t("content")}`}
              placeholder={t("translatePlaceholder")}
              value={translations[language.code].content}
              onChange={(value) => updateTranslation(language.code, "content", value)}
            />
          </div>
        ))}
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
          {busy ? t("saving") : mode === "create" ? t("publish") : t("save")}
        </button>
        <Link href="/dashboard/posts" className="text-[14px] text-link hover:underline">
          {t("cancel")}
        </Link>
        {mode === "edit" && initial && (
          <Link href={`/posts/${initial.slug}`} target="_blank" className="text-[14px] text-link hover:underline">
            {t("viewPost")}
          </Link>
        )}
      </div>
    </form>
  );
}
