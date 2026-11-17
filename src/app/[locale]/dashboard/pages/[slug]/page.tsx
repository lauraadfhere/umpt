import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getManagedPages, MANAGED_PAGES, type ManagedPageSlug } from "@/lib/site-pages";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { PageForm } from "@/components/admin/PageForm";

type Props = { params: Promise<{ locale: string; slug: string }> };

const SLUGS = new Set(MANAGED_PAGES.map((page) => page.slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pages" });
  const known = MANAGED_PAGES.find((page) => page.slug === slug);
  return { title: known ? t("editNamed", { title: known.title }) : t("edit"), robots: { index: false } };
}

export default async function EditSitePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);
  if (!SLUGS.has(slug as ManagedPageSlug)) notFound();

  const t = await getTranslations("dashboard.pages");
  const pages = await getManagedPages();
  const page = pages.find((item) => item.slug === slug);
  if (!page) notFound();

  return (
    <DashboardShell active="pages" title={t("editNamed", { title: page.title })}>
      <PageForm page={page} />
    </DashboardShell>
  );
}
