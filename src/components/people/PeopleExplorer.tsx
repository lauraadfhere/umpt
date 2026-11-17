"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconChevronDown, IconSearch } from "@/components/ui/Icons";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SubjectsSidebar } from "@/components/people/SubjectsSidebar";
import { AUTHOR_TOTAL, sampleAuthors, type Author } from "@/lib/authors";

type Sort = "latest" | "name" | "publications";

export function PeopleExplorer({ featured }: { featured?: Author | null }) {
  const locale = useLocale();
  const tPeople = useTranslations("people");
  const tFind = useTranslations("findByName");
  const tResults = useTranslations("results");
  const tAuthors = useTranslations("authors");

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState<Sort>("latest");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = featured ? [featured, ...sampleAuthors.filter((author) => author.id !== featured.id)] : sampleAuthors;
    const filtered = pool.filter((author) => {
      const matchesName = !q || author.name.toLowerCase().includes(q) || author.affiliation.toLowerCase().includes(q);
      return matchesName && (!subject || author.subjects.includes(subject));
    });
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name, locale));
    if (sort === "publications") filtered.sort((a, b) => b.publicationCount - a.publicationCount);
    if (featured && sort === "latest") {
      const index = filtered.findIndex((author) => author.id === featured.id);
      if (index > 0) {
        const [item] = filtered.splice(index, 1);
        filtered.unshift(item);
      }
    }
    return filtered.slice(0, perPage);
  }, [query, subject, sort, perPage, locale, featured]);

  return (
    <div className="mx-auto max-w-[1200px] px-6">
      <SectionTitle className="mb-3">{tPeople("pageTitle")}</SectionTitle>
      <p className="max-w-[940px] text-[14px] leading-[1.55]">{tPeople("intro1")}</p>
      <p className="mt-3 mb-8 max-w-[940px] text-[14px] leading-[1.55]">{tPeople("intro2")}</p>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <SubjectsSidebar activeSubject={subject} onSelect={setSubject} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 border border-rule px-4 py-2.5">
            <span className="flex items-center gap-1 text-[14px] italic text-text">
              {tFind("label")}
              <IconChevronDown className="size-4" />
            </span>
            <label className="flex h-[30px] min-w-[200px] flex-1 items-center border border-rule bg-white">
              <span className="sr-only">{tFind("label")}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tFind("placeholder")}
                className="h-full flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:italic placeholder:text-[#9a9a9a]"
              />
              <IconSearch className="me-2 size-4 text-muted" />
            </label>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubject(null);
              }}
              className="px-1 text-[14px] text-link hover:underline"
            >
              {tFind("clear")}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-1 py-3 text-[13px] italic">
            <p className="text-muted">
              {tResults("showing", { from: shown.length ? 1 : 0, to: shown.length, total: AUTHOR_TOTAL.toLocaleString(locale) })}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="font-semibold">{tResults("perPage")}:</span>
                {[10, 20, 50].map((n) => (
                  <button key={n} type="button" onClick={() => setPerPage(n)} aria-pressed={perPage === n} className={perPage === n ? "font-semibold text-text" : "text-muted hover:text-link"}>
                    {n}
                  </button>
                ))}
              </span>
              <label className="flex items-center gap-1 border-s border-rule ps-4">
                <span className="font-semibold">{tResults("sortBy")}:</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="bg-transparent italic outline-none">
                  <option value="latest">{tResults("sortLatest")}</option>
                  <option value="name">{tResults("sortName")}</option>
                  <option value="publications">{tResults("sortPublications")}</option>
                </select>
              </label>
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="bg-panel px-6 py-8 text-[14px] text-muted">{tResults("empty")}</p>
          ) : (
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {shown.map((author) => (
                <li key={author.id} className="flex gap-3 border-b border-[#eeeeee] py-4">
                  <AuthorAvatar name={author.name} src={author.avatarUrl} className="size-12" />
                  <div className="min-w-0">
                    <a href={`#author-${author.id}`} className="text-[16px] font-semibold text-link hover:underline">{author.name}</a>
                    <p className="mt-0.5 text-[13px] text-muted">{author.affiliation}</p>
                    {author.bio ? <p className="mt-1 text-[13px] leading-[1.5] text-text">{author.bio}</p> : null}
                    <p className="mt-1 text-[13px] text-text">{tAuthors("publications", { count: author.publicationCount })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
