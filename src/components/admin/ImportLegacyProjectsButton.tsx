"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ImportLegacyProjectsButton() {
  const t = useTranslations("dashboard.projects");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function runImport() {
    if (!window.confirm(t("importConfirm"))) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "importLegacy" }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; created?: number; skipped?: number };
      if (!response.ok) {
        window.alert(data.error || t("importError"));
        return;
      }
      window.alert(t("importDone", { created: data.created ?? 0, skipped: data.skipped ?? 0 }));
      router.refresh();
    } catch {
      window.alert(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={runImport} disabled={busy} className="border border-rule bg-white px-4 py-2.5 text-[14px] font-semibold text-text hover:border-link hover:text-link disabled:opacity-60">
      {busy ? t("importing") : t("importLegacy")}
    </button>
  );
}