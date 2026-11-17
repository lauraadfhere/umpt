import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Panel } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.upload" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardUploadsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.upload");

  return (
    <DashboardShell active="uploads" title={t("title")}>
      <p className="mb-6 max-w-2xl text-[14px] text-muted">{t("pageHint")}</p>
      <Panel title={t("title")}>
        <ImageUploader />
      </Panel>
    </DashboardShell>
  );
}
