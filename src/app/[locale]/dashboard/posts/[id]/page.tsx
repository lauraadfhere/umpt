import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminPostById, getCategories } from "@/lib/admin-posts";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { PostForm } from "@/components/admin/PostForm";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.posts" });
  const post = await getAdminPostById(id).catch(() => null);
  return { title: post ? t("editNamed", { title: post.title }) : t("edit"), robots: { index: false } };
}

export default async function EditPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  const t = await getTranslations("dashboard.posts");
  const [post, categories] = await Promise.all([getAdminPostById(id), getCategories()]);
  if (!post) notFound();

  return (
    <DashboardShell active="posts" title={t("editNamed", { title: post.title })}>
      <PostForm
        mode="edit"
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          locale: post.locale || "en",
          status: post.status,
          category: post.category,
          publishedAt: post.publishedAt,
          coverImage: post.coverImage || null,
          coverCaption: post.coverCaption,
          authors: post.authors,
          tags: post.tags,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          translations: post.translations,
        }}
      />
    </DashboardShell>
  );
}
