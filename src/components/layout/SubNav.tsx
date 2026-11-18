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
    link: "min-h-11 touch-manipulation px-3 py-2.5 sm:px-4 sm:py-3",
    active: "font-semibold text-text underline decoration-2 underline-offset-[10px]",
    idle: "text-[#333] hover:text-link",
  },
};

type Props = {
  items: SubNavItem[];
  variant?: SubNavVariant;
  /** Pins the bar under the main header while scrolling (reading pages). */
  sticky?: boolean;
};

export function SubNav({ items, variant = "dark", sticky = true }: Props) {
  const t = useTranslations("nav");
  const style = styles[variant];
  const stick =
    sticky ?
      "sticky top-[var(--sticky-subnav-top)] z-[55] shadow-[0_2px_6px_rgba(0,0,0,0.12)] supports-[backdrop-filter]:bg-[#ebebeb]/92 supports-[backdrop-filter]:backdrop-blur-sm"
    : "";

  return (
    <nav className={`${style.bar} ${stick} ${variant === "light" && sticky ? "supports-[backdrop-filter]:from-[#f1f1f1]/92 supports-[backdrop-filter]:to-[#e2e2e2]/92" : ""}`} aria-label={t("section")}>
      <ul className={`mx-auto flex max-w-[1200px] flex-wrap justify-center gap-x-0.5 ${style.list}`}>
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
