import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getCommentsForModeration, type ModeratedComment } from "@/lib/comments";
import { formatDate } from "@/lib/format";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { CommentActions } from "@/components/admin/CommentActions";
import { CommentReply } from "@/components/admin/CommentReply";
import { SeedMockCommentsButton } from "@/components/admin/SeedMockCommentsButton";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.comments" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardCommentsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.comments");
  const filter = status === "approved" || status === "all" ? status : "pending";

  let comments: ModeratedComment[] = [];
  let error = "";
  try {
    comments = await getCommentsForModeration();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  const pending = comments.filter((comment) => !comment.isApproved).length;
  const visible = comments.filter((comment) => (filter === "pending" ? !comment.isApproved : filter === "approved" ? comment.isApproved : true));
  const namesById = new Map(comments.map((item) => [item.id, item.name]));
  const filters = [
    { key: "pending", label: t("pending") },
    { key: "approved", label: t("approved") },
    { key: "all", label: t("all") },
  ] as const;

  return (
    <DashboardShell active="comments" title={t("title")}>
      <p className="mb-4 max-w-2xl text-[14px] text-muted">{pending === 0 ? t("nonePending") : t("pendingCount", { count: pending })}</p>
      <SeedMockCommentsButton />

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border border-rule bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={{ pathname: "/dashboard/comments", query: { status: item.key } }}
            className={`px-3 py-1.5 ${filter === item.key ? "bg-panel font-semibold text-link" : "text-text hover:bg-panel"}`}
          >
            {item.label}
            {item.key === "pending" && pending > 0 ? ` (${pending})` : ""}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="border border-rule bg-white px-5 py-8 text-[14px] text-muted">{error ? t("loadError") : t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {visible.map((comment) => (
            <article key={comment.id} className="border border-rule bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">
                    {comment.name}
                    {comment.isReply ? <span className="ms-2 bg-panel px-2 py-0.5 text-[11px] font-normal text-muted">{t("replyBadge")}</span> : null}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {formatDate(comment.createdAt, locale) || "—"}
                    {comment.parentId && namesById.has(comment.parentId) ? (
                      <>
                        {" · "}
                        <span>{t("inReplyTo", { name: namesById.get(comment.parentId)! })}</span>
                      </>
                    ) : null}
                    {comment.slug ? (
                      <>
                        {" · "}
                        <Link href={`/posts/${comment.slug}`} target="_blank" className="text-link hover:underline">
                          {comment.slug}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold ${comment.isApproved ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
                  {comment.isApproved ? t("published") : t("pending")}
                </span>
              </div>
              <p className="whitespace-pre-wrap px-5 py-4 text-[14px] leading-6 text-text">{comment.message.replace(/<[^>]*>/g, " ")}</p>
              <div className="flex flex-wrap items-center gap-4 border-t border-rule px-5 py-2.5">
                <CommentActions id={comment.id} isApproved={comment.isApproved} author={comment.name} />
                {comment.isApproved ? <CommentReply id={comment.id} /> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
