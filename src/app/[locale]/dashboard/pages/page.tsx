import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { getManagedPages } from "@/lib/site-pages";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { Panel } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pages" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.pages");
  const pages = await getManagedPages();

  return (
    <DashboardShell active="pages" title={t("title")}>
      <p className="mb-6 max-w-2xl text-[14px] text-muted">{t("hint")}</p>
      <Panel title={t("title")}>
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-start text-[14px]">
            <thead>
              <tr className="border-b-2 border-text text-[13px] text-muted">
                <th className="px-3 py-2.5 text-start font-semibold">{t("title")}</th>
                <th className="px-3 py-2.5 text-start font-semibold">{t("status")}</th>
                <th className="px-3 py-2.5 text-start font-semibold">{t("updated")}</th>
                <th className="px-3 py-2.5 text-start font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.slug} className="border-b border-[#eeeeee]">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-text">{page.title}</p>
                    <p className="mt-1 text-[12px] text-muted">/{page.slug}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[12px] font-semibold ${page.status === "published" && page.id ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
                      {page.id ? (page.status === "published" ? t("published") : t("draft")) : t("notCreated")}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted">{formatDate(page.updatedAt, locale) || "—"}</td>
                  <td className="px-3 py-3">
                    <Link href={`/dashboard/pages/${page.slug}`} className="text-[13px] text-link hover:underline">
                      {t("edit")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </DashboardShell>
  );
}
