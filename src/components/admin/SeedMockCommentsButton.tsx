"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function SeedMockCommentsButton() {
  const t = useTranslations("dashboard.comments");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    if (!window.confirm(t("seedConfirm"))) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/comments/seed-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await response.json()) as { error?: string; created?: number; skippedPosts?: number };
      if (!response.ok) throw new Error(data.error || t("seedError"));
      setMessage(t("seedDone", { created: data.created ?? 0, skipped: data.skippedPosts ?? 0 }));
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t("seedError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="border border-rule bg-white px-4 py-2.5 text-[14px] font-semibold text-text hover:border-link hover:text-link disabled:opacity-60"
      >
        {busy ? t("seeding") : t("seedMock")}
      </button>
      {message && (
        <p role="status" className="text-[13px] text-muted">
          {message}
        </p>
      )}
    </div>
  );
}