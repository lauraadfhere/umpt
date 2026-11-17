"use client";

import { useTranslations } from "next-intl";
import type { SectionLink } from "@/components/reading/SectionsNav";

/** Compact in-article table of contents (shown on small screens; sidebar handles desktop). */
export function PostTableOfContents({ sections }: { sections: SectionLink[] }) {
  const t = useTranslations("reading");
  if (sections.length < 2) return null;

  return (
    <nav aria-label={t("tableOfContents")} className="mb-6 border border-rule bg-panel md:hidden">
      <p className="border-b border-rule bg-panel-head px-3 py-2 text-[12px] font-semibold tracking-wide text-accent uppercase">{t("tableOfContents")}</p>
      <ol className="max-h-[11rem] overflow-y-auto py-1">
        {sections.map((section, index) => (
          <li key={section.id} className="border-b border-rule/80 last:border-b-0">
            <a href={`#${section.id}`} className="block px-3 py-2 text-[13px] leading-snug text-link hover:bg-white hover:underline">
              <span className="me-2 text-[11px] font-semibold text-muted tabular-nums">{index + 1}.</span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}