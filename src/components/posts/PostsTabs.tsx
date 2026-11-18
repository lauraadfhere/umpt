"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/posts";

type TabKey = "latest" | "viewed";

/** ACM-style text list: title + italic subtitle, no covers. */
export function PostsTabs({ latest, mostViewed }: { latest: PostSummary[]; mostViewed: PostSummary[] }) {
  const t = useTranslations("posts");
  const [tab, setTab] = useState<TabKey>("latest");
  const items = tab === "latest" ? latest : mostViewed;
  const tabs: { key: TabKey; label: string }[] = useMemo(
    () => [
      { key: "latest", label: t("tabLatest") },
      { key: "viewed", label: t("tabMostViewed") },
    ],
    [t],
  );

  return (
    <div>
      <div role="tablist" aria-label={t("latestTitle")} className="mb-2 flex gap-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`posts-tab-${key}`}
            aria-selected={tab === key}
            aria-controls="posts-tabpanel"
            onClick={() => setTab(key)}
            className={`border-b-2 pb-1.5 text-[20px] md:text-[16px] ${tab === key ? "border-text font-semibold text-text" : "border-transparent text-muted hover:text-text"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul id="posts-tabpanel" role="tabpanel" aria-labelledby={`posts-tab-${tab}`}>
        {items.map((post) => {
          const subtitle = post.category || post.excerpt;
          const textProps = post.language ? { lang: post.language } : {};
          return (
            <li key={post.id} className="border-b border-rule py-2">
              <Link
                href={`/posts/${post.slug}`}
                {...textProps}
                className="text-[20px] leading-tight font-medium text-[#222] hover:text-link md:text-[16px]"
              >
                {post.title}
              </Link>
              {subtitle && (
                <p {...textProps} className="mt-0.5 line-clamp-2 text-[16px] leading-snug italic text-muted md:text-[12px]">
                  {subtitle}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
