"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { IconReadingOptions } from "@/components/ui/Icons";
import {
  DEFAULT_TEXT_INDEX,
  DEFAULT_WIDTH,
  TEXT_STEPS,
  WIDTH_MAX,
  loadReadingPreferences,
  saveReadingPreferences,
  type ReadingTheme,
  type ReadingWidth,
} from "@/lib/reading-preferences";

type ReadingContextValue = {
  width: ReadingWidth;
  textIndex: number;
  theme: ReadingTheme;
  textSizePx: number;
  contentMaxClass: string;
  setWidth: (width: ReadingWidth) => void;
  setTextIndex: (index: number) => void;
  setTheme: (theme: ReadingTheme) => void;
};

const ReadingContext = createContext<ReadingContextValue | null>(null);

export function useReadingPreferences() {
  const value = useContext(ReadingContext);
  if (!value) throw new Error("useReadingPreferences must be used within PostReadingShell");
  return value;
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

function ReadingOptionsMenu() {
  const t = useTranslations("reading.display");
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { width, textIndex, theme, textSizePx, setWidth, setTextIndex, setTheme } = useReadingPreferences();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panel =
    theme === "dark"
      ? "absolute end-0 top-full z-20 mt-2 w-[min(288px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#3d3d3d] bg-[#262626] py-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      : "absolute end-0 top-full z-20 mt-2 w-[min(288px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white py-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)]";
  const section = "px-3.5 py-2.5";
  const heading =
    theme === "dark" ? "px-1 text-[11px] font-semibold tracking-wide text-[#a8a8a8] uppercase" : "px-1 text-[11px] font-semibold tracking-wide text-muted uppercase";
  const rowBtn =
    theme === "dark"
      ? "flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#333] px-2 py-2.5 text-[13px] text-[#e8e8e8] transition hover:bg-[#3d3d3d] disabled:opacity-40"
      : "flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#f4f4f5] px-2 py-2.5 text-[13px] text-text transition hover:bg-[#ebebec] disabled:opacity-40";
  const choice =
    theme === "dark"
      ? "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-[13px] text-[#e8e8e8] transition hover:bg-[#333]"
      : "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-[13px] text-text transition hover:bg-[#f4f4f5]";
  const choiceActive = theme === "dark" ? "bg-[#333] text-[#8ab4e8] ring-1 ring-[#8ab4e8]/40" : "bg-[#eef4ff] text-link ring-1 ring-link/25";
  const trigger =
    theme === "dark"
      ? "inline-flex size-10 items-center justify-center rounded-full bg-[#333] text-[#e8e8e8] shadow-sm transition hover:bg-[#3d3d3d] hover:shadow-md data-[open=true]:bg-[#3d3d3d]"
      : "inline-flex size-10 items-center justify-center rounded-full bg-white text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] transition hover:shadow-md data-[open=true]:bg-[#f7f7f8]";

  return (
    <div ref={rootRef} className="relative -mt-1 mb-4 flex justify-end">
      <button
        type="button"
        className={trigger}
        data-open={open}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={t("toolbarLabel")}
        title={t("menuLabel")}
        onClick={() => setOpen((value) => !value)}
      >
        <IconReadingOptions className="size-[18px] shrink-0" />
      </button>

      {open && (
        <div id={menuId} role="menu" className={panel} aria-label={t("toolbarLabel")}>
          <div className={`${section} border-b border-rule/80 ${theme === "dark" ? "border-[#3d3d3d]" : ""}`}>
            <p className={heading}>{t("textSize")}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                role="menuitem"
                className={rowBtn}
                disabled={textIndex <= 0}
                onClick={() => setTextIndex(Math.max(0, textIndex - 1))}
              >
                <span className="font-semibold">A−</span>
              </button>
              <span className="min-w-[3rem] text-center text-[13px] text-muted">{textSizePx}px</span>
              <button
                type="button"
                role="menuitem"
                className={rowBtn}
                disabled={textIndex >= TEXT_STEPS.length - 1}
                onClick={() => setTextIndex(Math.min(TEXT_STEPS.length - 1, textIndex + 1))}
              >
                <span className="text-[15px] font-semibold">A+</span>
              </button>
            </div>
          </div>

          <div className={`${section} border-b border-rule/80 ${theme === "dark" ? "border-[#3d3d3d]" : ""}`}>
            <p className={heading}>{t("columnWidth")}</p>
            <div className="mt-2 space-y-1.5">
              {(["narrow", "comfortable", "wide"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={width === key}
                  className={`${choice} ${width === key ? choiceActive : ""}`}
                  onClick={() => setWidth(key)}
                >
                  <span className="size-4 shrink-0 text-center text-[11px] font-bold opacity-70" aria-hidden>
                    {key === "narrow" ? "S" : key === "comfortable" ? "M" : "L"}
                  </span>
                  {t(`width_${key}`)}
                </button>
              ))}
            </div>
          </div>

          <div className={section}>
            <p className={heading}>{t("appearance")}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={theme === "light"}
                className={`${choice} justify-center ${theme === "light" ? choiceActive : ""}`}
                onClick={() => setTheme("light")}
              >
                <IconSun className="size-4" />
                {t("lightMode")}
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={theme === "dark"}
                className={`${choice} justify-center ${theme === "dark" ? choiceActive : ""}`}
                onClick={() => setTheme("dark")}
              >
                <IconMoon className="size-4" />
                {t("darkMode")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PostReadingShell({ children }: { children: ReactNode }) {
  const [width, setWidthState] = useState<ReadingWidth>(DEFAULT_WIDTH);
  const [textIndex, setTextIndexState] = useState(DEFAULT_TEXT_INDEX);
  const [theme, setThemeState] = useState<ReadingTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prefs = loadReadingPreferences();
    setWidthState(prefs.width);
    setTextIndexState(prefs.textIndex);
    setThemeState(prefs.theme);
    setReady(true);
  }, []);

  const value = useMemo<ReadingContextValue>(
    () => ({
      width,
      textIndex,
      theme,
      textSizePx: TEXT_STEPS[textIndex],
      contentMaxClass: WIDTH_MAX[width],
      setWidth: (next) => {
        setWidthState(next);
        saveReadingPreferences({ width: next });
      },
      setTextIndex: (next) => {
        setTextIndexState(next);
        saveReadingPreferences({ textIndex: next });
      },
      setTheme: (next) => {
        setThemeState(next);
        saveReadingPreferences({ theme: next });
      },
    }),
    [width, textIndex, theme],
  );

  return (
    <ReadingContext.Provider value={value}>
      <div
        data-reading-theme={ready ? theme : "light"}
        className={`reading-surface transition-colors ${theme === "dark" ? "rounded-2xl bg-[#1a1a1a] px-3 py-2 sm:px-4" : ""}`}
      >
        <ReadingOptionsMenu />
        <div className={value.contentMaxClass} style={{ fontSize: `${TEXT_STEPS[textIndex]}px` }}>
          {children}
        </div>
      </div>
    </ReadingContext.Provider>
  );
}