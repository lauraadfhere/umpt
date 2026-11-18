/* eslint-disable @next/next/no-img-element -- footer logo URLs come from Parse/R2 hosts */
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LogoSettings } from "@/lib/logo-config";
import { DEFAULT_LOGO_SETTINGS } from "@/lib/logo-config";
import { NAV } from "@/lib/nav";
import { CONTACT_EMAIL } from "@/lib/site";
import { BrandMark } from "@/components/layout/BrandMark";
import { FooterLanguages } from "@/components/layout/FooterLanguages";
import { IconMail, IconMessage, IconRss } from "@/components/ui/Icons";

function FooterArt() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <circle cx="150" cy="60" r="150" fill="none" stroke="#151515" strokeWidth="44" />
      <path d="M-60 200 L160 -20" stroke="#131313" strokeWidth="60" fill="none" />
      <path d="M560 320 L760 40 L960 320 Z" fill="#161616" />
      <path d="M820 -40 L1040 180 L1260 -40 Z" fill="#121212" />
    </svg>
  );
}

function Column({ title, first = false, children }: { title: string; first?: boolean; children: React.ReactNode }) {
  return (
    <div className={first ? "" : "border-footer-line md:border-s md:ps-10 lg:ps-14"}>
      <h2 className="mb-5 text-[13px] font-bold text-white">{title}</h2>
      {children}
    </div>
  );
}

function FooterBrand({ logo }: { logo: LogoSettings }) {
  const t = useTranslations();
  const tBrand = useTranslations("brand");
  const footerImage = logo.mode === "image" ? logo.footerUrl || logo.headerUrl : "";
  const orgLine = [logo.textOrg1, logo.textOrg2].filter(Boolean).join(" · ");

  return (
    <div className="max-w-[280px] pb-2 sm:max-w-none md:pe-6 lg:pe-10">
      {footerImage ? (
        <Link href="/" className="inline-flex text-white" aria-label={tBrand("home")}>
          <img src={footerImage} alt="" className="h-auto max-h-11 w-auto object-contain" style={{ width: logo.footerWidth }} />
        </Link>
      ) : (
        <BrandMark logo={logo} variant="footer" />
      )}
      <p className="mt-5 text-[12px] leading-[1.6] text-white/75">{t("footer.brandBlurb")}</p>
      {orgLine ? <p className="mt-3 text-[11px] font-medium tracking-wide text-white/55 uppercase">{orgLine}</p> : null}
      <Link href="/about" className="mt-4 inline-block text-[12px] font-medium text-white/90 underline-offset-2 hover:text-white hover:underline">
        {t("footer.learnMore")}
      </Link>
    </div>
  );
}

const linkClass = "text-white/85 hover:text-white hover:underline";

export function SiteFooter({ logo = DEFAULT_LOGO_SETTINGS }: { logo?: LogoSettings }) {
  const t = useTranslations();

  return (
    <footer className="relative mt-auto overflow-hidden bg-chrome text-white">
      <FooterArt />
      <div className="relative mx-auto grid max-w-[1200px] gap-x-6 gap-y-10 px-6 pt-10 pb-10 text-[13px] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <div className="border-footer-line sm:col-span-2 lg:col-span-1 lg:border-e lg:pe-10">
          <FooterBrand logo={logo} />
        </div>

        <Column title={t("footer.categories")} first>
          <ul className="space-y-1.5">
            {NAV.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className={linkClass}>{t(`nav.${key}`)}</Link>
              </li>
            ))}
          </ul>
        </Column>

        <Column title={t("footer.languages")}>
          <FooterLanguages />
        </Column>

        <Column title={t("footer.account")}>
          <ul className="space-y-1.5">
            <li><Link href="/about" className={linkClass}>{t("footer.about")}</Link></li>
            <li><Link href="/contact" className={linkClass}>{t("footer.contact")}</Link></li>
            <li><Link href="/privacy" className={linkClass}>{t("footer.privacy")}</Link></li>
            <li><Link href="/terms" className={linkClass}>{t("footer.terms")}</Link></li>
            <li><Link href="/login" className={linkClass}>{t("footer.signIn")}</Link></li>
            <li><Link href="/dashboard" className={linkClass}>{t("footer.dashboard")}</Link></li>
          </ul>
        </Column>

        <Column title={t("footer.connect")}>
          <ul className="space-y-1.5">
            <li>
              <Link href="/contact" className={`inline-flex items-center gap-4 ${linkClass}`}>
                <IconMail className="size-3 text-white/70" />
                {t("footer.contactForm")}
              </Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`inline-flex items-center gap-4 ${linkClass}`}>
                <IconMail className="size-3 text-white/70" />
                {t("footer.email")}
              </a>
            </li>
            <li>
              <Link href="/feedback" className={`inline-flex items-center gap-4 ${linkClass}`}>
                <IconMessage className="size-3 text-white/70" />
                {t("footer.feedback")}
              </Link>
            </li>
            <li>
              <a href="/api/rss" className={`inline-flex items-center gap-4 ${linkClass}`}>
                <IconRss className="size-3 text-white/70" />
                {t("footer.rss")}
              </a>
            </li>
          </ul>
        </Column>
      </div>

      <div className="relative border-t border-chrome-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-[12px] text-white/60">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-[11px] text-white/45">{t("footer.brand")}</p>
        </div>
      </div>
    </footer>
  );
}