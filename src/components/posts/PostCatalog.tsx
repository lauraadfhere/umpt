"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMonthYear } from "@/lib/format";
import type { PostSummary } from "@/lib/posts";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";

type Sort = "latest" | "title" | "views";

const BADGE_COLORS = ["#1a6fb0", "#5fb236", "#c8102e", "#8f5fb3"] as const;

function typeLabel(post: PostSummary, fallback: string) {
  const raw = post.category?.trim() || fallback;
  return raw.replace(/\s+/g, " ").toUpperCase();
}

export function PostCatalog({ posts }: { posts: PostSummary[] }) {
  const locale = useLocale();
  const t = useTranslations("blogs");
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState<Sort>("latest");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const copy = [...posts];
    if (sort === "title") copy.sort((a, b) => a.title.localeCompare(b.title, locale));
    if (sort === "views") copy.sort((a, b) => b.views - a.views);
    if (sort === "latest") copy.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    return copy;
  }, [posts, sort, locale]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const from = total ? safePage * perPage + 1 : 0;
  const to = Math.min(total, (safePage + 1) * perPage);
  const slice = sorted.slice(safePage * perPage, safePage * perPage + perPage);

  const allOnPage = slice.length > 0 && slice.every((post) => selected.has(post.id));
  const textProps = (lang: string) =>
    lang === locale ? {} : { lang, dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const) };

  function toggleAll(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const post of slice) {
        if (checked) next.add(post.id);
        else next.delete(post.id);
      }
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="bg-[#f3f3f3] px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-rule bg-white px-3 py-2.5 text-[13px]">
        <label className="flex cursor-pointer items-center gap-2 text-text">
          <input
            type="checkbox"
            className="size-3.5 accent-link"
            checked={allOnPage}
            onChange={(event) => toggleAll(event.target.checked)}
          />
          {t("selectAll")}
        </label>
        <p className="text-muted">{t("showing", { from, to, total: total.toLocaleString(locale) })}</p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 text-muted">
            <span className="font-semibold text-text">{t("perPage")}</span>
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setPerPage(n);
                  setPage(0);
                }}
                aria-pressed={perPage === n}
                className={perPage === n ? "font-semibold text-text" : "hover:text-link"}
              >
                {n}
              </button>
            ))}
          </span>
          <label className="flex items-center gap-2 border-s border-rule ps-4 text-muted">
            <span className="font-semibold text-text">{t("sortBy")}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as Sort);
                setPage(0);
              }}
              className="bg-transparent outline-none"
            >
              <option value="latest">{t("sortLatest")}</option>
              <option value="title">{t("sortTitle")}</option>
              <option value="views">{t("sortViews")}</option>
            </select>
          </label>
        </div>
      </div>

      <ul className="space-y-3">
        {slice.map((post) => {
          const href = `/posts/${post.slug}`;
          const date = formatMonthYear(post.publishedAt, locale);
          const badges = (post.tags.length ? post.tags : post.category ? [post.category] : []).slice(0, 4);
          return (
            <li key={post.id} className="flex gap-0 border border-rule bg-white shadow-[0_1px_0_#e8e8e8]">
              <div className="flex w-9 shrink-0 items-start justify-center border-e border-rule bg-[#fafafa] px-2 py-5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-3.5 accent-link"
                  checked={selected.has(post.id)}
                  onChange={(event) => toggleOne(post.id, event.target.checked)}
                  aria-label={t("selectItem", { title: post.title })}
                />
              </div>
              <div className="flex min-w-0 flex-1 gap-4 p-4 sm:gap-5 sm:p-5">
                <div className="hidden w-[88px] shrink-0 flex-col gap-2 sm:flex">
                  <p className="text-[11px] font-bold tracking-wide text-[#555]">{typeLabel(post, t("defaultType"))}</p>
                  {date ? <p className="text-[12px] text-muted">{date}</p> : null}
                  <ul className="mt-2 flex flex-col gap-1.5" aria-hidden>
                    {BADGE_COLORS.map((color, index) => (
                      <li key={color} className="size-2.5 rounded-full" style={{ backgroundColor: badges[index] ? color : "#d9d9d9" }} title={badges[index]} />
                    ))}
                  </ul>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wide text-[#555] sm:hidden">{typeLabel(post, t("defaultType"))}</p>
                  {date ? <p className="mt-0.5 text-[12px] text-muted sm:hidden">{date}</p> : null}
                  <h2 {...textProps(post.language)} className="text-[17px] leading-snug font-medium">
                    <Link href={href} className="text-[#005fa9] hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  {post.authors.length > 0 ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-text">
                      {post.authors.map((author, index) => (
                        <span key={author}>
                          {index > 0 ? ", " : null}
                          <Link href="/people" className="text-link underline decoration-link/40 hover:decoration-link">
                            {author}
                          </Link>
                        </span>
                      ))}
                    </p>
                  ) : null}
                  <p className="mt-1.5 text-[12px] italic text-muted">
                    {post.category ? <span>{post.category}</span> : null}
                    {post.category && post.publishedAt ? <span> · </span> : null}
                    {post.publishedAt ? <time dateTime={post.publishedAt}>{date}</time> : null}
                    {post.views > 0 ? <span> · {t("views", { count: post.views })}</span> : null}
                  </p>
                  {post.excerpt ? (
                    <p {...textProps(post.language)} className="mt-3 line-clamp-3 text-[14px] leading-[1.65] text-text">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee] pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#005fa9]">
                      <span aria-hidden className="text-[15px] font-serif leading-none">
                        “
                      </span>
                      {t("citations", { count: 0 })}
                    </span>
                    <div className="flex items-center gap-2">
                      {post.authors[0] ? (
                        <AuthorAvatar name={post.authors[0]} className="size-7" />
                      ) : null}
                      <button type="button" className="grid size-8 place-items-center border border-rule bg-[#f7f7f7] text-[#555] hover:bg-white" title={t("cite")} aria-label={t("cite")}>
                        <span className="font-serif text-[14px]">“</span>
                      </button>
                      <button
                        type="button"
                        className="grid size-8 place-items-center border border-rule bg-[#f7f7f7] text-[#555] hover:bg-white"
                        title={t("save")}
                        aria-label={t("save")}
                      >
                        <span className="text-[13px]">+</span>
                      </button>
                      <Link href={href} className="border border-rule bg-white px-3 py-1.5 text-[12px] font-semibold text-link hover:bg-[#f7fbff]">
                        {t("read")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {pageCount > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[13px]">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="border border-rule bg-white px-3 py-1.5 disabled:opacity-40"
          >
            {t("prev")}
          </button>
          <span className="text-muted">
            {t("page", { current: safePage + 1, total: pageCount })}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="border border-rule bg-white px-3 py-1.5 disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}