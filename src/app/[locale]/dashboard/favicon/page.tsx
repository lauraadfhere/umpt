import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getFaviconSettingsUncached } from "@/lib/favicon";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { FaviconForm } from "@/components/admin/FaviconForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.favicon" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardFaviconPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations("dashboard.favicon");
  const settings = await getFaviconSettingsUncached();

  return (
    <DashboardShell active="favicon" title={t("title")}>
      <FaviconForm initial={settings} />
    </DashboardShell>
  );
}