import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getHomePostsAccentSettings } from "@/lib/home-posts-accent";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { HomePostsAccentForm } from "@/components/admin/HomePostsAccentForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.homePosts" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardHomeSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations("dashboard.homePosts");
  const settings = await getHomePostsAccentSettings();

  return (
    <DashboardShell active="home" title={t("title")}>
      <HomePostsAccentForm initial={settings} />
    </DashboardShell>
  );
}