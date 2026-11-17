"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function CopySubscriberEmails({ emails }: { emails: string[] }) {
  const t = useTranslations("dashboard.subscribers");
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!emails.length) return;
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.alert(t("copyError"));
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      disabled={!emails.length}
      className="border border-rule bg-white px-4 py-2.5 text-[14px] font-semibold text-text hover:border-link hover:text-link disabled:opacity-50"
    >
      {copied ? t("copied") : t("copyEmails")}
    </button>
  );
}