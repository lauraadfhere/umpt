"use client";

import { FormEvent, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function ReadingSidebarNewsletter() {
  const t = useTranslations("reading.sidebarNewsletter");
  const tSubscribe = useTranslations("subscribe");
  const locale = useLocale();
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source: "post-sidebar" }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || tSubscribe("error"));
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : tSubscribe("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-rule px-3 py-4" aria-labelledby="sidebar-newsletter-title">
      <p id="sidebar-newsletter-title" className="text-[12px] font-semibold tracking-wide text-accent uppercase">
        {t("title")}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-muted">{t("hint")}</p>
      {done ? (
        <p role="status" className="mt-3 border-s-2 border-edition bg-white px-2.5 py-2 text-[12px] leading-snug text-text">
          {tSubscribe("saved")}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <label htmlFor={inputId} className="sr-only">
            {tSubscribe("email")}
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tSubscribe("placeholder")}
            className="w-full border border-rule bg-white px-2.5 py-2 text-[13px] outline-none focus:border-link"
          />
          {error ? (
            <p role="alert" className="text-[11px] text-new">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-link px-3 py-2 text-[12px] font-semibold text-white hover:bg-link-hover disabled:opacity-60"
          >
            {busy ? tSubscribe("sending") : tSubscribe("submit")}
          </button>
        </form>
      )}
    </section>
  );
}