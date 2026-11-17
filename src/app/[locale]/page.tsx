import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProceedings, latestFirst } from "@/lib/catalog";
import { getHomePostsAccentSettings } from "@/lib/home-posts-accent";
import { getPosts, type PostSummary } from "@/lib/posts";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { PostsSection } from "@/components/posts/PostsSection";
import { ProceedingsHighlights } from "@/components/proceedings/ProceedingsHighlights";
import { RecentlyLoaded } from "@/components/proceedings/RecentlyLoaded";
import { JsonLd } from "@/components/seo/JsonLd";
import { Panel } from "@/components/ui/SectionTitle";

type Props = { params: Promise<{ locale: string }> };

const HOME_POSTS = 8;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "", description: t("description") });
}

/** Null when the backend cannot be reached, so the section can say so instead of showing stand-in content. */
async function latestPosts(locale: string): Promise<PostSummary[] | null> {
  try {
    return (await getPosts(locale)).slice(0, HOME_POSTS);
  } catch (error) {
    console.error("[home] Posts could not be loaded:", error instanceof Error ? error.message : error);
    return null;
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tMeta = await getTranslations("meta");
  const [posts, { proceedings }, homePostsAccent] = await Promise.all([
    latestPosts(locale),
    getProceedings(),
    getHomePostsAccentSettings(),
  ]);
  const latest = latestFirst(proceedings);
  const alphabetical = [...proceedings].sort((a, b) => a.acronym.localeCompare(b.acronym));

  return (
    <PageShell
      flush
      hero={{ title: t("heroTitle"), search: { action: `/${locale}/proceedings`, placeholder: t("searchPlaceholder") } }}
      breadcrumbs={[{ label: t("breadcrumb") }]}
    >
      <JsonLd data={websiteJsonLd(locale, tMeta("description"))} />
      <div className="mx-auto max-w-[1200px] px-6">
        <Panel title={t("welcomeTitle")}>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <p className="max-w-3xl text-[14px] leading-[1.55]">{t("welcomeBody")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/posts" className="bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
                {t("browsePosts")}
              </Link>
              <Link href="/proceedings" className="border border-text px-4 py-2.5 text-[14px] font-semibold text-text hover:bg-white">
                {t("browseProceedings")}
              </Link>
            </div>
          </div>
        </Panel>
      </div>
      <PostsSection posts={posts} accent={homePostsAccent} />
      <ProceedingsHighlights latest={latest.slice(0, 5)} alphabetical={alphabetical.slice(0, 5)} />
      <RecentlyLoaded items={latest.slice(0, 6)} />
    </PageShell>
  );
}
