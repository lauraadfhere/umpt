"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.5l-5.1-6.7L5.7 22H2.6l7.3-8.3L1 2h6.7l4.6 6.1L18.9 2zm-1.1 18h1.8L6.3 3.9H4.4L17.8 20z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5.1 3.5A2.1 2.1 0 1 1 5 7.7a2.1 2.1 0 0 1 .1-4.2ZM3.3 9h3.6v11.5H3.3V9Zm5.8 0h3.4v1.6h.1c.5-.9 1.7-1.8 3.5-1.8 3.7 0 4.4 2.4 4.4 5.6v6.1h-3.6v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5H9.1V9z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 6.5 12 13l10-6.5V5H2z" />
      <path d="M2 8.9V19h20V8.9l-10 6.5z" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

const btn = "grid size-9 place-items-center border border-rule bg-white text-muted transition hover:border-link hover:text-link";

export function PostShareBar({ url, title }: { url: string; title: string }) {
  const t = useTranslations("reading.share");
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">{t("label")}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("label")}>
        <button type="button" onClick={copyLink} className={btn} title={copied ? t("copied") : t("copy")} aria-label={copied ? t("copied") : t("copy")}>
          <IconLink className="size-4" />
        </button>
        <a className={btn} href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" title={t("x")} aria-label={t("x")}>
          <IconX className="size-3.5" />
        </a>
        <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title={t("linkedin")} aria-label={t("linkedin")}>
          <IconLinkedIn className="size-3.5" />
        </a>
        <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title={t("facebook")} aria-label={t("facebook")}>
          <IconFacebook className="size-3.5" />
        </a>
        <a className={btn} href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} title={t("email")} aria-label={t("email")}>
          <IconMail className="size-3.5" />
        </a>
      </div>
      {copied && (
        <span role="status" className="text-[12px] text-edition">
          {t("copied")}
        </span>
      )}
    </div>
  );
}
