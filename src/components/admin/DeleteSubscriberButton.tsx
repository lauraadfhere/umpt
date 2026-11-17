"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DeleteSubscriberButton({ id, email }: { id: string; email: string }) {
  const t = useTranslations("dashboard.subscribers");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(t("deleteConfirm", { email }))) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error || t("deleteError"));
        return;
      }
      router.refresh();
    } catch {
      window.alert(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={remove} disabled={busy} className="text-[13px] text-new hover:underline disabled:opacity-50">
      {busy ? t("deleting") : t("delete")}
    </button>
  );
}