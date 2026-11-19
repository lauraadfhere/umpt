import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApprovedQuestions } from "@/lib/questions";
import { breadcrumbJsonLd, localeUrl, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { QuestionsBoard } from "@/components/questions/QuestionsBoard";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "questions" });
  return pageMetadata({ locale, path: "/questions", title: t("heroTitle"), description: t("metaDescription") });
}

export default async function QuestionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("questions");
  const tCommon = await getTranslations("breadcrumb");

  const approved = await getApprovedQuestions().catch(() => []);
  const initial = approved.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    askerName: item.askerName,
    answerCount: item.answerCount,
    createdAt: item.createdAt,
  }));

  return (
    <PageShell hero={{ title: t("heroTitle") }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: t("heroTitle"), url: localeUrl(locale, "/questions") },
        ])}
      />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-12 sm:px-6">
        <p className="mb-6 max-w-[720px] text-[15px] leading-[1.6] text-muted">{t("intro")}</p>
        <QuestionsBoard initial={initial} />
      </div>
    </PageShell>
  );
}