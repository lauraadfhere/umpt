"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function BookReviewActions({ id, isApproved, name }: { id: string; isApproved: boolean; name: string }) {
  const t = useTranslations("dashboard.reviews");
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function setApproved(approved: boolean) {
    setBusy("approve");
    try {
      const response = await fetch(`/api/admin/book-reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approved }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error || t("updateError"));
        return;
      }
      router.refresh();
    } catch {
      window.alert(t("networkError"));
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!window.confirm(t("deleteConfirm", { name }))) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/book-reviews/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error || t("deleteError"));
        return;
      }
      router.refresh();
    } catch {
      window.alert(t("networkError"));
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => setApproved(!isApproved)} disabled={Boolean(busy)} className="text-[13px] text-link hover:underline disabled:opacity-50">
        {busy === "approve" ? t("saving") : isApproved ? t("unpublish") : t("approve")}
      </button>
      <button type="button" onClick={remove} disabled={Boolean(busy)} className="text-[13px] text-new hover:underline disabled:opacity-50">
        {busy === "delete" ? t("deleting") : t("delete")}
      </button>
    </div>
  );
}