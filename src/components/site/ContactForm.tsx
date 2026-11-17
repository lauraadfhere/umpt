"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const inputClass = "w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link";
const labelClass = "mb-1 block text-[13px] font-semibold text-text";

export function ContactForm() {
  const t = useTranslations("pages.contact");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setStatus(t("sending"));
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, locale }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || t("saveError"));
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setStatus(t("saved"));
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-[620px] space-y-4 border border-rule bg-panel p-5">
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
        <label htmlFor="contact-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea id="contact-message" name="message" required rows={6} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} />
      </div>
      {error ? (
        <p role="alert" className="border-s-4 border-new bg-white px-3 py-2 text-[14px] text-new">
          {error}
        </p>
      ) : null}
      {status && !error ? (
        <p role="status" className="border-s-4 border-edition bg-white px-3 py-2 text-[14px] text-text">
          {status}
        </p>
      ) : null}
      <button type="submit" disabled={submitting} className="bg-link px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
        {submitting ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
