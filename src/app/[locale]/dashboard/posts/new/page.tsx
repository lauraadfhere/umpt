import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategories } from "@/lib/admin-posts";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { PostForm } from "@/components/admin/PostForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.posts" });
  return { title: t("new"), robots: { index: false } };
}

export default async function NewPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.posts");
  const categories = await getCategories();

  return (
    <DashboardShell active="posts" title={t("new")}>
      <PostForm mode="create" categories={categories} />
    </DashboardShell>
  );
}
