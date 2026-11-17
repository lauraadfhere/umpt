"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      }}
    >
      {t("signOut")}
    </button>
  );
}
