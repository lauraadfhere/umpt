import { getTranslations } from "next-intl/server";
import { DASHBOARD_TABS, type DashboardTab } from "@/lib/dashboard-nav";
import { PageShell } from "@/components/layout/PageShell";

export async function DashboardShell({
  active,
  title,
  children,
}: {
  active: DashboardTab;
  title?: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("breadcrumb");
  const heading = title ?? t("heroTitle");

  return (
    <PageShell
      subNav={DASHBOARD_TABS.map((tab) => ({
        label: t(`tabs.${tab.key}`),
        href: tab.href,
        active: tab.key === active,
      }))}
      hero={{ title: heading }}
      breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("heroTitle"), href: "/dashboard" }, ...(title && title !== t("heroTitle") ? [{ label: title }] : [])]}
    >
      <div className="mx-auto max-w-[1200px] px-6">{children}</div>
    </PageShell>
  );
}
