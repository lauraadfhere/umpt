"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { AskQuestionForm } from "@/components/questions/AskQuestionForm";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Question = {
  id: string;
  title: string;
  excerpt: string;
  askerName: string;
  answerCount: number;
  createdAt: string | null;
};

export function QuestionsBoard({ initial }: { initial: Question[] }) {
  const t = useTranslations("questions");
  const locale = useLocale();
  const [questions, setQuestions] = useState(initial);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    fetch("/api/questions")
      .then(async (response) => {
        const data = (await response.json()) as { questions?: Question[] };
        if (response.ok) setQuestions(data.questions ?? []);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setQuestions(initial);
  }, [initial]);

  return (
    <div className="max-w-[900px]">
      <AskQuestionForm onSubmitted={reload} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <SectionTitle>{t("listTitle")}</SectionTitle>
        {loading ? (
          <p className="text-[13px] text-muted" role="status">
            {t("refreshing")}
          </p>
        ) : null}
      </div>
      {questions.length === 0 ? (
        <p className="border border-rule bg-panel px-4 py-8 text-[15px] text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-rule border border-rule bg-white">
          {questions.map((question) => (
            <li key={question.id} className="px-4 py-4 sm:px-5">
              <div className="flex gap-4">
                <h3 className="min-w-0 flex-1 text-[16px] leading-snug font-semibold text-text sm:text-[17px]">
                  <Link href={`/questions/${question.id}`} className="text-link hover:underline">
                    {question.title}
                  </Link>
                </h3>
              </div>
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted">{question.excerpt}</p>
              <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-muted">
                <span>{t("askedBy", { name: question.askerName })}</span>
                <span aria-hidden>·</span>
                {question.createdAt ? (
                  <time dateTime={question.createdAt}>{formatDate(question.createdAt, locale)}</time>
                ) : (
                  <span>—</span>
                )}
                <span aria-hidden>·</span>
                <span>{t("answers", { count: question.answerCount })}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}