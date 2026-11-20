import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { metaDescription, NOINDEX_ROBOTS, SITE_NAME } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrowRight } from "@/components/ui/Icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");
  const description = metaDescription(t("metaDescription"));
  return {
    title: t("title"),
    description,
    robots: NOINDEX_ROBOTS,
    openGraph: { siteName: SITE_NAME, title: t("title"), description, type: "website" },
    twitter: { card: "summary", title: t("title"), description },
  };
}

const LINKS = [
  { key: "home", href: "/" },
  { key: "posts", href: "/posts" },
  { key: "contact", href: "/contact" },
  { key: "questions", href: "/questions" },
  { key: "categories", href: "/categories" },
  { key: "about", href: "/about" },
  { key: "proceedings", href: "/proceedings" },
  { key: "books", href: "/books" },
  { key: "people", href: "/people" },
] as const;

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tCommon = await getTranslations("breadcrumb");

  return (
    <PageShell breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]}>
      <div className="relative overflow-hidden">
        <svg className="pointer-events-none absolute end-0 top-0 h-[420px] w-[380px] rtl:-scale-x-100" viewBox="0 0 380 420" aria-hidden>
          <path d="M380 0 L380 300 L150 0 Z" fill="#f7f7f7" />
          <path d="M380 150 L380 420 L210 290 Z" fill="#f9f9f9" />
        </svg>
        <div className="relative mx-auto grid max-w-[1200px] gap-x-12 gap-y-8 px-6 pt-6 pb-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
          <p className="text-[120px] leading-none font-light text-[#c9c9c9] md:text-[168px]" aria-hidden>
            404
          </p>
          <div className="max-w-[620px] md:pt-5">
            <h1 className="text-[30px] leading-[1.2] font-semibold text-text">{t("title")}</h1>
            <p className="mt-4 text-[16px] leading-[1.7] text-text">{t("body")}</p>

            <div className="mt-9 bg-panel">
              <div className="bg-panel-head px-3 py-2.5">
                <SectionTitle size="sm" tone="accent">{t("linksTitle")}</SectionTitle>
              </div>
              <ul className="px-3 pb-2">
                {LINKS.map(({ key, href }) => (
                  <li key={key} className="border-b border-rule last:border-b-0">
                    <Link href={href} className="flex items-center justify-between gap-4 py-2.5 ps-3 text-[15px] text-link hover:text-link-hover hover:underline">
                      {t(`links.${key}`)}
                      <IconArrowRight className="h-3 w-7 shrink-0 rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
