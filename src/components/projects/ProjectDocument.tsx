"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SiteRichContent } from "@/components/site/SiteRichContent";

export function ProjectDocument({ contextHtml, reportHtml }: { contextHtml: string; reportHtml: string }) {
  const t = useTranslations("projects");
  const hasContext = contextHtml.trim().length > 0;
  const hasReport = reportHtml.trim().length > 0;
  const [tab, setTab] = useState<"context" | "report">(hasContext ? "context" : "report");

  if (!hasContext && !hasReport) {
    return <p className="text-[14px] text-muted">{t("emptyBody")}</p>;
  }

  return (
    <div>
      {hasContext && hasReport ? (
        <div className="mb-6 flex flex-wrap gap-1 border-b border-rule" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "context"}
            onClick={() => setTab("context")}
            className={`px-4 py-2.5 text-[13px] font-semibold ${
              tab === "context" ? "border-b-2 border-link text-text" : "text-muted hover:text-text"
            }`}
          >
            {t("contextTab")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "report"}
            onClick={() => setTab("report")}
            className={`px-4 py-2.5 text-[13px] font-semibold ${
              tab === "report" ? "border-b-2 border-link text-text" : "text-muted hover:text-text"
            }`}
          >
            {t("reportTab")}
          </button>
        </div>
      ) : null}
      {tab === "context" && hasContext ? <SiteRichContent html={contextHtml} /> : null}
      {tab === "report" && hasReport ? <SiteRichContent html={reportHtml} /> : null}
      {tab === "context" && !hasContext && hasReport ? <SiteRichContent html={reportHtml} /> : null}
      {tab === "report" && !hasReport && hasContext ? <SiteRichContent html={contextHtml} /> : null}
    </div>
  );
}