"use client";

import { useTranslations } from "next-intl";
import { IconArrowRight } from "@/components/ui/Icons";

export function BookPurchaseCard({ buyUrl, price, format }: { buyUrl: string; price: string; format: string }) {
  const t = useTranslations("books.detail");

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="border border-rule bg-panel p-4">
        {price && (
          <p className="text-[22px] font-semibold text-text">
            {price}
            <span className="ms-2 text-[13px] font-normal text-muted">{t("priceNote")}</span>
          </p>
        )}
        {format && <p className="mt-1 text-[13px] text-muted">{format}</p>}
        {buyUrl ? (
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 bg-[#e8912d] px-4 py-2.5 text-[15px] font-semibold text-[#111] hover:brightness-95"
          >
            {t("buyNow")}
            <IconArrowRight className="h-3 w-7 rtl:rotate-180" />
          </a>
        ) : (
          <p className="mt-4 text-[13px] text-muted">{t("noBuyLink")}</p>
        )}
        <p className="mt-3 text-[12px] leading-snug text-muted">{t("purchaseDisclaimer")}</p>
      </div>
    </aside>
  );
}