"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Proceeding } from "@/lib/catalog";

type TabKey = "latest" | "az";

export function ProceedingsTabs({ latest, alphabetical }: { latest: Proceeding[]; alphabetical: Proceeding[] }) {
  const t = useTranslations("highlights");
  const [tab, setTab] = useState<TabKey>("latest");
  const items = tab === "latest" ? latest : alphabetical;
  const tabs: { key: TabKey; label: string }[] = [
    { key: "latest", label: t("latest") },
    { key: "az", label: t("az") },
  ];

  return (
    <div>
      <div role="tablist" aria-label={t("title")} className="mb-2 flex gap-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`proceedings-tab-${key}`}
            aria-selected={tab === key}
            aria-controls="proceedings-tabpanel"
            onClick={() => setTab(key)}
            className={`border-b-2 pb-1.5 text-[16px] ${tab === key ? "border-text font-semibold text-text" : "border-transparent text-muted hover:text-text"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul id="proceedings-tabpanel" role="tabpanel" aria-labelledby={`proceedings-tab-${tab}`}>
        {items.map((item) => (
          <li key={item.id} className="border-b border-rule py-2">
            <Link
              href={{ pathname: "/proceedings", query: { q: item.acronym } }}
              className="text-[16px] leading-tight font-medium text-[#222] hover:text-link"
            >
              {item.title}
            </Link>
            <p className="mt-0.5 text-[12px] leading-snug italic text-muted">
              {item.acronym} ’{String(item.year).slice(-2)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
