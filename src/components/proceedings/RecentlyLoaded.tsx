import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Proceeding } from "@/lib/catalog";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconRss } from "@/components/ui/Icons";

export function RecentlyLoaded({ items }: { items: Proceeding[] }) {
  const t = useTranslations("recent");

  return (
    <section className="relative overflow-hidden bg-panel">
      <svg className="pointer-events-none absolute start-0 bottom-0 h-[260px] w-[360px] rtl:-scale-x-100" viewBox="0 0 360 260" aria-hidden>
        <path d="M-40 300 L120 60 L280 300 Z" fill="#e9e9e9" />
        <path d="M-80 120 L60 -20 L60 260 Z" fill="#ececec" />
      </svg>
      <div className="relative mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <SectionTitle>{t("title")}</SectionTitle>
          <a
            href="/api/rss"
            aria-label={t("rssLabel")}
            className="inline-flex items-center gap-1.5 rounded-full bg-rss px-2.5 py-1 text-[12px] font-bold text-white hover:brightness-110"
          >
            <IconRss className="size-2.5" />
            {t("rss")}
          </a>
        </div>
        <p className="mt-4 mb-5 ps-3 text-[14px]">{t("subtitle")}</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-[3px] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.14)]">
              <p className="text-[13px] leading-snug text-[#555]">{item.title}</p>
              <Link
                href={{ pathname: "/proceedings", query: { q: item.acronym } }}
                className="mt-3 inline-block border-s border-[#b5b5b5] ps-2 text-[15px] text-link hover:text-link-hover hover:underline"
              >
                {item.acronym} ’{String(item.year).slice(-2)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
