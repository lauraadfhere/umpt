"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  OPEN_COOKIE_CONSENT_EVENT,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";

function hasStoredChoice(): boolean {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return value === "all" || value === "rejected" || value === "essential";
  } catch {
    return false;
  }
}

function storeChoice(choice: CookieConsentChoice) {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
}

function IconCookie({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5.5-3.7A6.5 6.5 0 0 0 12 4.5 6.5 6.5 0 0 0 5.5 11 4 4 0 0 1 2 12 10 10 0 0 0 12 2Zm-2.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4 4.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  );
}

const triggerClass =
  "pointer-events-auto grid size-8 place-items-center rounded-full bg-[#1a5276] text-white shadow-[0_2px_10px_rgba(26,82,118,0.35)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasStoredChoice()) setVisible(true);
    const open = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_CONSENT_EVENT, open);
  }, []);

  function close(choice: CookieConsentChoice) {
    storeChoice(choice);
    setVisible(false);
  }

  const actionBtn =
    "flex w-full items-center justify-center bg-white px-2 py-2 text-center text-[10px] font-bold tracking-wide text-[#1a1a1a] uppercase transition hover:bg-[#f4f4f4] sm:text-[10px]";

  return (
    <>
      {!visible ? (
        <div className="pointer-events-none fixed start-3 bottom-3 z-40 sm:start-4 sm:bottom-4">
          <button
            type="button"
            className={triggerClass}
            onClick={() => setVisible(true)}
            aria-label={t("openSettings")}
            title={t("openSettings")}
          >
            <IconCookie className="size-3.5" />
          </button>
        </div>
      ) : null}

      {visible ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a1628]/55 backdrop-blur-[2px]"
            aria-label={t("closeOverlay")}
            onClick={() => close("essential")}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-banner-title"
            className="relative w-full max-w-[480px] bg-[#1a5276] text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
          >
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <h2 id="cookie-banner-title" className="font-serif text-[17px] leading-snug font-semibold sm:text-[18px]">
                {t("title")}
              </h2>
              <p className="mt-2.5 text-[12px] leading-[1.55] text-white/90">{t("body")}</p>

              <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
                <button type="button" className={actionBtn} onClick={() => close("rejected")}>
                  {t("reject")}
                </button>
                <Link href="/privacy" className={actionBtn} onClick={() => close("essential")}>
                  {t("settings")}
                </Link>
                <button type="button" className={actionBtn} onClick={() => close("all")}>
                  {t("acceptAll")}
                </button>
              </div>

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 text-[11px] text-white/75">
                <p>
                  <Link href="/terms" className="underline underline-offset-2 hover:text-white">
                    {t("termsLink")}
                  </Link>
                  <span className="mx-2" aria-hidden>
                    |
                  </span>
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
                    {t("privacyLink")}
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}