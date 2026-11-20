"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HOME_CATEGORIES } from "@/lib/home-categories";
import { CategoryIcon } from "@/components/home/CategoryIcon";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function CategoryCards() {
  const t = useTranslations("home.categories");
  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const total = Math.max(1, Math.ceil(el.scrollWidth / Math.max(el.clientWidth, 1)));
      setPages(total);
      setPage(Math.min(total - 1, Math.round(el.scrollLeft / Math.max(el.clientWidth, 1))));
    }

    function onScroll() {
      if (!el) return;
      const width = Math.max(el.clientWidth, 1);
      const total = Math.max(1, Math.ceil(el.scrollWidth / width));
      setPage(Math.min(total - 1, Math.round(el.scrollLeft / width)));
    }

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  function goTo(index: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="border-b border-rule bg-white" aria-labelledby="home-categories-heading">
      <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-6 max-md:text-[18px]">
        <SectionTitle className="mb-5 max-md:!text-[22px]">
          <span id="home-categories-heading">{t("title")}</span>
        </SectionTitle>

        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {HOME_CATEGORIES.map((category) => (
            <Link
              key={category.key}
              href={{ pathname: "/posts", query: { category: category.key } }}
              className="relative flex aspect-[3/4] w-[min(42vw,168px)] shrink-0 snap-start flex-col overflow-hidden text-white sm:w-[min(28vw,168px)] md:min-w-0 md:w-[calc((100%)/7)]"
              style={{ backgroundColor: category.color }}
            >
              <span
                className="pointer-events-none absolute left-1/2 bottom-[-18%] size-[130%] -translate-x-1/2 rounded-full"
                style={{ background: `radial-gradient(circle at 50% 40%, ${category.bubble}, transparent 68%)` }}
                aria-hidden
              />
              <span className="relative z-[1] px-3 pt-4 pb-2">
                <span className="block text-[17px] leading-tight font-bold italic tracking-tight sm:text-[18px]">{t(`${category.key}.name`)}</span>
                <span className="mt-1 block truncate text-[11px] leading-snug text-white/90 sm:text-[12px]">{t(`${category.key}.subtitle`)}</span>
              </span>
              <span className="relative z-[1] mt-auto flex flex-1 items-center justify-center pb-6">
                <CategoryIcon categoryKey={category.key} className="size-[72px] text-white/95 sm:size-[84px]" />
              </span>
            </Link>
          ))}
        </div>

        {pages > 1 ? (
          <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label={t("pages")}>
            {Array.from({ length: pages }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={page === index}
                aria-label={t("page", { n: index + 1 })}
                onClick={() => goTo(index)}
                className={`size-2.5 rounded-full border-2 transition ${
                  page === index ? "border-link bg-link" : "border-[#9aa0a6] bg-transparent hover:border-link"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}