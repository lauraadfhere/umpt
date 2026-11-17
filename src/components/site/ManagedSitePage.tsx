import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { plainParagraphsToHtml, resolveSitePage } from "@/lib/public-pages";
import type { ManagedPageSlug } from "@/lib/site-pages";
import { breadcrumbJsonLd, localeUrl, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/site/ContactForm";
import { SiteRichContent } from "@/components/site/SiteRichContent";

type Props = { params: Promise<{ locale: string }> };

export async function managedPageMetadata(slug: ManagedPageSlug, params: Props["params"]): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  const page = await resolveSitePage(slug, {
    title: t(`${slug}.title`),
    bodyHtml: plainParagraphsToHtml(t(`${slug}.body`)),
    metaDescription: t(`${slug}.metaDescription`),
  });
  return pageMetadata({
    locale,
    path: `/${slug}`,
    title: page.seoTitle,
    description: page.seoDescription,
  });
}

export async function ManagedSitePage({ slug, params }: { slug: ManagedPageSlug; params: Props["params"] }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tCommon = await getTranslations("breadcrumb");
  const page = await resolveSitePage(slug, {
    title: t(`${slug}.title`),
    bodyHtml: plainParagraphsToHtml(t(`${slug}.body`)),
    metaDescription: t(`${slug}.metaDescription`),
  });
  const path = `/${slug}`;

  return (
    <PageShell hero={{ title: page.title }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: page.title }]}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon("home"), url: localeUrl(locale) },
          { name: page.title, url: localeUrl(locale, path) },
        ])}
      />
      <div className="relative mx-auto max-w-[1200px] overflow-hidden px-6 pb-12">
        <SiteRichContent html={page.contentHtml} />
        {slug === "contact" ? <ContactForm /> : null}
      </div>
    </PageShell>
  );
}
