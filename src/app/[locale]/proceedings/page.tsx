import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBooks, getProceedings } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { ProceedingsExplorer } from "@/components/proceedings/ProceedingsExplorer";
import { BooksSection } from "@/components/books/BooksSection";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "proceedings" });
  return pageMetadata({ locale, path: "/proceedings", title: t("heroTitle"), description: t("metaDescription") });
}

export default async function ProceedingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("proceedings");
  const tCommon = await getTranslations("breadcrumb");
  const [{ proceedings }, { books }] = await Promise.all([getProceedings(), getBooks()]);

  return (
    <PageShell
      active="proceedings"
      subNav={[
        { label: t("tabs.main"), href: "/proceedings", active: true },
        { label: t("tabs.conferences"), href: "/proceedings" },
        { label: t("tabs.icps"), href: "/proceedings" },
      ]}
      hero={{ title: t("heroTitle"), search: { action: `/${locale}/proceedings`, placeholder: t("heroSearch"), defaultValue: q } }}
      breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}
    >
      <ProceedingsExplorer proceedings={proceedings} initialQuery={q} />
      <BooksSection books={books.slice(0, 3)} />
    </PageShell>
  );
}
