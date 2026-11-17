import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getContactMessages, type ContactMessage } from "@/lib/contact";
import { formatDate } from "@/lib/format";
import { ContactActions } from "@/components/admin/ContactActions";
import { DashboardShell } from "@/components/admin/DashboardShell";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.contacts" });
  return { title: t("title"), robots: { index: false } };
}

export default async function DashboardContactsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.contacts");
  const filter = status === "new" || status === "handled" ? status : "all";

  let messages: ContactMessage[] = [];
  let error = "";
  try {
    messages = await getContactMessages();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : t("loadError");
  }

  const unread = messages.filter((message) => !message.isHandled).length;
  const visible = messages.filter((message) => (filter === "new" ? !message.isHandled : filter === "handled" ? message.isHandled : true));
  const filters = [
    { key: "all", label: t("all") },
    { key: "new", label: t("new") },
    { key: "handled", label: t("handled") },
  ] as const;

  return (
    <DashboardShell active="contacts" title={t("title")}>
      <p className="mb-6 max-w-2xl text-[14px] text-muted">{unread === 0 ? t("noneNew") : t("newCount", { count: unread })}</p>

      {error && (
        <p role="alert" className="mb-6 border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-new">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border border-rule bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={{ pathname: "/dashboard/contacts", query: item.key === "all" ? {} : { status: item.key } }}
            className={`px-3 py-1.5 ${filter === item.key ? "bg-panel font-semibold text-link" : "text-text hover:bg-panel"}`}
          >
            {item.label}
            {item.key === "new" && unread > 0 ? ` (${unread})` : ""}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="border border-rule bg-white px-5 py-8 text-[14px] text-muted">{error ? t("loadError") : t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {visible.map((message) => (
            <article key={message.id} className="border border-rule bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">
                    {message.name} <span className="font-normal text-muted">· {message.email}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {message.subject || t("noSubject")} · {formatDate(message.createdAt, locale) || "—"}
                    {message.locale ? ` · ${message.locale.toUpperCase()}` : ""}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold ${message.isHandled ? "bg-panel text-muted" : "bg-[#e8f2fa] text-link"}`}>
                  {message.isHandled ? t("handled") : t("new")}
                </span>
              </div>
              <p className="whitespace-pre-wrap px-5 py-4 text-[14px] leading-6 text-text">{message.messageHtml.replace(/<[^>]*>/g, " ").trim() || "—"}</p>
              <div className="flex flex-wrap items-center gap-4 border-t border-rule px-5 py-2.5">
                <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "your message"}`)}`} className="text-[13px] text-link hover:underline">
                  {t("replyEmail")}
                </a>
                <ContactActions id={message.id} isHandled={message.isHandled} subject={message.subject} />
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
