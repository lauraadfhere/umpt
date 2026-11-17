import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProjectById } from "@/lib/admin-projects";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { ProjectForm } from "@/components/admin/ProjectForm";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const project = await getAdminProjectById(id);
  const t = await getTranslations({ locale, namespace: "dashboard.projects" });
  return { title: project ? t("editNamed", { title: project.title }) : t("listTitle"), robots: { index: false } };
}

export default async function DashboardProjectEditPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const project = await getAdminProjectById(id);
  if (!project) notFound();
  const t = await getTranslations("dashboard.projects");

  return (
    <DashboardShell active="projects" title={t("editNamed", { title: project.title })}>
      <ProjectForm mode="edit" initial={project} />
    </DashboardShell>
  );
}