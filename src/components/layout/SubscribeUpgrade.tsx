"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconGear, IconMail } from "@/components/ui/Icons";

const inputClass =
  "w-full border border-white/15 bg-[#1c1c1c] px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/35 focus:bg-[#222]";
const labelClass = "mb-1.5 block text-[12px] font-semibold tracking-wide text-white/55 uppercase";

export function SubscribeUpgrade() {
  const t = useTranslations("subscribe");
  const tBrand = useTranslations("brand");
  const locale = useLocale();
  const titleId = useId();
  const inputId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function open() {
    setError("");
    setDone(false);
    setEmail("");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source: "subscribe" }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || t("error"));
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <span className="flex h-[26px] items-stretch border border-white/25 bg-black font-semibold text-white">
        <span className="flex items-center gap-1.5 px-2.5">
          <IconGear className="size-3.5" />
          {tBrand("basicEdition")}
        </span>
        <button
          type="button"
          onClick={open}
          className="flex items-center border-s border-white/25 bg-black px-3 text-white hover:bg-[#111]"
        >
          {tBrand("subscribe")}
        </button>
      </span>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(100%,440px)] border-0 bg-transparent p-5 backdrop:bg-black/80 open:flex open:items-center open:justify-center"
      >
        <div className="w-full border border-white/12 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
          <div className="border-b border-white/10 bg-[#0d0d0d] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#2a2a2a] text-white/90" aria-hidden>
                  <IconMail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase">{t("eyebrow")}</p>
                  <h2 id={titleId} className="mt-1 text-[22px] leading-tight font-semibold tracking-tight text-white">
                    {t("title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-[1.6] text-white/60">{t("body")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="shrink-0 px-1 text-[22px] leading-none text-white/40 transition hover:text-white"
                aria-label={t("close")}
              >
                ×
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 bg-[#111] px-6 py-6">
            {done ? (
              <div role="status" className="border border-white/10 bg-[#1a1a1a] px-4 py-4">
                <p className="text-[15px] font-semibold text-white">{t("savedTitle")}</p>
                <p className="mt-1 text-[14px] leading-[1.55] text-white/55">{t("saved")}</p>
              </div>
            ) : (
              <>
                <h2 className="sr-only">{t("title")}</h2>
                <div>
                  <label htmlFor={inputId} className={labelClass}>
                    {t("email")}
                  </label>
                  <input
                    id={inputId}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={120}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("placeholder")}
                    className={inputClass}
                  />
                  <p className="mt-2 text-[12px] leading-[1.5] text-white/40">{t("privacy")}</p>
                </div>
                {error ? (
                  <p role="alert" className="border-s-2 border-new bg-[#1a1a1a] px-3 py-2.5 text-[13px] text-[#ffb4b4]">
                    {error}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={busy}
                    className="bg-white px-5 py-2.5 text-[14px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {busy ? t("sending") : t("submit")}
                  </button>
                  <button type="button" onClick={close} className="px-3 py-2.5 text-[14px] text-white/50 transition hover:text-white">
                    {t("cancel")}
                  </button>
                </div>
              </>
            )}
            {done ? (
              <button
                type="button"
                onClick={close}
                className="w-full border border-white/15 bg-[#2a2a2a] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#333]"
              >
                {t("done")}
              </button>
            ) : null}
          </form>
        </div>
      </dialog>
    </>
  );
}