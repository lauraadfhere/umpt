import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { getQuestionsForModeration, type ModeratedQuestion } from "@/lib/questions";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { QuestionActions } from "@/components/admin/QuestionActions";
import { SiteRichContent } from "@/components/site/SiteRichContent";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.questions" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardQuestionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.questions");
  const filter = status === "approved" || status === "all" ? status : "pending";

  let questions: ModeratedQuestion[] = [];
  let error = "";
  try {
    questions = await getQuestionsForModeration();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  const pending = questions.filter((item) => !item.isApproved).length;
  const visible = questions.filter((item) => (filter === "pending" ? !item.isApproved : filter === "approved" ? item.isApproved : true));
  const filters = [
    { key: "pending", label: t("pending") },
    { key: "approved", label: t("approved") },
    { key: "all", label: t("all") },
  ] as const;

  return (
    <DashboardShell active="questions" title={t("title")}>
      <p className="mb-4 max-w-2xl text-[14px] text-muted">{pending === 0 ? t("nonePending") : t("pendingCount", { count: pending })}</p>

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border border-rule bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={{ pathname: "/dashboard/questions", query: { status: item.key } }}
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
          {visible.map((question) => (
            <article key={question.id} className="border border-rule bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-text">{question.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {question.askerName}
                    {question.askerEmail ? ` · ${question.askerEmail}` : ""}
                    {" · "}
                    {formatDate(question.createdAt, locale) || "—"}
                    {question.locale ? ` · ${question.locale.toUpperCase()}` : ""}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold ${question.isApproved ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
                  {question.isApproved ? t("published") : t("pending")}
                </span>
              </div>
              <h3 className="sr-only">{t("bodyLabel")}</h3>
              <div className="px-5 py-4">
                <SiteRichContent html={question.bodyHtml} />
              </div>
              <NeedsDetailLink id={question.id} isApproved={question.isApproved} label={t("openPublic")} />
              <div className="flex flex-wrap items-center gap-4 border-t border-rule px-5 py-2.5">
                <QuestionActions id={question.id} isApproved={question.isApproved} title={question.title} />
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function NeedsDetailLink({ id, isApproved, label }: { id: string; isApproved: boolean; label: string }) {
  if (!isApproved) return null;
  return (
    <div className="border-t border-rule px-5 py-2">
      <Link href={`/questions/${id}`} target="_blank" className="text-[13px] text-link hover:underline">
        {label}
      </Link>
    </div>
  );
}