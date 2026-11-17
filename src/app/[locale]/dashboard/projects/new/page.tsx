import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { ProjectForm } from "@/components/admin/ProjectForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.projects" });
  return { title: t("new"), robots: { index: false } };
}

export default async function DashboardProjectNewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.projects");

  return (
    <DashboardShell active="projects" title={t("new")}>
      <ProjectForm mode="create" />
    </DashboardShell>
  );
}