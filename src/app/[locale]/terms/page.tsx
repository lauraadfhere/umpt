import type { Metadata } from "next";
import { ManagedSitePage, managedPageMetadata } from "@/components/site/ManagedSitePage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return managedPageMetadata("terms", params);
}

export default function TermsPage({ params }: Props) {
  return <ManagedSitePage slug="terms" params={params} />;
}
