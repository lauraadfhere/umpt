import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { BookForm } from "@/components/admin/BookForm";
import { DashboardShell } from "@/components/admin/DashboardShell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.books" });
  return { title: t("new"), robots: { index: false } };
}

export default async function NewBookPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.books");

  return (
    <DashboardShell active="books" title={t("new")}>
      <BookForm mode="create" />
    </DashboardShell>
  );
}