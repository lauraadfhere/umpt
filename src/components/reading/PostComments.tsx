"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { namesMatch } from "@/lib/profile-config";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Comment = {
  id: string;
  name: string;
  message: string;
  createdAt: string | null;
  parentId: string | null;
  isReply: boolean;
  likes: number;
  dislikes: number;
};

type ReaderSession = { email: string; displayName: string };

function plainMessage(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function voteKey(id: string) {
  return `umpt-voted-${id}`;
}

export function PostComments({
  slug,
  postId,
  editorial,
}: {
  slug: string;
  postId: string;
  editorial?: { name: string; avatarUrl?: string };
}) {
  const t = useTranslations("reading.comments");
  const locale = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reader, setReader] = useState<ReaderSession | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const loadComments = useCallback(() => {
    return fetch(`/api/comments?slug=${encodeURIComponent(slug)}&postId=${encodeURIComponent(postId)}`)
      .then(async (response) => {
        const data = (await response.json()) as { comments?: Comment[]; error?: string };
        if (response.ok) setComments(data.comments ?? []);
        else setStatus(data.error || t("unavailable"));
      })
      .catch(() => setStatus(t("unavailable")));
  }, [slug, postId, t]);

  useEffect(() => {
    const voted = new Set<string>();
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("umpt-voted-")) voted.add(key.replace("umpt-voted-", ""));
    }
    setVotedIds(voted);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/reader/session", { signal: controller.signal })
        .then(async (response) => {
          const data = (await response.json()) as { session?: ReaderSession | null };
          if (response.ok && data.session) {
            setReader(data.session);
            setEmail(data.session.email);
            setName(data.session.displayName);
          }
        })
        .catch(() => undefined),
      loadComments(),
    ]).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [loadComments]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || signingIn) return;
    setSigningIn(true);
    setStatus("");
    try {
      const response = await fetch("/api/reader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await response.json()) as { session?: ReaderSession; error?: string };
      if (!response.ok) throw new Error(data.error || t("signInError"));
      if (data.session) {
        setReader(data.session);
        setName(data.session.displayName);
        setEmail(data.session.email);
        setStatus(t("signedIn"));
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("signInError"));
    } finally {
      setSigningIn(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || submitting) return;
    if (!reader && !email.trim()) {
      setStatus(t("emailRequired"));
      return;
    }
    setSubmitting(true);
    setStatus(t("sending"));
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          postId,
          email: email.trim(),
          name: name.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = (await response.json()) as { error?: string; session?: ReaderSession };
      if (!response.ok) throw new Error(data.error || t("saveError"));
      if (!reader && email.trim()) {
        const sessionResponse = await fetch("/api/reader/session");
        const sessionData = (await sessionResponse.json()) as { session?: ReaderSession | null };
        if (sessionData.session) setReader(sessionData.session);
      }
      setMessage("");
      setStatus(t("saved"));
      await loadComments();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function vote(id: string, direction: "like" | "dislike") {
    if (typeof window !== "undefined" && localStorage.getItem(voteKey(id))) return;
    try {
      const response = await fetch(`/api/comments/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = (await response.json()) as { likes?: number; dislikes?: number; error?: string };
      if (!response.ok) throw new Error(data.error || t("voteError"));
      setComments((current) =>
        current.map((comment) =>
          comment.id === id ? { ...comment, likes: data.likes ?? comment.likes, dislikes: data.dislikes ?? comment.dislikes } : comment,
        ),
      );
      localStorage.setItem(voteKey(id), direction);
      setVotedIds((current) => new Set(current).add(id));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("voteError"));
    }
  }

  const avatarFor = (comment: Comment) => {
    if (editorial && namesMatch(comment.name, editorial.name) && editorial.avatarUrl) {
      return editorial.avatarUrl;
    }
    return null;
  };

  const roots = comments.filter((comment) => !comment.parentId);
  const repliesFor = (id: string) => comments.filter((comment) => comment.parentId === id);

  return (
    <section id="comments" aria-labelledby="comments-heading" className="mt-12 scroll-mt-6 border-t border-rule pt-9 max-w-full">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle size="md" tone="accent">
          <span id="comments-heading">{t("heading")}</span>
        </SectionTitle>
        {!loading && <span className="bg-panel px-2.5 py-1 text-[12px] font-semibold text-muted">{comments.length}</span>}
      </div>

      {!reader ? (
        <form onSubmit={signIn} className="mt-6 border border-rule bg-white px-5 py-5">
          <p className="text-[15px] font-semibold text-text">{t("join")}</p>
          <p className="mt-1 text-[13px] text-muted">{t("joinHint")}</p>
          <label htmlFor="reader-email" className="mt-4 mb-1 block text-[13px] font-semibold text-text">
            {t("yourEmail")}
          </label>
          <input
            id="reader-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="w-full border border-rule bg-white px-3 py-2.5 text-base outline-none focus:border-link sm:text-[14px]"
            required
          />
          <button type="submit" disabled={signingIn} className="mt-4 min-h-11 touch-manipulation bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
            {signingIn ? t("signingIn") : t("signIn")}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-[13px] text-muted">
          {t("signedInAs", { email: reader.email })}
        </p>
      )}

      <form onSubmit={submitComment} className="mt-6 border border-rule bg-panel px-5 py-5">
        <p className="text-[15px] font-semibold text-text">{t("leave")}</p>
        {reader ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="comment-name" className="mb-1 block text-[13px] font-semibold text-text">
                {t("yourName")}
              </label>
              <input
                id="comment-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                autoComplete="name"
                className="w-full border border-rule bg-white px-3 py-2.5 text-base outline-none focus:border-link sm:text-[14px]"
              />
            </div>
            <div>
              <label htmlFor="comment-email-ro" className="mb-1 block text-[13px] font-semibold text-text">
                {t("yourEmail")}
              </label>
              <input id="comment-email-ro" value={reader.email} readOnly className="w-full border border-rule bg-[#f5f5f5] px-3 py-2.5 text-base text-muted sm:text-[14px]" />
            </div>
          </div>
        ) : (
          <>
            <label htmlFor="comment-email-inline" className="mt-4 mb-1 block text-[13px] font-semibold text-text">
              {t("yourEmail")}
            </label>
            <input
              id="comment-email-inline"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full border border-rule bg-white px-3 py-2.5 text-base outline-none focus:border-link sm:text-[14px]"
              required
            />
          </>
        )}
        <label htmlFor="comment-message" className="mt-4 mb-1 block text-[13px] font-semibold text-text">
          {t("yourComment")}
        </label>
        <textarea
          id="comment-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={2000}
          placeholder={t("commentPlaceholder")}
          className="w-full border border-rule bg-white px-3 py-2.5 text-base outline-none focus:border-link sm:text-[14px]"
          required
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-muted">{t("reviewed")}</p>
          <button type="submit" disabled={submitting} className="min-h-11 touch-manipulation bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
            {submitting ? t("sending") : t("submit")}
          </button>
        </div>
      </form>

      {status && (
        <p role="status" className="mt-4 text-[14px] text-muted">
          {status}
        </p>
      )}
      {loading && (
        <p role="status" className="mt-6 text-[14px] text-muted">
          {t("loading")}
        </p>
      )}
      {!loading && roots.length === 0 && (
        <p className="mt-6 text-[14px] text-muted">{t("empty")}</p>
      )}

      {roots.length > 0 && (
        <ul className="mt-8 space-y-4">
          {roots.map((comment) => {
            const voted = hydrated && votedIds.has(comment.id);
            return (
              <li key={comment.id} className="border border-rule bg-white px-3 py-4 sm:px-4">
                <div className="flex gap-3">
                  <AuthorAvatar name={comment.name} src={avatarFor(comment)} className="size-10" useDefault />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-[14px] font-semibold text-text">{comment.name}</p>
                      {comment.createdAt && <time dateTime={comment.createdAt} className="text-[12px] text-muted">{formatDate(comment.createdAt, locale)}</time>}
                    </div>
                    <p className="mt-2 break-words text-[15px] leading-[1.55] text-text">{plainMessage(comment.message)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] sm:gap-3">
                      <button
                        type="button"
                        disabled={voted}
                        onClick={() => void vote(comment.id, "like")}
                        className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-1.5 rounded-sm px-2 text-muted hover:text-link disabled:opacity-50"
                        aria-label={t("like")}
                      >
                        <span aria-hidden>▲</span>
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        type="button"
                        disabled={voted}
                        onClick={() => void vote(comment.id, "dislike")}
                        className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-1.5 rounded-sm px-2 text-muted hover:text-new disabled:opacity-50"
                        aria-label={t("dislike")}
                      >
                        <span aria-hidden>▼</span>
                        <span>{comment.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
                {repliesFor(comment.id).map((reply) => (
                  <div key={reply.id} className="mt-4 ms-6 border-s-4 border-accent bg-panel px-4 py-3">
                    <div className="flex gap-3">
                      <AuthorAvatar name={reply.name} src={avatarFor(reply)} className="size-8" useDefault />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <p className="text-[14px] font-semibold text-text">{reply.name}</p>
                          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">{t("replyBadge")}</span>
                          {reply.createdAt && <time dateTime={reply.createdAt} className="text-[12px] text-muted">{formatDate(reply.createdAt, locale)}</time>}
                        </div>
                        <p className="mt-2 text-[15px] leading-[1.55] text-text">{plainMessage(reply.message)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}