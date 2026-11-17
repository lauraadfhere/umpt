import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProjects } from "@/lib/admin-projects";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { ImportLegacyProjectsButton } from "@/components/admin/ImportLegacyProjectsButton";
import { Panel } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.projects" });
  return { title: t("listTitle"), robots: { index: false } };
}

export default async function DashboardProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.projects");

  let projects: Awaited<ReturnType<typeof getAdminProjects>> = [];
  let error = "";
  try {
    projects = await getAdminProjects();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  return (
    <DashboardShell active="projects" title={t("listTitle")}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[14px] text-muted">{t("listHint")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <ImportLegacyProjectsButton />
          <Link href="/proceedings" className="border border-rule bg-white px-4 py-2.5 text-[14px] font-semibold text-text hover:border-link hover:text-link">
            {t("viewCatalog")}
          </Link>
          <Link href="/dashboard/projects/new" className="bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
            {t("new")}
          </Link>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <Panel title={t("listTitle")}>
        {projects.length === 0 ? (
          <p className="text-[14px] text-muted">{error ? t("loadError") : t("empty")}</p>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-start text-[14px]">
              <thead>
                <tr className="border-b-2 border-text text-[13px] text-muted">
                  <th className="px-3 py-2.5 text-start font-semibold">{t("title")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("acronym")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("year")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-[#eeeeee] align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-text">{project.title}</p>
                      <p className="mt-1 text-[12px] text-muted">/{project.slug}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{project.acronym || "—"}</td>
                    <td className="px-3 py-3 text-muted">{project.year || "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/dashboard/projects/${project.id}`} className="text-[13px] text-link hover:underline">
                          {t("edit")}
                        </Link>
                        <DeleteProjectButton id={project.id} title={project.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}