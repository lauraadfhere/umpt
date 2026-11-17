import { useTranslations } from "next-intl";
import { CONTACT_EMAIL } from "@/lib/site";
import { IconMessage } from "@/components/ui/Icons";

export function FeedbackTab() {
  const t = useTranslations();
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("feedback"))}`}
      className="fixed end-0 top-[34%] z-40 flex flex-col items-center gap-2 rounded-s-md bg-feedback px-[7px] py-3 text-[13px] font-medium text-white shadow-md hover:brightness-110"
      style={{ writingMode: "vertical-rl" }}
    >
      <span>{t("feedback")}</span>
      <IconMessage className="size-4 -rotate-90" />
    </a>
  );
}
