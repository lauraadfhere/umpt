import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HOME_CATEGORIES } from "@/lib/home-categories";
import { CategoryIcon } from "@/components/home/CategoryIcon";

export async function CategoryGrid() {
  const t = await getTranslations("home.categories");

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-0">
      {HOME_CATEGORIES.map((category) => (
        <li key={category.key}>
          <Link
            href={{ pathname: "/posts", query: { category: category.key } }}
            className="relative flex aspect-[3/4] w-full flex-col overflow-hidden text-white transition hover:brightness-110"
            style={{ backgroundColor: category.color }}
          >
            <span
              className="pointer-events-none absolute left-1/2 bottom-[-18%] size-[130%] -translate-x-1/2 rounded-full"
              style={{ background: `radial-gradient(circle at 50% 40%, ${category.bubble}, transparent 68%)` }}
              aria-hidden
            />
            <span className="relative z-[1] px-3 pt-4 pb-2">
              <span className="block text-[17px] leading-tight font-bold italic tracking-tight sm:text-[18px]">{t(`${category.key}.name`)}</span>
              <span className="mt-1 block text-[11px] leading-snug text-white/90 sm:text-[12px]">{t(`${category.key}.subtitle`)}</span>
            </span>
            <span className="relative z-[1] mt-auto flex flex-1 items-center justify-center pb-6">
              <CategoryIcon categoryKey={category.key} className="size-[72px] text-white/95 sm:size-[84px]" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}