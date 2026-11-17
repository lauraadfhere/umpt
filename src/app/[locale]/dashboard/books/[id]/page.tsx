import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminBookById } from "@/lib/admin-books";
import { BookForm } from "@/components/admin/BookForm";
import { DashboardShell } from "@/components/admin/DashboardShell";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.books" });
  const book = await getAdminBookById(id);
  return { title: book ? t("editNamed", { title: book.title }) : t("edit"), robots: { index: false } };
}

export default async function EditBookPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.books");

  const book = await getAdminBookById(id);
  if (!book) notFound();

  return (
    <DashboardShell active="books" title={t("editNamed", { title: book.title })}>
      <BookForm mode="edit" initial={book} />
    </DashboardShell>
  );
}