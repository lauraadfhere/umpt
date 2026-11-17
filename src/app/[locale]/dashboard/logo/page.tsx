import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getLogoSettings } from "@/lib/logo";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { LogoForm } from "@/components/admin/LogoForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.logo" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardLogoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.logo");
  const settings = await getLogoSettings();

  return (
    <DashboardShell active="logo" title={t("title")}>
      <p className="mb-6 max-w-2xl text-[14px] text-muted">{t("hint")}</p>
      <LogoForm initial={settings} />
    </DashboardShell>
  );
}
