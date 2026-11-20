import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPosts, type PostSummary } from "@/lib/posts";
import { breadcrumbJsonLd, localeUrl, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/posts/PostList";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "posts" });
  return pageMetadata({ locale, path: "/posts", title: t("heroTitle"), description: t("metaDescription") });
}

function matchesCategory(post: PostSummary, category: string) {
  const needle = category.trim().toLowerCase();
  if (!needle) return true;
  const hay = `${post.category} ${post.tags.join(" ")} ${post.title}`.toLowerCase();
  return hay.includes(needle);
}

export default async function PostsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("posts");
  const tCommon = await getTranslations("breadcrumb");
  const categoryFilter = category?.trim() || "";

  // A backend that cannot be reached is reported on the page instead of being hidden behind stand-in content.
  let posts: PostSummary[] | null = null;
  try {
    const all = await getPosts(locale);
    posts = categoryFilter ? all.filter((post) => matchesCategory(post, categoryFilter)) : all;
  } catch (error) {
    console.error("[posts] The post list could not be loaded:", error instanceof Error ? error.message : error);
  }

  return (
    <PageShell active="journals" hero={{ title: t("heroTitle") }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: t("heroTitle"), url: localeUrl(locale, "/posts") },
        ])}
      />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionTitle className="mb-5">{t("listTitle")}</SectionTitle>
        {categoryFilter ? (
          <p className="mb-3 text-[14px] text-muted">
            {t("filteredBy", { category: categoryFilter })}{" "}
            <Link href="/posts" className="font-semibold text-link hover:underline">
              {t("clearFilter")}
            </Link>
          </p>
        ) : null}
        {posts === null ? (
          <p role="status" className="border-s-4 border-new bg-panel px-4 py-3 text-[14px] text-text">
            {t("loadError")}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-[15px] text-muted">{t("empty")}</p>
        ) : (
          <div className="max-w-full md:max-w-[860px]">
            <p className="mb-2 text-[14px] text-muted">{t("count", { count: posts.length })}</p>
            <PostList posts={posts} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
