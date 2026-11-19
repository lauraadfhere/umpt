import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconArrowRight } from "@/components/ui/Icons";

export type SidebarQuestion = { id: string; title: string; answerCount: number };

export function ReadingSidebarAskQuestion({ latest }: { latest: SidebarQuestion[] }) {
  const t = useTranslations("reading.sidebarAsk");
  const items = latest.slice(0, 4);

  return (
    <section className="border-t border-rule px-3 py-4" aria-labelledby="sidebar-ask-title">
      <p id="sidebar-ask-title" className="text-[12px] font-semibold tracking-wide text-accent uppercase">
        {t("title")}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-muted">{t("hint")}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 border border-rule bg-white">
          {items.map((question) => (
            <li key={question.id} className="border-b border-rule/80 px-2.5 py-2 last:border-b-0">
              <Link href={`/questions/${question.id}`} className="line-clamp-2 text-[12px] font-medium leading-snug text-link hover:underline">
                {question.title}
              </Link>
              <p className="mt-0.5 text-[11px] text-muted">{t("answers", { count: question.answerCount })}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[12px] italic text-muted">{t("empty")}</p>
      )}
      <div className="mt-3 space-y-2">
        <Link
          href="/questions"
          className="flex w-full items-center justify-center gap-1.5 bg-link px-3 py-2 text-[12px] font-semibold text-white hover:bg-link-hover"
        >
          {t("askButton")}
          <IconArrowRight className="h-2 w-4 rtl:rotate-180" />
        </Link>
        <Link href="/questions" className="block text-center text-[12px] font-semibold text-link hover:underline">
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
}