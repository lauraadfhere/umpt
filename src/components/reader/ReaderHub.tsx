"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { parseRichText, richTextToPlain } from "@/lib/richtext";
import type { ReaderActivityStats, ReaderComment } from "@/lib/comments";
import type { ReaderSession } from "@/lib/reader-auth";

type TabKey = "overview" | "comments" | "posts" | "analytics" | "account";

type HubPayload = {
  session: ReaderSession;
  comments: ReaderComment[];
  stats: ReaderActivityStats;
};

function plainMessage(html: string) {
  return richTextToPlain(parseRichText(html)) || html.replace(/<[^>]*>/g, " ").trim();
}

function Icon({ name, active }: { name: TabKey; active: boolean }) {
  const stroke = active ? "stroke-white" : "stroke-white/75";
  const icons: Record<TabKey, ReactNode> = {
    overview: (
      <svg viewBox="0 0 24 24" className={`size-5 fill-none ${stroke}`} strokeWidth="1.75">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
      </svg>
    ),
    comments: (
      <svg viewBox="0 0 24 24" className={`size-5 fill-none ${stroke}`} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 9h10M7 13h6M6 4h12a2 2 0 0 1 2 2v9l-3 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    ),
    posts: (
      <svg viewBox="0 0 24 24" className={`size-5 fill-none ${stroke}`} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 24 24" className={`size-5 fill-none ${stroke}`} strokeWidth="1.75" strokeLinecap="round">
        <path d="M5 19V9M10 19V5M15 19v-7M20 19V11" />
      </svg>
    ),
    account: (
      <svg viewBox="0 0 24 24" className={`size-5 fill-none ${stroke}`} strokeWidth="1.75" strokeLinecap="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 20.5c.6-3.6 3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      </svg>
    ),
  };
  return icons[name];
}

function MiniChart({ data }: { data: ReaderActivityStats["monthly"] }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  return (
    <div className="flex h-32 items-end justify-between gap-2" role="img" aria-hidden>
      {data.map((item) => {
        const heightPx = Math.round((item.count / max) * 72);
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-text tabular-nums">{item.count > 0 ? item.count : ""}</span>
            <div
              className="w-full max-w-[2.25rem] rounded-t bg-link/90"
              style={{ height: `${Math.max(item.count > 0 ? 6 : 2, heightPx)}px` }}
            />
            <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CommentRow({
  comment,
  locale,
  onRefresh,
  t,
}: {
  comment: ReaderComment;
  locale: string;
  onRefresh: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.message);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/reader/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || t("saveError"));
      setEditing(false);
      onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(t("deleteConfirm"))) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/reader/comments/${comment.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || t("deleteError"));
      }
      onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("deleteError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="border border-rule bg-white px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/posts/${comment.slug}`} className="text-[14px] font-semibold text-link hover:underline">
            {comment.slug}
          </Link>
          <p className="mt-0.5 text-[12px] text-muted">{formatDate(comment.createdAt, locale) || "—"}</p>
        </div>
        <span className={`px-2 py-0.5 text-[11px] font-semibold ${comment.isApproved ? "bg-panel text-edition" : "bg-[#fdf2f2] text-new"}`}>
          {comment.isApproved ? t("statusPublished") : t("statusPending")}
        </span>
      </div>
      {editing ? (
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} className="mt-3 w-full border border-rule px-3 py-2 text-[14px] outline-none focus:border-link" />
      ) : (
        <p className="mt-3 text-[14px] leading-relaxed text-text">{plainMessage(comment.message)}</p>
      )}
      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-new">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-[13px]">
        <span className="text-muted">
          ▲ {comment.likes} · ▼ {comment.dislikes}
        </span>
        {!comment.isApproved ? (
          <>
            <button type="button" disabled={busy} onClick={() => (editing ? void save() : setEditing(true))} className="text-link hover:underline disabled:opacity-60">
              {editing ? (busy ? t("saving") : t("saveEdit")) : t("edit")}
            </button>
            {editing ? (
              <button type="button" onClick={() => setEditing(false)} className="text-muted hover:underline">
                {t("cancel")}
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={() => void remove()} className="text-new hover:underline disabled:opacity-60">
                {t("withdraw")}
              </button>
            )}
          </>
        ) : (
          <Link href={`/posts/${comment.slug}#comments`} className="text-link hover:underline">
            {t("viewThread")}
          </Link>
        )}
      </div>
    </article>
  );
}

export function ReaderHub({ locale, initialTab = "overview" }: { locale: string; initialTab?: TabKey }) {
  const t = useTranslations("reader.hub");
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [data, setData] = useState<HubPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInBusy, setSignInBusy] = useState(false);
  const [signInError, setSignInError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/reader/hub")
      .then(async (response) => {
        const payload = (await response.json()) as HubPayload & { error?: string };
        if (response.status === 401) {
          setData(null);
          return;
        }
        if (!response.ok) throw new Error(payload.error || t("loadError"));
        setData(payload);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const discussions = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { slug: string; count: number; approved: number; latest: string | null }>();
    for (const comment of data.comments) {
      if (!comment.slug) continue;
      const entry = map.get(comment.slug) ?? { slug: comment.slug, count: 0, approved: 0, latest: comment.createdAt };
      entry.count += 1;
      if (comment.isApproved) entry.approved += 1;
      if ((comment.createdAt ?? "") > (entry.latest ?? "")) entry.latest = comment.createdAt;
      map.set(comment.slug, entry);
    }
    return [...map.values()].sort((a, b) => (b.latest ?? "").localeCompare(a.latest ?? ""));
  }, [data]);

  const tabs: TabKey[] = ["overview", "comments", "posts", "analytics", "account"];

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setSignInBusy(true);
    setSignInError("");
    try {
      const response = await fetch("/api/reader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signInEmail.trim() }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || t("signInError"));
      load();
    } catch (caught) {
      setSignInError(caught instanceof Error ? caught.message : t("signInError"));
    } finally {
      setSignInBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/reader/session", { method: "DELETE" });
    setData(null);
    router.refresh();
  }

  if (loading && !data) {
    return <p className="px-6 py-12 text-center text-[15px] text-muted">{t("loading")}</p>;
  }

  if (!data) {
    return (
      <SignInForm
        email={signInEmail}
        onEmail={setSignInEmail}
        onSubmit={signIn}
        busy={signInBusy}
        error={signInError}
        t={t}
      />
    );
  }

  const { session, stats, comments } = data;
  const insight =
    stats.pending > 0 ?
      t("insightPending", { count: stats.pending })
    : stats.engagementScore > 5 ?
      t("insightEngaged")
    : t("insightWelcome");

  return (
    <div className="pb-16">
      <header className="sticky top-0 z-[58] border-b border-white/10 bg-black text-white shadow-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-3 py-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">{t("eyebrow")}</p>
            <p className="text-[13px] font-semibold">{session.displayName}</p>
          </div>
          <p className="hidden text-[12px] text-white/80 sm:block">{session.email}</p>
        </div>
        <nav aria-label={t("navLabel")} className="border-t border-white/10">
          <ul className="mx-auto grid max-w-[1200px] grid-cols-5">
            {tabs.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={tab === key ? "page" : undefined}
                  className={`flex w-full touch-manipulation flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold tracking-wide uppercase transition ${tab === key ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5"}`}
                >
                  <Icon name={key} active={tab === key} />
                  <span>{t(`tabs.${key}`)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        {tab === "overview" && (
          <section className="space-y-6">
            <p className="border-s-4 border-link bg-panel px-4 py-3 text-[14px] text-text">{insight}</p>
            <StatGrid stats={stats} t={t} />
            <div className="border border-rule bg-white p-4">
              <h2 className="text-[15px] font-semibold text-text">{t("activityChart")}</h2>
              <p className="mt-1 text-[13px] text-muted">{t("activityHint")}</p>
              <div className="mt-4">
                <MiniChart data={stats.monthly} />
              </div>
            </div>
          </section>
        )}

        {tab === "comments" && (
          <section className="space-y-4">
            <h2 className="text-[17px] font-semibold text-text">{t("yourAnswers")}</h2>
            {comments.length === 0 ? (
              <p className="text-[14px] text-muted">{t("noComments")}</p>
            ) : (
              comments.map((comment) => <CommentRow key={comment.id} comment={comment} locale={locale} onRefresh={load} t={t} />)
            )}
          </section>
        )}

        {tab === "posts" && (
          <section className="space-y-4">
            <h2 className="text-[17px] font-semibold text-text">{t("yourDiscussions")}</h2>
            {discussions.length === 0 ? (
              <p className="text-[14px] text-muted">{t("noDiscussions")}</p>
            ) : (
              <ul className="divide-y divide-rule border border-rule bg-white">
                {discussions.map((item) => (
                  <li key={item.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <Link href={`/posts/${item.slug}`} className="text-[15px] font-semibold text-link hover:underline">
                        {item.slug}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {t("discussionMeta", { total: item.count, published: item.approved })}
                      </p>
                    </div>
                    <Link href={`/posts/${item.slug}#comments`} className="text-[13px] font-semibold text-link hover:underline">
                      {t("openPost")}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "analytics" && (
          <section className="space-y-6">
            <h2 className="text-[17px] font-semibold text-text">{t("analyticsTitle")}</h2>
            <StatGrid stats={stats} t={t} />
            <div className="border border-rule bg-white p-4">
              <MiniChart data={stats.monthly} />
            </div>
            <p className="text-[13px] text-muted">{t("analyticsFootnote")}</p>
          </section>
        )}

        {tab === "account" && (
          <section className="max-w-lg space-y-4 border border-rule bg-white p-5">
            <h2 className="text-[17px] font-semibold text-text">{t("accountTitle")}</h2>
            <p className="text-[14px] text-text">
              <span className="font-semibold">{t("displayName")}:</span> {session.displayName}
            </p>
            <p className="text-[14px] text-text">
              <span className="font-semibold">{t("email")}:</span> {session.email}
            </p>
            <p className="text-[13px] leading-relaxed text-muted">{t("accountHint")}</p>
            <button type="button" onClick={() => void signOut()} className="bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#222]">
              {t("signOut")}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

function StatGrid({ stats, t }: { stats: ReaderActivityStats; t: ReturnType<typeof useTranslations> }) {
  const items = [
    { label: t("statTotal"), value: stats.total },
    { label: t("statPublished"), value: stats.approved },
    { label: t("statPending"), value: stats.pending },
    { label: t("statLikes"), value: stats.likes },
    { label: t("statDiscussions"), value: stats.discussions },
    { label: t("statScore"), value: stats.engagementScore },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="border border-rule bg-white px-3 py-3">
          <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">{item.label}</dt>
          <dd className="mt-1 text-[22px] font-semibold text-text tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SignInForm({
  email,
  onEmail,
  onSubmit,
  busy,
  error,
  t,
}: {
  email: string;
  onEmail: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  busy: boolean;
  error: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-[22px] font-semibold text-text">{t("title")}</h1>
      <p className="mt-2 text-[14px] text-muted">{t("signInIntro")}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 border border-rule bg-panel p-5">
        <label htmlFor="reader-hub-email" className="block text-[13px] font-semibold text-text">
          {t("email")}
        </label>
        <input
          id="reader-hub-email"
          type="email"
          value={email}
          onChange={(event) => onEmail(event.target.value)}
          className="w-full border border-rule bg-white px-3 py-2.5 text-[15px] outline-none focus:border-link"
          required
        />
        {error ? (
          <p role="alert" className="text-[13px] text-new">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="w-full bg-link py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
          {busy ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
}