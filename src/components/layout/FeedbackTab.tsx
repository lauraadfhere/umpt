import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconMessage } from "@/components/ui/Icons";

/** Fixed vertical tab on the leading edge (ACM-style feedback). */
export function FeedbackTab() {
  const t = useTranslations();
  return (
    <Link
      href="/feedback"
      className="fixed top-[34%] left-0 z-40 flex min-h-[7.5rem] w-[2.35rem] flex-col items-center justify-between rounded-e bg-feedback py-4 ps-[9px] pe-[7px] text-white shadow-[2px_0_8px_rgba(0,0,0,0.18)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rtl:left-auto rtl:right-0 rtl:rounded-e-none rtl:rounded-s rtl:shadow-[-2px_0_8px_rgba(0,0,0,0.18)]"
      aria-label={t("feedback")}
    >
      <span className="text-[15px] font-normal tracking-[0.02em] [writing-mode:vertical-rl] rotate-180">{t("feedback")}</span>
      <IconMessage className="size-[18px] shrink-0 stroke-[1.75]" />
    </Link>
  );
}