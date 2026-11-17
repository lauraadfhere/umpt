"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader } from "@/components/ui/Loader";

const fieldClass =
  "h-11 w-full border border-rule bg-white px-3 text-[15px] text-text outline-none placeholder:italic placeholder:text-[#9a9a9a] focus:border-link";

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? t("genericError"));
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(t("genericError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold">{t("email")}</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder={t("emailPlaceholder")} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold">{t("password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </div>
      {error && (
        <p role="alert" className="border-s-4 border-new bg-white px-3 py-2 text-[14px] text-new">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 bg-link text-[15px] font-semibold text-white hover:bg-link-hover disabled:opacity-80"
      >
        {pending && <Loader size={20} className="text-white" />}
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
