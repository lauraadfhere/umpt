export type ReadingWidth = "narrow" | "comfortable" | "wide";
export type ReadingTheme = "light" | "dark";

export const WIDTH_MAX: Record<ReadingWidth, string> = {
  narrow: "max-w-[600px]",
  comfortable: "max-w-[680px]",
  wide: "max-w-[760px]",
};

const STORAGE_WIDTH = "umpt-reading-width";
const STORAGE_TEXT = "umpt-reading-text";
const STORAGE_THEME = "umpt-reading-theme";

export const TEXT_STEPS = [14, 15, 16, 17, 18] as const;
export const DEFAULT_TEXT_INDEX = 2; // 16px
export const MOBILE_DEFAULT_TEXT_INDEX = 4; // 18px when no saved preference on small screens
export const DEFAULT_WIDTH: ReadingWidth = "comfortable";

function defaultTextIndex() {
  if (typeof window === "undefined") return DEFAULT_TEXT_INDEX;
  if (localStorage.getItem(STORAGE_TEXT) !== null) return DEFAULT_TEXT_INDEX;
  return window.matchMedia("(max-width: 767px)").matches ? MOBILE_DEFAULT_TEXT_INDEX : DEFAULT_TEXT_INDEX;
}

export function loadReadingPreferences(): {
  width: ReadingWidth;
  textIndex: number;
  theme: ReadingTheme;
} {
  if (typeof window === "undefined") {
    return { width: DEFAULT_WIDTH, textIndex: DEFAULT_TEXT_INDEX, theme: "light" };
  }
  const width = localStorage.getItem(STORAGE_WIDTH);
  const text = Number(localStorage.getItem(STORAGE_TEXT));
  const theme = localStorage.getItem(STORAGE_THEME);
  return {
    width: width === "narrow" || width === "comfortable" || width === "wide" ? width : DEFAULT_WIDTH,
    textIndex: Number.isFinite(text) && text >= 0 && text < TEXT_STEPS.length ? text : defaultTextIndex(),
    theme: theme === "dark" ? "dark" : "light",
  };
}

export const READING_PREFS_EVENT = "umpt-reading-prefs";

export function saveReadingPreferences(partial: Partial<{ width: ReadingWidth; textIndex: number; theme: ReadingTheme }>) {
  if (typeof window === "undefined") return;
  if (partial.width) localStorage.setItem(STORAGE_WIDTH, partial.width);
  if (partial.textIndex !== undefined) localStorage.setItem(STORAGE_TEXT, String(partial.textIndex));
  if (partial.theme) localStorage.setItem(STORAGE_THEME, partial.theme);
  window.dispatchEvent(new Event(READING_PREFS_EVENT));
}