"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { uploadPublicImage } from "@/lib/client-upload";
import { parseRichText, richTextToPlain } from "@/lib/richtext";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

function messageText(html: string) {
  const trimmed = html.trim();
  if (!trimmed) return "";
  return richTextToPlain(parseRichText(trimmed)) || trimmed.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function ContactForm() {
  const t = useTranslations("pages.contact");
  const locale = useLocale();
  const successRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (submitted) successRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [submitted]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !messageText(message)) return;
    setSubmitting(true);
    setError("");
    setSubmitted(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message: message.trim(), locale }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || t("saveError"));
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        ref={successRef}
        role="status"
        aria-live="polite"
        className="mt-8 max-w-[620px] border border-rule bg-panel p-6"
      >
        <p className="text-[18px] font-semibold text-text">{t("savedTitle")}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{t("saved")}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 text-[14px] font-semibold text-link hover:underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-[620px] space-y-4 border border-rule bg-panel p-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            {t("name")}
          </label>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            {t("email")}
          </label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          {t("subject")}
        </label>
        <input id="contact-subject" name="subject" required maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
      </div>
      <div>
        <RichTextEditor
          id="contact-message"
          label={t("message")}
          placeholder={t("messagePlaceholder")}
          value={message}
          onChange={setMessage}
          size="compact"
          uploadImage={uploadPublicImage}
        />
      </div>
      {error ? (
        <p role="alert" className="border-s-4 border-new bg-white px-3 py-2 text-[14px] text-new">
          {error}
        </p>
      ) : null}
      {submitting ? (
        <p role="status" className="text-[14px] text-muted">
          {t("sending")}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || !messageText(message)}
        className="min-h-11 bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60"
      >
        {submitting ? t("sending") : t("submit")}
      </button>
    </form>
  );
}