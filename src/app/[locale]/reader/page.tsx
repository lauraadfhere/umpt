import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { ReaderHub } from "@/components/reader/ReaderHub";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reader.hub" });
  return { title: t("title"), robots: { index: false } };
}

export default async function ReaderHubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tBreadcrumb = await getTranslations("breadcrumb");

  return (
    <PageShell breadcrumbs={[{ label: tBreadcrumb("home"), href: "/" }, { label: tBreadcrumb("reader") }]}>
      <ReaderHub locale={locale} />
    </PageShell>
  );
}