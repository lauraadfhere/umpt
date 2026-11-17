"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function CommentReply({ id }: { id: string }) {
  const t = useTranslations("dashboard.comments");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!message.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/comments/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || t("replyError"));
        return;
      }
      setMessage("");
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[13px] text-link hover:underline">
        {t("reply")}
      </button>
    );
  }

  return (
    <div className="mt-3 w-full space-y-2">
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
        placeholder={t("replyPlaceholder")}
        className="w-full border border-rule bg-white px-3 py-2 text-[14px] outline-none focus:border-link"
      />
      {error && (
        <p role="alert" className="text-[13px] text-new">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button type="button" onClick={submit} disabled={busy} className="bg-link px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-link-hover disabled:opacity-60">
          {busy ? t("saving") : t("sendReply")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[13px] text-muted hover:underline">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
