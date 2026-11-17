import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type SubNavItem = { label: string; href: string; active?: boolean };
export type SubNavVariant = "dark" | "light";

const styles: Record<SubNavVariant, { bar: string; list: string; link: string; active: string; idle: string }> = {
  dark: {
    bar: "bg-subnav text-white",
    list: "text-[14px] font-medium",
    link: "px-3 py-3.5",
    active: "bg-subnav-active",
    idle: "hover:bg-white/10",
  },
  // The pale bar above reading pages.
  light: {
    bar: "border-b border-[#c4c4c4] bg-gradient-to-b from-[#f1f1f1] to-[#e2e2e2] text-text shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
    list: "text-[13px]",
    link: "px-2.5 py-3",
    active: "font-semibold",
    idle: "hover:text-link",
  },
};

export function SubNav({ items, variant = "dark" }: { items: SubNavItem[]; variant?: SubNavVariant }) {
  const t = useTranslations("nav");
  const style = styles[variant];

  return (
    <nav className={style.bar} aria-label={t("section")}>
      <ul className={`mx-auto flex max-w-[1200px] flex-wrap justify-center ${style.list}`}>
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} aria-current={item.active ? "page" : undefined} className={`block ${style.link} ${item.active ? style.active : style.idle}`}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
