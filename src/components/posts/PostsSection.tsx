"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { HomePostsAccentSettings } from "@/lib/home-posts-accent-config";
import type { PostSummary } from "@/lib/posts";
import { PostsSectionAccent } from "@/components/posts/PostsSectionAccent";
import { PostsTabs } from "@/components/posts/PostsTabs";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrowRight } from "@/components/ui/Icons";

/** Home posts band: ACM proceedings-style list, covers hidden. */
export function PostsSection({ posts, accent }: { posts: PostSummary[] | null; accent: HomePostsAccentSettings }) {
  const t = useTranslations("posts");
  const latest = posts ?? [];
  const mostViewed = [...latest].sort((a, b) => b.views - a.views || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return (
    <section className="relative overflow-hidden">
      <PostsSectionAccent accent={accent} />
      <div className="relative mx-auto max-w-[1200px] px-6 py-10 max-md:text-[18px]">
        <SectionTitle className="mb-6 max-md:!text-[22px]">{t("latestTitle")}</SectionTitle>
        {posts === null ? (
          <p role="status" className="border-s-4 border-new bg-panel px-4 py-3 text-[18px] text-text md:text-[14px]">
            {t("loadError")}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-[19px] text-muted md:text-[15px]">{t("empty")}</p>
        ) : (
          <>
            <div className="max-w-[720px]">
              <PostsTabs latest={latest} mostViewed={mostViewed} />
            </div>
            <div className="mt-8 border-t border-rule pt-4 text-end">
              <Link href="/posts" className="inline-flex items-center gap-2 text-[18px] text-link hover:text-link-hover hover:underline md:text-[14px]">
                {t("viewAll")}
                <IconArrowRight className="h-3 w-7 rtl:rotate-180" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
