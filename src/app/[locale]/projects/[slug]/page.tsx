import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProjectBySlug } from "@/lib/catalog";
import { breadcrumbJsonLd, localeUrl, metaDescription, pageMetadata } from "@/lib/seo";
import { bodyToPlain } from "@/lib/post-sections";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectDocument } from "@/components/projects/ProjectDocument";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const plain = bodyToPlain(project.contextHtml || project.reportHtml);
  return pageMetadata({
    locale,
    path: `/projects/${project.slug}`,
    title: project.title,
    description: metaDescription(plain || project.title),
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations("projects");
  const tProceedings = await getTranslations("proceedings");
  const tCommon = await getTranslations("breadcrumb");

  return (
    <PageShell
      active="proceedings"
      subNav={[
        { label: tProceedings("tabs.main"), href: "/proceedings", active: false },
        { label: tProceedings("tabs.conferences"), href: "/proceedings" },
        { label: tProceedings("tabs.icps"), href: "/proceedings" },
      ]}
      breadcrumbs={[
        { label: tCommon("home"), href: "/" },
        { label: tProceedings("heroTitle"), href: "/proceedings" },
        { label: project.title },
      ]}
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: tProceedings("heroTitle"), url: localeUrl(locale, "/proceedings") },
          { name: project.title, url: localeUrl(locale, `/projects/${project.slug}`) },
        ])}
      />
      <article className="mx-auto max-w-[800px] px-6 py-8">
        <header className="mb-8 border-b border-rule pb-5">
          <p className="text-[12px] font-semibold tracking-wide text-accent uppercase">
            {project.acronym}
            {project.year ? ` · ${project.year}` : ""}
          </p>
          <h1 className="mt-2 text-[28px] leading-[1.2] font-semibold text-text">{project.title}</h1>
        </header>
        <ProjectDocument contextHtml={project.contextHtml} reportHtml={project.reportHtml} />
        <p className="mt-10">
          <Link href="/proceedings" className="text-[14px] text-link hover:underline">
            {t("backToList")}
          </Link>
        </p>
      </article>
    </PageShell>
  );
}