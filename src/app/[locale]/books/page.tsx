import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBooks } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { BooksSection } from "@/components/books/BooksSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "books" });
  return pageMetadata({ locale, path: "/books", title: t("heroTitle"), description: t("metaDescription") });
}

export default async function BooksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("books");
  const tCommon = await getTranslations("breadcrumb");
  const { books } = await getBooks();

  return (
    <PageShell
      active="books"
      hero={{ title: t("heroTitle"), search: { action: `/${locale}/proceedings`, placeholder: t("heroSearch") } }}
      breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}
    >
      <BooksSection books={books} title={t("allTitle")} />
    </PageShell>
  );
}
