import type { Metadata } from "next";
import { ManagedSitePage, managedPageMetadata } from "@/components/site/ManagedSitePage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return managedPageMetadata("privacy", params);
}

export default function PrivacyPage({ params }: Props) {
  return <ManagedSitePage slug="privacy" params={params} />;
}
