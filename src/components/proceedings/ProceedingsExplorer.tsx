"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/catalog";
import { Panel, SectionTitle } from "@/components/ui/SectionTitle";
import { IconSearch } from "@/components/ui/Icons";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function letterOf(item: Project) {
  const first = item.acronym.charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

export function ProceedingsExplorer({ proceedings, initialQuery = "" }: { proceedings: Project[]; initialQuery?: string }) {
  const t = useTranslations("proceedings");
  const [query, setQuery] = useState(initialQuery);
  const [letter, setLetter] = useState<string | null>(null);

  const available = useMemo(() => new Set(proceedings.map(letterOf)), [proceedings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return proceedings.filter((item) => {
      if (q) return item.title.toLowerCase().includes(q) || item.acronym.toLowerCase().includes(q);
      return !letter || letterOf(item) === letter;
    });
  }, [proceedings, query, letter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Project[]>();
    for (const item of visible) {
      const key = letterOf(item);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-6">
      <Panel title={t("panelTitle")}>
        <div className="grid gap-6 md:grid-cols-[1fr_380px]">
          <p className="text-[14px] leading-[1.55] text-text md:pe-4">{t("intro")}</p>
          <div className="border-rule md:border-s md:ps-3">
            <label htmlFor="proceedings-title-search" className="mb-3 block text-[14px] font-semibold text-text">
              {t("searchLabel")}
            </label>
            <div className="flex h-[52px] items-center border border-rule bg-white">
              <input
                id="proceedings-title-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-full flex-1 bg-transparent px-3 text-[14px] outline-none placeholder:italic placeholder:text-[#8f8f8f]"
              />
              <span className="px-3 text-text" aria-hidden>
                <IconSearch className="size-4" />
              </span>
            </div>
            <div className="mt-2 text-end">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setLetter(null);
                }}
                className="text-[12px] text-link underline underline-offset-2 hover:text-link-hover"
              >
                {t("clear")}
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <section>
        <SectionTitle className="mb-5">{t("alphabetical")}</SectionTitle>
        <div className="mb-6 flex flex-wrap gap-1" role="toolbar" aria-label={t("alphabetical")}>
          <button
            type="button"
            onClick={() => setLetter(null)}
            aria-pressed={letter === null}
            className={`h-8 min-w-8 px-2 text-[13px] font-semibold ${letter === null ? "bg-text text-white" : "bg-panel text-text hover:bg-panel-head"}`}
          >
            {t("all")}
          </button>
          {LETTERS.map((item) => {
            const enabled = available.has(item);
            return (
              <button
                key={item}
                type="button"
                disabled={!enabled}
                onClick={() => {
                  setQuery("");
                  setLetter(item);
                }}
                aria-pressed={letter === item}
                className={`h-8 min-w-8 text-[13px] font-semibold ${
                  letter === item ? "bg-text text-white" : enabled ? "bg-panel text-link hover:bg-panel-head" : "bg-panel text-[#bdbdbd]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {grouped.length === 0 ? (
          <p className="bg-panel px-6 py-8 text-[14px] text-muted">{t("empty")}</p>
        ) : (
          <div className="space-y-8">
            {grouped.map(([key, items]) => (
              <div key={key}>
                <h3 className="mb-2 border-b border-rule pb-1 text-[18px] font-semibold text-text">{key}</h3>
                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.id} className="border-b border-[#eeeeee] py-2.5 text-[14px]">
                      <Link href={`/projects/${item.slug}`} className="font-semibold text-link hover:underline">
                        {item.acronym}
                      </Link>
                      <span className="text-muted">: {item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
