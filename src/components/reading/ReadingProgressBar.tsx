"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { loadReadingPreferences, READING_PREFS_EVENT, type ReadingTheme } from "@/lib/reading-preferences";

/** Thin top-of-page reading progress for long articles. */
export function ReadingProgressBar() {
  const t = useTranslations("reading");
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<ReadingTheme>("light");

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
      } else {
        setProgress(Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)));
      }
      setTheme(loadReadingPreferences().theme);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("storage", update);
    window.addEventListener(READING_PREFS_EVENT, update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("storage", update);
      window.removeEventListener(READING_PREFS_EVENT, update);
    };
  }, []);

  const scale = progress / 100;

  return (
    <div
      data-reading-theme={theme}
      role="progressbar"
      aria-label={t("readingProgress")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] bg-panel-head"
    >
      <div
        className="h-full w-full bg-[var(--color-reading-progress)] shadow-[0_0_10px_color-mix(in_srgb,var(--color-reading-progress)_55%,transparent)] transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${scale})`, transformOrigin: "inline-start" }}
      />
    </div>
  );
}