"use client";

import { useTranslations } from "next-intl";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SUBJECT_KEYS } from "@/lib/authors";

type Props = {
  activeSubject: string | null;
  onSelect: (key: string | null) => void;
};

export function SubjectsSidebar({ activeSubject, onSelect }: Props) {
  const t = useTranslations("subjects");

  return (
    <aside className="w-full shrink-0 bg-panel md:w-[222px]">
      <div className="bg-panel-head px-3 py-2.5">
        <SectionTitle as="h3" size="md">{t("title")}</SectionTitle>
      </div>
      <ul className="px-3 py-3 text-[14px] leading-snug">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`w-full py-1.5 text-start hover:text-link ${activeSubject === null ? "font-semibold text-text" : "text-muted"}`}
          >
            {t("all")}
          </button>
        </li>
        {SUBJECT_KEYS.map((key) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={activeSubject === key}
              className={`w-full py-1.5 text-start hover:text-link ${activeSubject === key ? "font-semibold text-text" : "text-muted"}`}
            >
              {t(`items.${key}`)}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
