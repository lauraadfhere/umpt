import { isAdmin } from "@/lib/admin-auth";
import { getLogoSettings } from "@/lib/logo";
import type { NavKey } from "@/lib/nav";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SubNav, type SubNavItem, type SubNavVariant } from "@/components/layout/SubNav";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { getHeroContextSettings } from "@/lib/hero-context";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FeedbackTab } from "@/components/layout/FeedbackTab";
import { ScrollControls } from "@/components/layout/ScrollControls";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SiteFooter } from "@/components/layout/SiteFooter";

type Props = {
  active?: NavKey;
  subNav?: SubNavItem[];
  subNavVariant?: SubNavVariant;
  /** Reading pages carry their own title, so they leave the hero out. */
  hero?: React.ComponentProps<typeof HeroBanner>;
  breadcrumbs: React.ComponentProps<typeof Breadcrumbs>["items"];
  /** Drop the bottom padding when the last section is a full-width band that should meet the footer. */
  flush?: boolean;
  /** When false, the public hero bar keeps the default gray pattern (CMS preview uses this). */
  applyHeroContext?: boolean;
  /** Replaces the default SubNav row (e.g. dashboard grouped nav). */
  subNavSlot?: React.ReactNode;
  children: React.ReactNode;
};

export async function PageShell({
  active,
  subNav,
  subNavVariant,
  hero,
  breadcrumbs,
  flush = false,
  applyHeroContext = true,
  subNavSlot,
  children,
}: Props) {
  const [signedIn, logo, heroContext] = await Promise.all([
    isAdmin(),
    getLogoSettings(),
    hero && applyHeroContext ? getHeroContextSettings() : Promise.resolve(null),
  ]);

  return (
    <>
      <SiteHeader active={active} signedIn={signedIn} logo={logo} hideMobileSectionBar={Boolean(subNav || subNavSlot)} />
      {subNavSlot ?? (subNav ? <SubNav items={subNav} variant={subNavVariant} sticky /> : null)}
      {hero && <HeroBanner {...hero} context={heroContext} />}
      <Breadcrumbs items={breadcrumbs} />
      <main className={`flex-1 ${flush ? "" : "pb-12"}`}>{children}</main>
      <SiteFooter logo={logo} />
      <FeedbackTab />
      <ScrollControls />
      <CookieConsent />
    </>
  );
}
