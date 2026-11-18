import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { Panel } from "@/components/ui/SectionTitle";
import { FeedbackForm } from "@/components/site/FeedbackForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedbackPage" });
  return pageMetadata({ locale, path: "/feedback", description: t("metaDescription") });
}

export default async function FeedbackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feedbackPage");
  const tCommon = await getTranslations("breadcrumb");

  return (
    <PageShell hero={{ title: t("heroTitle") }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}>
      <div className="mx-auto max-w-[1200px] px-6">
        <Panel title={t("panelTitle")}>
          <p className="max-w-2xl text-[14px] leading-[1.55] text-muted">{t("intro")}</p>
          <FeedbackForm />
        </Panel>
      </div>
    </PageShell>
  );
}