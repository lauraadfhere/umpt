import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { breadcrumbJsonLd, localeUrl, pageMetadata } from "@/lib/seo";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { PageShell } from "@/components/layout/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoriesPage" });
  return pageMetadata({ locale, path: "/categories", title: t("heroTitle"), description: t("metaDescription") });
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("categoriesPage");
  const tCommon = await getTranslations("breadcrumb");

  return (
    <PageShell hero={{ title: t("heroTitle") }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: t("heroTitle"), url: localeUrl(locale, "/categories") },
        ])}
      />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-12 sm:px-6">
        <p className="mb-6 max-w-[720px] text-[15px] leading-[1.6] text-muted">{t("intro")}</p>
        <SectionTitle className="mb-5">{t("listTitle")}</SectionTitle>
        <CategoryGrid />
      </div>
    </PageShell>
  );
}