import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SubscribeUpgrade } from "@/components/layout/SubscribeUpgrade";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { IconSearch } from "@/components/ui/Icons";
import type { LogoSettings } from "@/lib/logo-config";
import { NAV, type NavKey } from "@/lib/nav";

export function SiteHeader({ active, signedIn = false, logo }: { active?: NavKey; signedIn?: boolean; logo?: LogoSettings }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header className="bg-black text-white">
      <div className="flex min-h-[50px] flex-wrap items-stretch justify-between border-b border-white/10 ps-3">
        <div className="flex items-center py-2">
          <BrandMark logo={logo} />
        </div>

        <div className="flex items-stretch text-[13px]">
          <div className="hidden items-center px-3 md:flex">
            <SubscribeUpgrade />
          </div>
          <div className="flex items-center border-s border-white/10 px-3">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <>
              <Link href="/dashboard" className="flex items-center border-s border-white/10 px-4 font-medium hover:underline">
                {t("auth.dashboard")}
              </Link>
              <div className="flex items-center border-s border-white/10 px-3">
                <SignOutButton className="h-8 bg-register px-3 font-semibold text-register-text hover:brightness-110" />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center border-s border-white/10 px-4 font-medium hover:underline">
                {t("auth.signIn")}
              </Link>
              <div className="flex items-center border-s border-white/10 px-3">
                <Link href="/login" className="flex h-8 items-center bg-register px-3 font-semibold text-register-text hover:brightness-110">
                  {t("auth.register")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
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
            <label className="sr-only" htmlFor="global-search">{t("search.placeholder")}</label>
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
    </header>
  );
}
