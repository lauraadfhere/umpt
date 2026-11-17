import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminBooks } from "@/lib/admin-books";
import { getAdminProjects } from "@/lib/admin-projects";
import { getAdminPostRows } from "@/lib/admin-posts";
import { getCommentsForModeration } from "@/lib/comments";
import { getContactMessages } from "@/lib/contact";
import { getSubscribers } from "@/lib/subscribers";
import { formatDate } from "@/lib/format";
import { getBackendStatus } from "@/lib/parse";
import { getManagedPages } from "@/lib/site-pages";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { IconArrowRight, IconBrand, IconMail, IconMessage, IconPages, IconPosts, IconRss, IconUpload, IconUser } from "@/components/ui/Icons";

function IconFavicon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <path d="M8 15h8" strokeLinecap="round" />
    </svg>
  );
}

function IconHomeLayout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function IconBooks({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("cmsTitle"), robots: { index: false } };
}

type ModuleCard = {
  key: string;
  href: string;
  actionHref: string;
  actionKey: string;
  count: string;
  note: string;
  tone?: "default" | "alert" | "ok";
  icon: React.ReactNode;
};

function Module({ card, title, body, openLabel, actionLabel }: { card: ModuleCard; title: string; body: string; openLabel: string; actionLabel: string }) {
  const ring = card.tone === "alert" ? "border-new" : card.tone === "ok" ? "border-edition" : "border-rule";
  return (
    <article className={`flex h-full flex-col border bg-white ${ring}`}>
      <div className="flex items-start gap-3 border-b border-rule px-4 py-4">
        <span className="grid size-10 shrink-0 place-items-center bg-panel text-text" aria-hidden>
          {card.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[16px] font-semibold text-text">{title}</h2>
            <p className="text-[28px] leading-none font-semibold text-text">{card.count}</p>
          </div>
          <p className="mt-1 text-[13px] text-muted">{card.note}</p>
        </div>
      </div>
      <p className="flex-1 px-4 py-3 text-[13px] leading-[1.55] text-text">{body}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-rule px-4 py-3">
        <Link href={card.href} className="inline-flex items-center gap-2 text-[13px] font-semibold text-link hover:underline">
          {openLabel}
          <IconArrowRight className="h-2.5 w-5 rtl:rotate-180" />
        </Link>
        <Link href={card.actionHref} className="text-[13px] text-muted hover:text-link hover:underline">
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations("dashboard");
  const [backend, posts, books, projects, comments, contacts, subscribers, pages] = await Promise.all([
    getBackendStatus(),
    getAdminPostRows().catch(() => []),
    getAdminBooks().catch(() => []),
    getAdminProjects().catch(() => []),
    getCommentsForModeration().catch(() => []),
    getContactMessages().catch(() => []),
    getSubscribers().catch(() => []),
    getManagedPages().catch(() => []),
  ]);

  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.length - published;
  const pendingComments = comments.filter((comment) => !comment.isApproved).length;
  const newContacts = contacts.filter((message) => !message.isHandled).length;
  const publishedPages = pages.filter((page) => page.id && page.status === "published").length;
  const recentPosts = posts.slice(0, 6);
  const recentContacts = contacts.slice(0, 5);
  const attention = pendingComments + newContacts;

  const modules: ModuleCard[] = [
    {
      key: "posts",
      href: "/dashboard/posts",
      actionHref: "/dashboard/posts/new",
      actionKey: "newPost",
      count: String(posts.length),
      note: t("modules.postsNote", { published, drafts }),
      icon: <IconPosts className="size-5" />,
    },
    {
      key: "books",
      href: "/dashboard/books",
      actionHref: "/dashboard/books/new",
      actionKey: "newBook",
      count: String(books.length),
      note: t("modules.booksNote", { count: books.length }),
      icon: <IconBooks className="size-5" />,
    },
    {
      key: "projects",
      href: "/dashboard/projects",
      actionHref: "/dashboard/projects/new",
      actionKey: "newProject",
      count: String(projects.length),
      note: t("modules.projectsNote", { count: projects.length }),
      icon: <IconBooks className="size-5" />,
    },
    {
      key: "pages",
      href: "/dashboard/pages",
      actionHref: "/dashboard/pages",
      actionKey: "editPages",
      count: String(pages.length),
      note: t("modules.pagesNote", { published: publishedPages }),
      icon: <IconPages className="size-5" />,
    },
    {
      key: "comments",
      href: "/dashboard/comments",
      actionHref: "/dashboard/comments?status=pending",
      actionKey: "reviewComments",
      count: String(pendingComments),
      note: t("modules.commentsNote"),
      tone: pendingComments ? "alert" : "ok",
      icon: <IconMessage className="size-5" />,
    },
    {
      key: "contacts",
      href: "/dashboard/contacts",
      actionHref: "/dashboard/contacts?status=new",
      actionKey: "openInbox",
      count: String(newContacts),
      note: t("modules.contactsNote", { total: contacts.length }),
      tone: newContacts ? "alert" : "ok",
      icon: <IconMail className="size-5" />,
    },
    {
      key: "subscribers",
      href: "/dashboard/subscribers",
      actionHref: "/dashboard/subscribers",
      actionKey: "openSubscribers",
      count: String(subscribers.length),
      note: t("modules.subscribersNote", { count: subscribers.length }),
      icon: <IconRss className="size-5" />,
    },
    {
      key: "profile",
      href: "/dashboard/profile",
      actionHref: "/dashboard/profile",
      actionKey: "editProfile",
      count: "—",
      note: t("modules.profileNote"),
      icon: <IconUser className="size-5" />,
    },
    {
      key: "logo",
      href: "/dashboard/logo",
      actionHref: "/dashboard/logo",
      actionKey: "editLogo",
      count: "—",
      note: t("modules.logoNote"),
      icon: <IconBrand className="size-5" />,
    },
    {
      key: "favicon",
      href: "/dashboard/favicon",
      actionHref: "/dashboard/favicon",
      actionKey: "editFavicon",
      count: "—",
      note: t("modules.faviconNote"),
      icon: <IconFavicon className="size-5" />,
    },
    {
      key: "home",
      href: "/dashboard/home",
      actionHref: "/dashboard/home",
      actionKey: "editHome",
      count: "—",
      note: t("modules.homeNote"),
      icon: <IconHomeLayout className="size-5" />,
    },
    {
      key: "uploads",
      href: "/dashboard/uploads",
      actionHref: "/dashboard/uploads",
      actionKey: "uploadImages",
      count: "—",
      note: t("modules.uploadsNote"),
      icon: <IconUpload className="size-5" />,
    },
  ];

  return (
    <DashboardShell active="overview" title={t("cmsTitle")}>
      <div className="space-y-8">
        <section className="relative overflow-hidden border border-rule bg-panel">
          <svg className="pointer-events-none absolute end-0 top-0 h-full w-[280px] text-[#e6e6e6] rtl:-scale-x-100" viewBox="0 0 280 180" aria-hidden>
            <path d="M280 0 L280 180 L120 0 Z" fill="currentColor" />
          </svg>
          <div className="relative grid gap-6 px-5 py-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[12px] font-semibold tracking-wide text-accent uppercase">{t("cmsEyebrow")}</p>
              <h1 className="mt-1 text-[28px] leading-tight font-semibold text-text">{t("cmsHeading")}</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-[1.55] text-muted">{t("cmsIntro")}</p>
              <p className="mt-3 text-[13px]">
                <span className={`inline-flex items-center gap-2 font-semibold ${backend.ok ? "text-edition" : "text-new"}`}>
                  <span className={`size-2 rounded-full ${backend.ok ? "bg-edition" : "bg-new"}`} aria-hidden />
                  {backend.ok ? t("online") : t("offline")}
                </span>
                <span className="ms-2 text-muted">{backend.message}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/posts/new" className="bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
                {t("shortcuts.newPost")}
              </Link>
              <Link href="/dashboard/pages" className="border border-text px-4 py-2.5 text-[14px] font-semibold text-text hover:bg-white">
                {t("shortcuts.editPages")}
              </Link>
            </div>
          </div>
        </section>

        {attention > 0 && (
          <section className="border-s-4 border-new bg-white px-4 py-3" aria-live="polite">
            <p className="text-[14px] font-semibold text-text">{t("attentionTitle")}</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
              {pendingComments > 0 && (
                <li>
                  <Link href="/dashboard/comments?status=pending" className="text-link hover:underline">
                    {t("attentionComments", { count: pendingComments })}
                  </Link>
                </li>
              )}
              {newContacts > 0 && (
                <li>
                  <Link href="/dashboard/contacts?status=new" className="text-link hover:underline">
                    {t("attentionContacts", { count: newContacts })}
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[21px] font-medium italic text-text">{t("modulesTitle")}</h2>
              <p className="mt-1 text-[13px] text-muted">{t("modulesHint")}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((card) => (
              <Module
                key={card.key}
                card={card}
                title={t(`modules.${card.key}`)}
                body={t(`modules.${card.key}Body`)}
                openLabel={t("open")}
                actionLabel={t(`shortcuts.${card.actionKey}`)}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="border border-rule bg-white">
            <div className="flex items-center justify-between border-b border-rule bg-panel-head px-4 py-3">
              <h2 className="text-[16px] font-semibold text-text">{t("recentPosts")}</h2>
              <Link href="/dashboard/posts" className="text-[13px] text-link hover:underline">
                {t("viewAll")}
              </Link>
            </div>
            {recentPosts.length === 0 ? (
              <p className="px-4 py-8 text-[13px] text-muted">{t("noPosts")}</p>
            ) : (
              <ul>
                {recentPosts.map((post) => (
                  <li key={post.id} className="flex items-start justify-between gap-4 border-b border-rule px-4 py-3 last:border-b-0">
                    <div className="min-w-0">
                      <Link href={`/dashboard/posts/${post.id}`} className="text-[14px] font-semibold text-text hover:text-link">
                        {post.title}
                      </Link>
                      <p className="mt-1 text-[12px] text-muted">
                        /{post.slug} · {formatDate(post.updatedAt ?? post.publishedAt, locale) || "—"}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold ${post.status === "published" ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
                      {post.status === "published" ? t("posts.published") : t("posts.draft")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-rule bg-white">
            <div className="flex items-center justify-between border-b border-rule bg-panel-head px-4 py-3">
              <h2 className="text-[16px] font-semibold text-text">{t("recentContacts")}</h2>
              <Link href="/dashboard/contacts" className="text-[13px] text-link hover:underline">
                {t("viewAll")}
              </Link>
            </div>
            {recentContacts.length === 0 ? (
              <p className="px-4 py-8 text-[13px] text-muted">{t("noContacts")}</p>
            ) : (
              <ul>
                {recentContacts.map((message) => (
                  <li key={message.id} className="border-b border-rule px-4 py-3 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-text">{message.name}</p>
                        <p className="mt-0.5 truncate text-[12px] text-muted">
                          {message.subject || t("contacts.noSubject")} · {message.email}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold ${message.isHandled ? "bg-panel text-muted" : "bg-[#e8f2fa] text-link"}`}>
                        {message.isHandled ? t("contacts.handled") : t("contacts.new")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
