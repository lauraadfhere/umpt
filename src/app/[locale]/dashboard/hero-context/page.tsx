import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getHeroContextSettings } from "@/lib/hero-context";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { HeroContextForm } from "@/components/admin/HeroContextForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.heroContext" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardHeroContextPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations("dashboard.heroContext");
  const settings = await getHeroContextSettings();

  return (
    <DashboardShell active="heroContext" title={t("title")}>
      <HeroContextForm initial={settings} />
    </DashboardShell>
  );
}