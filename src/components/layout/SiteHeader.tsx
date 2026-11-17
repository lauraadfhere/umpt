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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <path d="M6 6l12 12M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function SiteHeader({ active, signedIn = false, logo }: { active?: NavKey; signedIn?: boolean; logo?: LogoSettings }) {
  const t = useTranslations();
  const locale = useLocale();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onPointer(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen]);

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

  return (
    <header ref={headerRef} className="relative z-40 bg-black text-white">
      <div className="flex min-h-[50px] items-stretch justify-between border-b border-white/10 ps-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 py-2">
          <button
            type="button"
            className="inline-flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-sm hover:bg-white/10 md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <BrandMark logo={logo} />
        </div>

        <div className="flex items-stretch text-[13px]">
          <div className="hidden items-center px-3 md:flex">
            <SubscribeUpgrade />
          </div>
          <div className="flex items-center border-s border-white/10 px-3">
            <LanguageSwitcher />
          </div>
          <div className="hidden items-stretch md:flex">{authLinks}</div>
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

      {menuOpen && (
        <>
          <div className="fixed inset-0 top-[50px] z-30 bg-black/50 md:hidden" aria-hidden onClick={() => setMenuOpen(false)} />
          <div
            id={menuId}
            className="absolute start-0 end-0 top-full z-40 max-h-[min(80vh,calc(100dvh-3.5rem))] overflow-y-auto border-b border-white/15 bg-black shadow-lg md:hidden"
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