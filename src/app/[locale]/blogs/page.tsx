import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPosts, type PostSummary } from "@/lib/posts";
import { breadcrumbJsonLd, localeUrl, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { PostCatalog } from "@/components/posts/PostCatalog";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogs" });
  return pageMetadata({ locale, path: "/blogs", title: t("heroTitle"), description: t("metaDescription") });
}

export default async function BlogsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blogs");
  const tCommon = await getTranslations("breadcrumb");

  let posts: PostSummary[] | null = null;
  try {
    posts = await getPosts(locale);
  } catch (error) {
    console.error("[blogs] Posts could not be loaded:", error instanceof Error ? error.message : error);
  }

  return (
    <PageShell active="blogs" hero={{ title: t("heroTitle") }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: t("heroTitle"), url: localeUrl(locale, "/blogs") },
        ])}
      />
      <div className="relative mx-auto max-w-[1200px] overflow-hidden px-6 pb-10">
        <p className="mb-4 max-w-[940px] text-[14px] leading-[1.55] text-muted">{t("intro")}</p>
        {posts === null ? (
          <p role="status" className="border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-text">
            {t("loadError")}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-[15px] text-muted">{t("empty")}</p>
        ) : (
          <PostCatalog posts={posts} />
        )}
      </div>
    </PageShell>
  );
}