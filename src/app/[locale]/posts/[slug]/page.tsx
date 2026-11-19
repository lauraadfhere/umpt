/* eslint-disable @next/next/no-img-element -- covers come from arbitrary Parse/R2 hosts */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { formatDate, yearOf } from "@/lib/format";
import { ABSTRACT_ID, bodyToPlain, INTRO_ID, parsePostBody } from "@/lib/post-sections";
import { getPost, type Post } from "@/lib/posts";
import { getApprovedQuestions } from "@/lib/questions";
import { getProfileSettings } from "@/lib/profile";
import { namesMatch } from "@/lib/profile-config";
import { articleJsonLd, breadcrumbJsonLd, localeUrl, metaDescription, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { PostBody } from "@/components/reading/PostBody";
import { PostReadingShell } from "@/components/reading/PostReadingShell";
import { PostComments } from "@/components/reading/PostComments";
import { PostShareBar } from "@/components/reading/PostShareBar";
import { PostTableOfContents } from "@/components/reading/PostTableOfContents";
import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { ReadingSidebarAskQuestion } from "@/components/reading/ReadingSidebarAskQuestion";
import { ReadingSidebarNewsletter } from "@/components/reading/ReadingSidebarNewsletter";
import { PostAdjacentNav, ReadingSidebar } from "@/components/reading/ReadingSidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";

type Props = { params: Promise<{ locale: string; slug: string }> };

/**
 * A post shown in a language other than the page's (no translation yet) is the same document as
 * the page in its own language, so search engines are pointed there instead.
 */
function canonicalLocale(post: Post, locale: string) {
  if (post.language === locale) return locale;
  return hasLocale(routing.locales, post.language) ? post.language : locale;
}

function description(post: Post) {
  return metaDescription(post.excerpt || bodyToPlain(post.content) || post.title);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getPost(slug, locale);
  if (!data) return {};
  const { post } = data;

  return pageMetadata({
    locale,
    path: `/posts/${post.slug}`,
    title: post.title,
    description: description(post),
    locales: post.languages,
    canonicalLocale: canonicalLocale(post, locale),
    image: post.coverImage || undefined,
    article: {
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      authors: post.authors.length ? post.authors : undefined,
      section: post.category || undefined,
      tags: post.tags.length ? post.tags : undefined,
    },
  });
}

function Watermark() {
  return (
    <svg className="pointer-events-none absolute end-0 top-0 hidden h-[420px] w-[380px] md:block rtl:-scale-x-100" viewBox="0 0 380 420" aria-hidden>
      <path d="M380 0 L380 300 L150 0 Z" fill="#f7f7f7" />
      <path d="M380 150 L380 420 L210 290 Z" fill="#f9f9f9" />
    </svg>
  );
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await getPost(slug, locale);
  if (!data) notFound();
  const { post, previous, next } = data;
  const profile = await getProfileSettings();
  const bylines = post.authors.length ? post.authors : profile.displayName ? [profile.displayName] : [];

  function authorAvatarSrc(author: string) {
    if (!profile.avatarUrl) return null;
    if (namesMatch(author, profile.displayName)) return profile.avatarUrl;
    if (bylines.length === 1) return profile.avatarUrl;
    return null;
  }

  const t = await getTranslations("reading");
  const tCommon = await getTranslations("breadcrumb");
  const tPosts = await getTranslations("posts");

  const body = parsePostBody(post.content, post.title);
  const sections = [
    ...(post.excerpt ? [{ id: ABSTRACT_ID, title: t("abstract") }] : []),
    ...body.map(({ id, title }) => ({ id, title: title ?? (id === INTRO_ID ? t("introduction") : t("fullText")) })),
  ];
  const latestQuestions = (
    await getApprovedQuestions(6).catch(() => [])
  ).map((item) => ({ id: item.id, title: item.title, answerCount: item.answerCount }));
  const date = formatDate(post.publishedAt, locale);
  const untranslated = post.language !== locale;
  // Text in another language keeps its own language tag and reading direction.
  const textProps = untranslated ? { lang: post.language, dir: post.language === "ar" ? ("rtl" as const) : ("ltr" as const) } : {};
  const url = localeUrl(canonicalLocale(post, locale), `/posts/${post.slug}`);

  return (
    <PageShell
      active="journals"
      subNavVariant="light"
      subNav={[
        { label: t("tabs.posts"), href: "/posts", active: true },
        { label: t("tabs.proceedings"), href: "/proceedings" },
        { label: t("tabs.books"), href: "/books" },
        { label: t("tabs.people"), href: "/people" },
      ]}
      breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: tPosts("heroTitle"), href: "/posts" }, { label: post.title }]}
      readingStickyTitle={post.title}
    >
      <JsonLd
        data={articleJsonLd({
          url,
          title: post.title,
          description: description(post),
          language: post.language,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          authors: bylines,
          category: post.category,
          tags: post.tags,
          image: post.coverImage,
          wordCount: bodyToPlain(post.content).split(" ").filter(Boolean).length,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: tPosts("heroTitle"), url: localeUrl(locale, "/posts") },
          { name: post.title, url: localeUrl(locale, `/posts/${post.slug}`) },
        ])}
      />
      <ReadingProgressBar />
      <div className="relative overflow-x-clip">
        <Watermark />
        <div className="relative mx-auto grid w-full max-w-[1200px] gap-x-9 gap-y-6 px-4 sm:px-6 md:grid-cols-[214px_minmax(0,1fr)] md:gap-y-8">
          <ReadingSidebar
            title={post.title}
            year={yearOf(post.publishedAt)}
            previous={previous}
            next={next}
            sections={sections}
            latestQuestions={latestQuestions}
          />

          <article className="min-w-0 w-full">
            <PostReadingShell>
            <PostTableOfContents sections={sections} />
            <div className="mb-6 overflow-hidden border border-rule bg-panel md:hidden">
              <ReadingSidebarAskQuestion latest={latestQuestions} />
              <ReadingSidebarNewsletter />
            </div>
            <PostAdjacentNav previous={previous} next={next} />
            <header className="mb-6 border-b border-rule pb-4">
              {post.category && <p className="text-[12px] font-semibold tracking-wide text-accent uppercase">{post.category}</p>}
              <h1 {...textProps} className="mt-1.5 text-[24px] leading-[1.25] font-semibold text-text sm:text-[30px] sm:leading-[1.2]">{post.title}</h1>
              {bylines.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] text-muted">
                  {bylines.map((author) => (
                    <li key={author} className="flex items-center gap-1.5">
                      <AuthorAvatar name={author} src={authorAvatarSrc(author)} className="size-[18px]" />
                      {author}
                    </li>
                  ))}
                </ul>
              )}
              {date && (
                <p className="mt-3 text-[13px] italic text-muted">
                  {t.rich("published", { date: () => <time dateTime={post.publishedAt ?? undefined}>{date}</time> })}
                </p>
              )}
              {untranslated && <p className="mt-4 border-s-4 border-rule bg-panel px-4 py-2.5 text-[13px] text-muted">{t("originalLanguage")}</p>}
              {post.coverImage && (
                <figure className="mt-6">
                  <img src={post.coverImage} alt="" className="max-h-[420px] w-full object-cover" />
                  {post.coverCaption && <figcaption className="mt-2 text-[13px] italic text-muted">{post.coverCaption}</figcaption>}
                </figure>
              )}
            </header>

            <div {...textProps}>
              <PostBody
                excerpt={post.excerpt}
                sections={body}
                labels={{ abstract: t("abstract"), introduction: t("introduction"), fullText: t("fullText"), embed: t("embed") }}
              />
            </div>

            <div className="mt-10 space-y-8 border-t border-rule pt-6">
              <PostShareBar url={url} title={post.title} />
              {post.tags.length > 0 && (
                <footer>
                  <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">{t("keywords")}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li key={tag} className="bg-panel px-2.5 py-1 text-[13px] text-text">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </footer>
              )}
            </div>

            <PostComments slug={post.slug} postId={post.id} editorial={{ name: profile.displayName, avatarUrl: profile.avatarUrl || undefined }} />
            </PostReadingShell>
          </article>
        </div>
      </div>
    </PageShell>
  );
}
