"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeLabels, routing } from "@/i18n/routing";

export function FooterLanguages() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <ul className="space-y-1.5">
      {routing.locales.map((loc) => (
        <li key={loc}>
          <Link
            href={pathname}
            locale={loc}
            lang={loc}
            aria-current={loc === locale ? "true" : undefined}
            className={`hover:underline ${loc === locale ? "font-semibold text-white" : "text-white/85"}`}
          >
            {localeLabels[loc]}
          </Link>
        </li>
      ))}
    </ul>
  );
}
