import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Author } from "@/lib/authors";
import { getProfileSettings } from "@/lib/profile";
import { pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { PeopleExplorer } from "@/components/people/PeopleExplorer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "people" });
  return pageMetadata({ locale, path: "/people", title: t("heroTitle"), description: t("metaDescription") });
}

export default async function PeoplePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("people");
  const tCommon = await getTranslations("breadcrumb");
  const profile = await getProfileSettings();
  const featured: Author | null = profile.displayName
    ? {
        id: "site-profile",
        name: profile.displayName,
        affiliation: profile.affiliation,
        publicationCount: 0,
        subjects: profile.subjects,
        avatarUrl: profile.avatarUrl || undefined,
        bio: profile.bio || undefined,
      }
    : null;

  return (
    <PageShell active="people" hero={{ title: t("heroTitle") }} breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle") }]}>
      <PeopleExplorer featured={featured} />
    </PageShell>
  );
}
