"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/layout/BrandMark";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="bg-chrome">
        <div className="flex min-h-[50px] items-center border-b border-chrome-line py-2 ps-3">
          <BrandMark />
        </div>
        <div className="h-[46px]" />
      </div>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
        <title>{t("title")}</title>
        <h1 className="text-[30px] leading-[1.2] font-semibold text-text">{t("title")}</h1>
        <p className="mt-4 max-w-[620px] text-[16px] leading-[1.7] text-text">{t("body")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className="bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
            {t("retry")}
          </button>
          <Link href="/" className="border border-text px-4 py-2.5 text-[14px] font-semibold text-text hover:bg-panel">
            {t("home")}
          </Link>
        </div>
      </main>
    </>
  );
}
