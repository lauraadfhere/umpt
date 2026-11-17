import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getProfileSettingsUncached } from "@/lib/profile";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { ProfileForm } from "@/components/admin/ProfileForm";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.profile" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.profile");
  const settings = await getProfileSettingsUncached();

  return (
    <DashboardShell active="profile" title={t("title")}>
      <p className="mb-6 max-w-2xl text-[14px] text-muted">{t("hint")}</p>
      <ProfileForm initial={settings} />
    </DashboardShell>
  );
}
