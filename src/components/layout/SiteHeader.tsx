"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SubscribeUpgrade } from "@/components/layout/SubscribeUpgrade";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { IconSearch } from "@/components/ui/Icons";
import type { LogoSettings } from "@/lib/logo-config";
import { NAV, type NavKey } from "@/lib/nav";

function BurgerIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    );
  }
  return (
    <span className="flex w-[22px] flex-col gap-[5px]" aria-hidden>
      <span className="block h-[2px] w-full rounded-full bg-current" />
      <span className="block h-[2px] w-full rounded-full bg-current" />
      <span className="block h-[2px] w-full rounded-full bg-current" />
    </span>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20.5c.5-3.5 2.8-5.5 6.5-5.5s6 2 6.5 5.5" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="currentColor">
      <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
    </svg>
  );
}

export function SiteHeader({
  active,
  signedIn = false,
  logo,
  hideMobileSectionBar = false,
  readingTitle,
}: {
  active?: NavKey;
  signedIn?: boolean;
  logo?: LogoSettings;
  /** Reading pages use a sticky SubNav instead of the gray section strip. */
  hideMobileSectionBar?: boolean;
  /** Desktop-only: when set, scrolling collapses the header to logo + italic title + icons. */
  readingTitle?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const menuId = useId();
  const sectionId = useId();
  const desktopMenuId = useId();
  const desktopSearchId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [readerSignedIn, setReaderSignedIn] = useState(false);
  const [readingCompact, setReadingCompact] = useState(false);
  const [desktopNavOpen, setDesktopNavOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/reader/session")
      .then(async (response) => {
        const data = (await response.json()) as { session?: unknown };
        setReaderSignedIn(Boolean(data.session));
      })
      .catch(() => setReaderSignedIn(false));
  }, []);

  useEffect(() => {
    if (!readingTitle) {
      setReadingCompact(false);
      document.documentElement.style.removeProperty("--sticky-site-header");
      return;
    }
    function update() {
      const compact = window.scrollY > 72 && window.matchMedia("(min-width: 768px)").matches;
      setReadingCompact(compact);
      // Compact bar is one row (~52px); keep SubNav flush under it (no white gap).
      document.documentElement.style.setProperty("--sticky-site-header", compact ? "3.25rem" : "6rem");
      if (!compact) {
        setDesktopNavOpen(false);
        setDesktopSearchOpen(false);
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--sticky-site-header");
    };
  }, [readingTitle]);

  useEffect(() => {
    if (!desktopNavOpen && !desktopSearchOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDesktopNavOpen(false);
        setDesktopSearchOpen(false);
      }
    }
    function onPointer(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setDesktopNavOpen(false);
        setDesktopSearchOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [desktopNavOpen, desktopSearchOpen]);

  const sectionLabel = active ? t(`nav.${active}`) : t("nav.mobileHome");

  useEffect(() => {
    if (!menuOpen && !sectionOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSectionOpen(false);
      }
    }
    function onPointer(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setSectionOpen(false);
      }
    }
    if (menuOpen) document.body.style.overflow = "hidden";
    else if (!sectionOpen) document.body.style.overflow = "";
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen, sectionOpen]);

  const authLinks = signedIn ? (
    <>
      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center border-s border-white/10 px-4 font-medium hover:underline max-md:border-0 max-md:px-0 max-md:py-2">
        {t("auth.dashboard")}
      </Link>
      <div className="flex items-center border-s border-white/10 px-3 max-md:border-0 max-md:px-0">
        <SignOutButton className="h-8 bg-register px-3 font-semibold text-register-text hover:brightness-110 max-md:w-full" />
      </div>
    </>
  ) : (
    <>
      <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center border-s border-white/10 px-4 font-medium hover:underline max-md:border-0 max-md:px-0 max-md:py-2">
        {t("auth.signIn")}
      </Link>
      <div className="flex items-center border-s border-white/10 px-3 max-md:border-0 max-md:px-0">
        <Link href="/login" onClick={() => setMenuOpen(false)} className="flex h-8 items-center bg-register px-3 font-semibold text-register-text hover:brightness-110 max-md:min-h-11 max-md:w-full max-md:justify-center">
          {t("auth.register")}
        </Link>
      </div>
    </>
  );

  const userHref = signedIn ? "/dashboard" : readerSignedIn ? "/reader" : "/login";
  const userLabel = signedIn ? t("auth.dashboard") : readerSignedIn ? t("reader.hub.title") : t("auth.signIn");

  return (
    <header ref={headerRef} className="sticky top-0 z-[60] bg-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
        {/* Mobile: ACM-style top bar (black) */}
        <div className="grid min-h-[48px] grid-cols-[52px_1fr_52px] items-stretch border-b border-white/15 md:hidden">
        <button
          type="button"
          className="flex touch-manipulation items-center justify-center border-e border-white/20 hover:bg-white/5"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          onClick={() => {
            setSectionOpen(false);
            setMenuOpen((value) => !value);
          }}
        >
          <BurgerIcon open={menuOpen} />
        </button>
        <div className="flex items-center justify-center border-x border-white/20 px-1">
          <BrandMark logo={logo} variant="header" compact />
        </div>
        <Link href={userHref} className="flex items-center justify-center border-s border-white/20 hover:bg-white/5" aria-label={userLabel}>
          <IconUser className="size-7" />
        </Link>
        </div>

        {/* Mobile: gray section strip — ACM “CONEXT” bar (hidden when sticky SubNav is shown) */}
        <div
          className={`relative border-y border-black bg-gradient-to-b from-[#efefef] via-[#e6e6e6] to-[#dddddd] text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] md:hidden ${hideMobileSectionBar ? "hidden" : ""}`}
        >
        <button
          type="button"
          className="mx-auto flex w-full max-w-[1200px] touch-manipulation items-center justify-center gap-1 px-4 py-[9px] text-[12px] font-semibold tracking-[0.16em] text-[#1a1a1a] uppercase"
          aria-expanded={sectionOpen}
          aria-controls={sectionId}
          onClick={() => {
            setMenuOpen(false);
            setSectionOpen((value) => !value);
          }}
        >
          <span>{sectionLabel}</span>
          <IconChevronDown className={`size-[14px] shrink-0 text-[#333] transition ${sectionOpen ? "rotate-180" : ""}`} />
        </button>
        {sectionOpen && (
          <ul id={sectionId} className="absolute start-0 end-0 top-full z-50 max-h-[60vh] overflow-y-auto border-b border-black bg-[#e8e8e8] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <li>
              <Link
                href="/"
                onClick={() => setSectionOpen(false)}
                className={`block border-b border-[#d0d0d0] px-4 py-3 text-center text-[14px] font-medium ${!active ? "bg-white font-semibold text-link" : "hover:bg-white/70"}`}
              >
                {t("nav.mobileHome")}
              </Link>
            </li>
            {NAV.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  onClick={() => setSectionOpen(false)}
                  aria-current={active === key ? "page" : undefined}
                  className={`block border-b border-[#d0d0d0] px-4 py-3 text-center text-[14px] font-medium last:border-b-0 ${active === key ? "bg-white font-semibold text-link" : "hover:bg-white/70"}`}
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        </div>

      {/* Desktop: compact reading bar (post pages, after scroll) — mobile untouched */}
      {readingTitle && readingCompact ? (
        <div className="relative hidden min-h-[52px] items-stretch border-b border-white/10 md:flex">
          <div className="flex min-w-0 flex-1 items-center gap-4 px-3 py-2">
            <div className="shrink-0">
              <BrandMark logo={logo} />
            </div>
            <p className="min-w-0 flex-1 truncate text-[15px] italic leading-snug text-white/95" title={readingTitle}>
              {readingTitle}
            </p>
          </div>
          <div className="flex shrink-0 items-stretch text-[13px]">
            <button
              type="button"
              className="grid w-11 place-items-center border-s border-white/10 hover:bg-white/5"
              aria-expanded={desktopSearchOpen}
              aria-controls={desktopSearchId}
              aria-label={t("search.submit")}
              onClick={() => {
                setDesktopNavOpen(false);
                setDesktopSearchOpen((value) => !value);
              }}
            >
              <IconSearch className="size-4" />
            </button>
            <button
              type="button"
              className="grid w-11 place-items-center border-s border-white/10 hover:bg-white/5"
              aria-expanded={desktopNavOpen}
              aria-controls={desktopMenuId}
              aria-label={desktopNavOpen ? t("nav.menuClose") : t("nav.menuOpen")}
              onClick={() => {
                setDesktopSearchOpen(false);
                setDesktopNavOpen((value) => !value);
              }}
            >
              <BurgerIcon open={desktopNavOpen} />
            </button>
            <div className="flex items-center border-s border-white/10 px-3">
              <LanguageSwitcher />
            </div>
            {authLinks}
          </div>

          {desktopSearchOpen ? (
            <form
              id={desktopSearchId}
              action={`/${locale}/proceedings`}
              role="search"
              className="absolute inset-x-0 top-full z-50 flex h-11 border-b border-white/15 bg-black px-3 shadow-lg"
            >
              <label className="sr-only" htmlFor="reading-sticky-search">
                {t("search.placeholder")}
              </label>
              <input
                id="reading-sticky-search"
                name="q"
                type="search"
                autoFocus
                placeholder={t("search.placeholder")}
                className="min-w-0 flex-1 bg-transparent px-2 text-[14px] text-white outline-none placeholder:text-white/70"
              />
              <button type="submit" className="grid w-11 place-items-center text-white hover:bg-white/5" aria-label={t("search.submit")}>
                <IconSearch className="size-4" />
              </button>
            </form>
          ) : null}

          {desktopNavOpen ? (
            <nav
              id={desktopMenuId}
              aria-label={t("nav.label")}
              className="absolute inset-x-0 top-full z-50 max-h-[min(70vh,28rem)] overflow-y-auto border-b border-white/15 bg-black shadow-lg"
            >
              <ul className="mx-auto flex max-w-[1200px] flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-[15px] font-medium">
                {NAV.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      onClick={() => setDesktopNavOpen(false)}
                      aria-current={active === key ? "page" : undefined}
                      className={`inline-block py-2 hover:underline ${active === key ? "underline decoration-2 underline-offset-8" : ""}`}
                    >
                      {t(`nav.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      ) : (
        <>
          {/* Desktop: original chrome row */}
          <div className="hidden min-h-[50px] items-stretch justify-between border-b border-white/10 ps-3 md:flex">
            <div className="flex items-center py-2">
              <BrandMark logo={logo} />
            </div>
            <div className="flex items-stretch text-[13px]">
              <div className="flex items-center px-3">
                <SubscribeUpgrade />
              </div>
              <div className="flex items-center border-s border-white/10 px-3">
                <LanguageSwitcher />
              </div>
              {authLinks}
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-between gap-3 px-3 py-2 md:flex">
            <nav aria-label={t("nav.label")} className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] font-medium">
              {NAV.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                  className={`py-1.5 hover:underline ${active === key ? "underline decoration-2 underline-offset-[10px]" : ""}`}
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <form action={`/${locale}/proceedings`} className="flex h-[30px]" role="search">
                <label className="sr-only" htmlFor="global-search">
                  {t("search.placeholder")}
                </label>
                <input
                  id="global-search"
                  name="q"
                  type="search"
                  placeholder={t("search.placeholder")}
                  className="w-[180px] bg-chrome-field px-2 text-[13px] text-white outline-none placeholder:text-white/85 focus:bg-[#555] lg:w-[180px]"
                />
                <button type="submit" className="grid w-[34px] place-items-center bg-chrome-button hover:bg-[#6a6a6a]" aria-label={t("search.submit")}>
                  <IconSearch className="size-4" />
                </button>
              </form>
              <Link href="/proceedings" className="text-[12px] hover:underline">
                {t("search.advanced")}
              </Link>
            </div>
          </div>
        </>
      )}

      {menuOpen && (
        <>
          <div className="fixed inset-0 top-[88px] z-30 bg-black/50 md:hidden" aria-hidden onClick={() => setMenuOpen(false)} />
          <div
            id={menuId}
            className="absolute start-0 end-0 top-full z-40 max-h-[min(75vh,calc(100dvh-5.5rem))] overflow-y-auto border-b border-white/15 bg-black shadow-lg md:hidden"
          >
            <nav aria-label={t("nav.label")} className="flex flex-col px-4 py-3 text-[16px] font-medium">
              {NAV.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === key ? "page" : undefined}
                  className={`border-b border-white/10 py-3.5 last:border-b-0 hover:underline ${active === key ? "text-white underline decoration-2 underline-offset-4" : "text-white/90"}`}
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 px-4 py-4">
              <LanguageSwitcher />
            </div>
            <div className="border-t border-white/10 px-4 py-4">
              <SubscribeUpgrade />
            </div>
            <form action={`/${locale}/proceedings`} className="border-t border-white/10 px-4 py-4" role="search" onSubmit={() => setMenuOpen(false)}>
              <label className="mb-2 block text-[12px] font-semibold tracking-wide text-white/80 uppercase" htmlFor="mobile-global-search">
                {t("search.placeholder")}
              </label>
              <div className="flex h-10">
                <input
                  id="mobile-global-search"
                  name="q"
                  type="search"
                  placeholder={t("search.placeholder")}
                  className="min-w-0 flex-1 bg-chrome-field px-3 text-[15px] text-white outline-none placeholder:text-white/85"
                />
                <button type="submit" className="grid w-11 place-items-center bg-chrome-button" aria-label={t("search.submit")}>
                  <IconSearch className="size-4" />
                </button>
              </div>
              <Link href="/proceedings" onClick={() => setMenuOpen(false)} className="mt-3 inline-block text-[13px] hover:underline">
                {t("search.advanced")}
              </Link>
            </form>
            <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4">{authLinks}</div>
          </div>
        </>
      )}
    </header>
  );
}