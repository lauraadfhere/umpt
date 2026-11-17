import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/posts";

/** ACM-style text list for the posts index: title + italic subtitle, no cover images. */
export function PostList({ posts }: { posts: PostSummary[] }) {
  const t = useTranslations("posts");
  const locale = useLocale();

  return (
    <ul className="border-t border-rule">
      {posts.map((post) => {
        const href = `/posts/${post.slug}`;
        const subtitle = post.category || post.excerpt;
        const textProps = post.language === locale ? {} : { lang: post.language, dir: post.language === "ar" ? ("rtl" as const) : ("ltr" as const) };
        return (
          <li key={post.id} className="border-b border-rule py-3.5">
            <h3 {...textProps} className="text-[16px] leading-snug font-medium text-[#222]">
              <Link href={href} className="hover:text-link">
                {post.title}
              </Link>
            </h3>
            {subtitle ? (
              <p {...textProps} className="mt-1.5 line-clamp-2 text-[12px] italic text-muted">
                {subtitle}
              </p>
            ) : (
              <p className="mt-1.5 text-[12px] italic text-muted">{t("readMore")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
