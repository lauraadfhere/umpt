import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Proceeding } from "@/lib/catalog";
import { ProceedingsTabs } from "@/components/proceedings/ProceedingsTabs";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrowRight } from "@/components/ui/Icons";

function SectionArt() {
  return (
    <svg className="pointer-events-none absolute start-0 top-0 h-full w-[520px] rtl:-scale-x-100" viewBox="0 0 520 400" preserveAspectRatio="xMinYMid slice" aria-hidden>
      <circle cx="40" cy="40" r="240" fill="none" stroke="#f6f6f6" strokeWidth="48" />
      <path d="M-60 440 L170 210 L400 440 Z" fill="#f8f8f8" />
    </svg>
  );
}

function ConferencePromo() {
  const t = useTranslations("highlights");

  return (
    <aside className="relative min-h-[300px] overflow-hidden bg-promo text-white">
      <svg className="pointer-events-none absolute inset-0 h-full w-full rtl:-scale-x-100" viewBox="0 0 470 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <path d="M300 0 L470 0 L470 170 Z" fill="var(--color-promo-shape)" opacity="0.7" />
        <path d="M250 300 L360 130 L470 300 Z" fill="var(--color-promo-shape)" opacity="0.45" />
        <path d="M0 0 L140 0 L0 110 Z" fill="var(--color-promo-shape)" opacity="0.35" />
        <path d="M470 300 L330 300 L470 215 Z" fill="var(--color-promo-accent)" />
      </svg>
      <div className="relative flex h-full flex-col justify-between gap-10 p-6">
        <div>
          <h3 className="text-[20px] font-semibold italic">{t("promoTitle")}</h3>
          <p className="mt-3 max-w-[400px] text-[14px] leading-[1.6] italic text-white/90">{t("promoBody")}</p>
        </div>
        <Link href="/proceedings" className="block max-w-[290px] border-s-2 border-white ps-4 text-[24px] leading-[1.25] font-semibold italic hover:underline">
          {t("promoCta")}
        </Link>
      </div>
    </aside>
  );
}

export function ProceedingsHighlights({ latest, alphabetical }: { latest: Proceeding[]; alphabetical: Proceeding[] }) {
  const t = useTranslations("highlights");

  return (
    <section className="relative overflow-hidden">
      <SectionArt />
      <div className="relative mx-auto max-w-[1200px] px-6 pt-12">
        <SectionTitle className="mb-6">{t("title")}</SectionTitle>
        <div className="grid gap-8 lg:grid-cols-[1fr_470px]">
          <ProceedingsTabs latest={latest} alphabetical={alphabetical} />
          <ConferencePromo />
        </div>
        <div className="mt-8 border-t border-rule pt-4 text-end">
          <Link href="/proceedings" className="inline-flex items-center gap-2 text-[14px] text-link hover:text-link-hover hover:underline">
            {t("viewAll")}
            <IconArrowRight className="h-3 w-7 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
