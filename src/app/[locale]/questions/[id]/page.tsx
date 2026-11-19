import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDate } from "@/lib/format";
import { getApprovedQuestion } from "@/lib/questions";
import { richTextToPlain, sanitizeRichText } from "@/lib/richtext";
import { breadcrumbJsonLd, localeUrl, metaDescription, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { SiteRichContent } from "@/components/site/SiteRichContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const question = await getApprovedQuestion(id);
  if (!question) return {};
  const description = metaDescription(question.excerpt || richTextToPlain(sanitizeRichText(question.bodyHtml)));
  return pageMetadata({ locale, path: `/questions/${id}`, title: question.title, description });
}

export default async function QuestionDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const question = await getApprovedQuestion(id);
  if (!question) notFound();

  const t = await getTranslations("questions");
  const tCommon = await getTranslations("breadcrumb");
  const date = formatDate(question.createdAt, locale);

  return (
    <PageShell
      hero={{ title: t("detailHero") }}
      breadcrumbs={[
        { label: tCommon("home"), href: "/" },
        { label: t("heroTitle"), href: "/questions" },
        { label: question.title },
      ]}
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: t("heroTitle"), url: localeUrl(locale, "/questions") },
          { name: question.title, url: localeUrl(locale, `/questions/${id}`) },
        ])}
      />
      <article className="relative mx-auto max-w-[820px] px-4 pb-12 sm:px-6">
        <Link href="/questions" className="text-[14px] font-semibold text-link hover:underline">
          ← {t("backToList")}
        </Link>
        <header className="mt-4 border-b border-rule pb-5">
          <h1 className="text-[24px] leading-[1.25] font-semibold text-text sm:text-[30px]">{question.title}</h1>
          <p className="mt-3 text-[13px] text-muted">
            {t("askedBy", { name: question.askerName })}
            {date ? (
              <>
                {" · "}
                <time dateTime={question.createdAt ?? undefined}>{date}</time>
              </>
            ) : null}
            {" · "}
            {t("answers", { count: question.answerCount })}
          </p>
        </header>
        <div className="mt-6">
          <SiteRichContent html={sanitizeRichText(question.bodyHtml).html} />
        </div>
      </article>
    </PageShell>
  );
}