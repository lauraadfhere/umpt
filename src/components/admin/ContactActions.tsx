"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ContactActions({ id, isHandled, subject }: { id: string; isHandled: boolean; subject: string }) {
  const t = useTranslations("dashboard.contacts");
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function setHandled(handled: boolean) {
    setBusy("handle");
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHandled: handled }),
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
    if (!window.confirm(t("deleteConfirm", { subject: subject || t("noSubject") }))) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
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
      <button type="button" onClick={() => setHandled(!isHandled)} disabled={Boolean(busy)} className="text-[13px] text-link hover:underline disabled:opacity-50">
        {busy === "handle" ? t("saving") : isHandled ? t("markNew") : t("markHandled")}
      </button>
      <button type="button" onClick={remove} disabled={Boolean(busy)} className="text-[13px] text-link hover:underline disabled:opacity-50">
        {busy === "delete" ? t("deleting") : t("delete")}
      </button>
    </div>
  );
}
