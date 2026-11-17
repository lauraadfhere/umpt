/* eslint-disable @next/next/no-img-element -- logo URLs come from Parse/R2 hosts */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LogoSettings } from "@/lib/logo-config";
import { DEFAULT_LOGO_SETTINGS } from "@/lib/logo-config";

export function BrandMark({
  logo = DEFAULT_LOGO_SETTINGS,
  variant = "header",
}: {
  logo?: LogoSettings;
  variant?: "header" | "footer";
}) {
  const t = useTranslations("brand");

  if (logo.mode === "image" && logo.headerUrl) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center text-white" aria-label={t("home")}>
          <img src={logo.headerUrl} alt="" className="h-auto max-h-10 w-auto object-contain" style={{ width: logo.headerWidth }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="flex items-center gap-1.5 text-white" aria-label={t("home")}>
        <span className="text-[13px] font-bold tracking-tight">{logo.textShort || t("short")}</span>
        <span className="grid size-[22px] place-items-center rounded-full bg-white text-[9px] font-bold text-black">
          {logo.textBadge || "DL"}
        </span>
        <span className="flex flex-col text-[11px] font-bold leading-[1.05] tracking-wide uppercase">
          <span>{logo.textLine1 || t("digital")}</span>
          <span>{logo.textLine2 || t("library")}</span>
        </span>
      </Link>
      <span className={`h-8 w-px bg-white/40 ${variant === "footer" ? "block" : "hidden sm:block"}`} aria-hidden />
      <span className={`items-center gap-1.5 text-white ${variant === "footer" ? "flex" : "hidden sm:flex"}`}>
        <span className="grid size-8 place-items-center rounded-full border-[1.5px] border-white text-[9px] font-bold italic">{logo.textRoundel || t("roundel")}</span>
        <span className="flex flex-col text-[8px] leading-tight text-white/90">
          <span>{logo.textOrg1 || t("orgLine1")}</span>
          <span>{logo.textOrg2 || t("orgLine2")}</span>
        </span>
      </span>
    </div>
  );
}
