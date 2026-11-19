"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { uploadPublicImage } from "@/lib/client-upload";
import { parseRichText, richTextToPlain } from "@/lib/richtext";

const inputClass = "w-full border border-rule bg-white px-3 py-2.5 text-[15px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

function bodyText(html: string) {
  const trimmed = html.trim();
  if (!trimmed) return "";
  return richTextToPlain(parseRichText(trimmed)) || trimmed.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type ReaderSession = { email: string; displayName: string };

export function AskQuestionForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const t = useTranslations("questions");
  const locale = useLocale();
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const [reader, setReader] = useState<ReaderSession | null>(null);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/reader/session")
      .then(async (response) => {
        const data = (await response.json()) as { session?: ReaderSession | null };
        if (response.ok && data.session) {
          setReader(data.session);
          setEmail(data.session.email);
          setName(data.session.displayName);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (notice?.kind === "success") noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [notice]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !title.trim() || !bodyText(body)) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), name: name.trim(), email: email.trim(), locale }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || t("saveError"));
      setTitle("");
      setBody("");
      setNotice({ kind: "success", text: t("saved") });
      onSubmitted?.();
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : t("saveError") });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-8">
        <button type="button" onClick={() => setOpen(true)} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
          {t("askButton")}
        </button>
      </div>
    );
  }

  return (
    <section className="mb-10 border border-rule bg-panel p-5" aria-labelledby="ask-question-heading">
      <h2 id="ask-question-heading" className="text-[17px] font-semibold text-text">
        {t("askTitle")}
      </h2>
      <p className="mt-1 text-[13px] text-muted">{t("askHint")}</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="question-title" className={labelClass}>
            {t("questionTitle")}
          </label>
          <input
            id="question-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className={inputClass}
            placeholder={t("titlePlaceholder")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="question-name" className={labelClass}>
              {t("yourName")}
            </label>
            <input id="question-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="question-email" className={labelClass}>
              {t("yourEmail")}
            </label>
            <input
              id="question-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={Boolean(reader)}
              required
              autoComplete="email"
              className={`${inputClass} ${reader ? "bg-[#f5f5f5] text-muted" : ""}`}
            />
          </div>
        </div>
        <RichTextEditor
          id="question-body"
          label={t("questionBody")}
          placeholder={t("bodyPlaceholder")}
          value={body}
          onChange={setBody}
          size="compact"
          uploadImage={uploadPublicImage}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-muted">{t("reviewed")}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setOpen(false)} className="text-[13px] text-muted hover:underline">
              {t("cancelAsk")}
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !bodyText(body)}
              className="min-h-11 bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60"
            >
              {submitting ? t("sending") : t("submit")}
            </button>
          </div>
        </div>
      </form>
      {notice ? (
        <p
          ref={noticeRef}
          role="status"
          aria-live="polite"
          className={`mt-4 border-s-4 px-4 py-3 text-[14px] ${notice.kind === "success" ? "border-edition bg-white text-text" : "border-new bg-white text-new"}`}
        >
          {notice.text}
        </p>
      ) : null}
    </section>
  );
}