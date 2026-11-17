"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";
import { IconStar } from "@/components/ui/Icons";

type Review = {
  id: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string | null;
};

type Summary = { count: number; average: number };
type ReaderSession = { email: string; displayName: string };

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-accent ${className}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <IconStar key={star} className={`size-3.5 ${star <= Math.round(value) ? "text-accent" : "text-[#d0d0d0]"}`} filled={star <= Math.round(value)} />
      ))}
    </span>
  );
}

export function BookReviews({ bookSlug, bookTitle }: { bookSlug: string; bookTitle: string }) {
  const t = useTranslations("books.reviews");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>({ count: 0, average: 0 });
  const [loading, setLoading] = useState(false);
  const [reader, setReader] = useState<ReaderSession | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === bookSlug) setOpen(true);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [bookSlug]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      fetch(`/api/book-reviews?bookSlug=${encodeURIComponent(bookSlug)}`, { signal: controller.signal })
        .then(async (response) => {
          const data = (await response.json()) as { reviews?: Review[]; summary?: Summary };
          if (response.ok) {
            setReviews(data.reviews ?? []);
            setSummary(data.summary ?? { count: 0, average: 0 });
          }
        })
        .catch(() => undefined),
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
    ]).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [open, bookSlug]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!rating || !content.trim() || busy) return;
    if (!reader && !email.trim()) {
      setStatus(t("emailRequired"));
      return;
    }
    setBusy(true);
    setStatus(t("sending"));
    try {
      const response = await fetch("/api/book-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, name: name.trim(), email: email.trim(), rating, title: title.trim(), content: content.trim() }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || t("saveError"));
      if (!reader && email.trim()) {
        const sessionResponse = await fetch("/api/reader/session");
        const sessionData = (await sessionResponse.json()) as { session?: ReaderSession | null };
        if (sessionData.session) setReader(sessionData.session);
      }
      setTitle("");
      setContent("");
      setRating(0);
      setStatus(t("saved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-rule pt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-link"
        aria-expanded={open}
        aria-controls={`reviews-${bookSlug}`}
      >
        <IconStar className="size-4 text-accent" filled={summary.count > 0} />
        {summary.count > 0 ? (
          <span>
            {summary.average.toFixed(1)} · {t("count", { count: summary.count })}
          </span>
        ) : (
          <span>{t("writeReview")}</span>
        )}
      </button>

      {open && (
        <div id={`reviews-${bookSlug}`} className="mt-4 space-y-4 border border-rule bg-panel px-4 py-4">
          <p className="text-[12px] text-muted">{t("intro", { title: bookTitle })}</p>

          {loading ? (
            <p role="status" className="text-[13px] text-muted">
              {t("loading")}
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-[13px] text-muted">{t("empty")}</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-rule pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-2">
                    <AuthorAvatar name={review.name} src={null} className="size-8" useDefault />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-text">{review.name}</p>
                        <Stars value={review.rating} />
                        {review.createdAt && (
                          <time dateTime={review.createdAt} className="text-[11px] text-muted">
                            {formatDate(review.createdAt, locale)}
                          </time>
                        )}
                      </div>
                      {review.title && <p className="mt-1 text-[13px] font-semibold text-text">{review.title}</p>}
                      <p className="mt-1 text-[14px] leading-[1.55] text-text">{review.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="space-y-3 border-t border-rule pt-4">
            <p className="text-[14px] font-semibold text-text">{t("formTitle")}</p>
            <fieldset>
              <legend className="mb-1 text-[12px] font-semibold text-text">{t("yourRating")}</legend>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`flex items-center gap-1 border px-2 py-1 text-[12px] ${rating === value ? "border-link bg-link text-white" : "border-rule bg-white text-text hover:border-link"}`}
                  >
                    <IconStar className="size-3" filled={value <= rating} />
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
            {!reader && (
              <div>
                <label htmlFor={`review-email-${bookSlug}`} className="mb-1 block text-[12px] font-semibold text-text">
                  {t("yourEmail")}
                </label>
                <input
                  id={`review-email-${bookSlug}`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full border border-rule bg-white px-3 py-2 text-[13px] outline-none focus:border-link"
                />
              </div>
            )}
            <div>
              <label htmlFor={`review-name-${bookSlug}`} className="mb-1 block text-[12px] font-semibold text-text">
                {t("yourName")}
              </label>
              <input
                id={`review-name-${bookSlug}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                className="w-full border border-rule bg-white px-3 py-2 text-[13px] outline-none focus:border-link"
              />
            </div>
            <div>
              <label htmlFor={`review-title-${bookSlug}`} className="mb-1 block text-[12px] font-semibold text-text">
                {t("headline")}
              </label>
              <input
                id={`review-title-${bookSlug}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder={t("headlinePlaceholder")}
                className="w-full border border-rule bg-white px-3 py-2 text-[13px] outline-none focus:border-link"
              />
            </div>
            <div>
              <label htmlFor={`review-body-${bookSlug}`} className="mb-1 block text-[12px] font-semibold text-text">
                {t("body")}
              </label>
              <textarea
                id={`review-body-${bookSlug}`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={4}
                maxLength={2000}
                required
                className="w-full border border-rule bg-white px-3 py-2 text-[13px] outline-none focus:border-link"
              />
            </div>
            <p className="text-[11px] text-muted">{t("reviewed")}</p>
            <button type="submit" disabled={busy} className="bg-link px-4 py-2 text-[13px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
              {busy ? t("sending") : t("submit")}
            </button>
            {status && (
              <p role="status" className="text-[12px] text-muted">
                {status}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}