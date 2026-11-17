import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSubscribers } from "@/lib/subscribers";
import { formatDate } from "@/lib/format";
import { CopySubscriberEmails } from "@/components/admin/CopySubscriberEmails";
import { DeleteSubscriberButton } from "@/components/admin/DeleteSubscriberButton";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { Panel } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.subscribers" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardSubscribersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.subscribers");

  let subscribers: Awaited<ReturnType<typeof getSubscribers>> = [];
  let error = "";
  try {
    subscribers = await getSubscribers();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  const active = subscribers.filter((row) => row.status !== "removed");
  const emails = active.map((row) => row.email).filter(Boolean);

  return (
    <DashboardShell active="subscribers" title={t("title")}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-[14px] text-muted">{t("hint", { count: active.length })}</p>
        <CopySubscriberEmails emails={emails} />
      </div>

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <Panel title={t("listTitle")}>
        {subscribers.length === 0 ? (
          <p className="text-[14px] text-muted">{error ? t("loadError") : t("empty")}</p>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-start text-[14px]">
              <thead>
                <tr className="border-b-2 border-text text-[13px] text-muted">
                  <th className="px-3 py-2.5 text-start font-semibold">{t("email")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("locale")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("source")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("subscribed")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-[#eeeeee] align-top">
                    <td className="px-3 py-3 font-medium text-text">
                      <a href={`mailto:${subscriber.email}`} className="text-link hover:underline">
                        {subscriber.email}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-muted">{subscriber.locale?.toUpperCase() || "—"}</td>
                    <td className="px-3 py-3 text-muted">{subscriber.source}</td>
                    <td className="px-3 py-3 text-muted">{formatDate(subscriber.createdAt, locale) || "—"}</td>
                    <td className="px-3 py-3">
                      <DeleteSubscriberButton id={subscriber.id} email={subscriber.email} />
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