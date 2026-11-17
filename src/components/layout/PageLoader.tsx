"use client";

import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/layout/BrandMark";
import { Loader } from "@/components/ui/Loader";

/** Shown while a page's data loads. Keeps the black header in place so the layout does not jump. */
export function PageLoader() {
  const t = useTranslations();

  return (
    <>
      <div className="bg-chrome">
        <div className="flex min-h-[50px] items-center border-b border-chrome-line py-2 ps-3">
          <BrandMark />
        </div>
        <div className="h-[46px]" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24">
        <Loader size={56} label={t("loading")} />
        <p className="text-[14px] italic text-muted" aria-hidden>
          {t("loading")}
        </p>
      </div>
    </>
  );
}
