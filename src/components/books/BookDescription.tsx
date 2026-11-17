"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** Collapsible book blurb (Kindle-style “Read more”). */
export function BookDescription({ text }: { text: string }) {
  const t = useTranslations("books.detail");
  const [expanded, setExpanded] = useState(false);
  const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const showToggle = text.length > 420 || paragraphs.length > 3;

  return (
    <div className="text-[15px] leading-[1.6] text-text">
      <div className={`space-y-3 ${!expanded && showToggle ? "max-h-[9.5rem] overflow-hidden" : ""}`}>
        {paragraphs.map((paragraph, index) => {
          const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
          const bullets = lines.filter((line) => line.startsWith("•") || line.startsWith("-"));
          if (bullets.length > 0 && bullets.length === lines.length) {
            return (
              <ul key={index} className="list-disc space-y-1 ps-5">
                {bullets.map((line) => (
                  <li key={line}>{line.replace(/^[•-]\s*/, "")}</li>
                ))}
              </ul>
            );
          }
          return <p key={index}>{paragraph}</p>;
        })}
      </div>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-[14px] font-semibold text-link hover:underline"
        >
          {expanded ? t("readLess") : t("readMore")}
        </button>
      )}
    </div>
  );
}