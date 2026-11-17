import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminPostRows } from "@/lib/admin-posts";
import { formatDate } from "@/lib/format";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { Panel } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.posts" });
  return { title: t("listTitle"), robots: { index: false } };
}

export default async function DashboardPostsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.posts");

  let posts: Awaited<ReturnType<typeof getAdminPostRows>> = [];
  let error = "";
  try {
    posts = await getAdminPostRows();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  return (
    <DashboardShell active="posts" title={t("listTitle")}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-muted">{t("listHint")}</p>
        <Link href="/dashboard/posts/new" className="bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
          {t("new")}
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <Panel title={t("listTitle")}>
        {posts.length === 0 ? (
          <p className="text-[14px] text-muted">{error ? t("loadError") : t("empty")}</p>
        ) : (
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
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-[#eeeeee] align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-text">{post.title}</p>
                      <p className="mt-1 text-[12px] text-muted">/{post.slug}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[12px] font-semibold ${post.status === "published" ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
                        {post.status === "published" ? t("published") : t("draft")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{formatDate(post.updatedAt ?? post.publishedAt, locale) || "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/dashboard/posts/${post.id}`} className="text-[13px] text-link hover:underline">
                          {t("edit")}
                        </Link>
                        <Link href={`/posts/${post.slug}`} className="text-[13px] text-link hover:underline" target="_blank">
                          {t("view")}
                        </Link>
                        <DeletePostButton id={post.id} title={post.title} />
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
