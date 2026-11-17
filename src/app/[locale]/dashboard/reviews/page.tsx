import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getBookReviewsForModeration } from "@/lib/book-reviews";
import { formatDate } from "@/lib/format";
import { BookReviewActions } from "@/components/admin/BookReviewActions";
import { DashboardShell } from "@/components/admin/DashboardShell";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.reviews" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardBookReviewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.reviews");
  const filter = status === "approved" || status === "all" ? status : "pending";

  let reviews: Awaited<ReturnType<typeof getBookReviewsForModeration>> = [];
  let error = "";
  try {
    reviews = await getBookReviewsForModeration();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  const pending = reviews.filter((review) => !review.isApproved).length;
  const visible = reviews.filter((review) => (filter === "pending" ? !review.isApproved : filter === "approved" ? review.isApproved : true));
  const filters = [
    { key: "pending", label: t("pending") },
    { key: "approved", label: t("approved") },
    { key: "all", label: t("all") },
  ] as const;

  return (
    <DashboardShell active="reviews" title={t("title")}>
      <p className="mb-6 max-w-2xl text-[14px] text-muted">{pending === 0 ? t("nonePending") : t("pendingCount", { count: pending })}</p>

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border border-rule bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={{ pathname: "/dashboard/reviews", query: { status: item.key } }}
            className={`px-3 py-1.5 ${filter === item.key ? "bg-panel font-semibold text-link" : "text-text hover:bg-panel"}`}
          >
            {item.label}
            {item.key === "pending" && pending > 0 ? ` (${pending})` : ""}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="border border-rule bg-white px-5 py-8 text-[14px] text-muted">{t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {visible.map((review) => (
            <article key={review.id} className="border border-rule bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">
                    {review.name} · {"★".repeat(review.rating)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {formatDate(review.createdAt, locale) || "—"}
                    {review.bookSlug ? (
                      <>
                        {" · "}
                        <Link href={`/books#${review.bookSlug}`} target="_blank" className="text-link hover:underline">
                          {review.bookSlug}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  {review.title && <p className="mt-2 text-[13px] font-semibold text-text">{review.title}</p>}
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold ${review.isApproved ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
                  {review.isApproved ? t("published") : t("pending")}
                </span>
              </div>
              <p className="whitespace-pre-wrap px-5 py-4 text-[14px] leading-6 text-text">{review.content}</p>
              <div className="border-t border-rule px-5 py-2.5">
                <BookReviewActions id={review.id} isApproved={review.isApproved} name={review.name} />
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}