import type { Metadata } from "next";
import { ManagedSitePage, managedPageMetadata } from "@/components/site/ManagedSitePage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return managedPageMetadata("about", params);
}

export default function AboutPage({ params }: Props) {
  return <ManagedSitePage slug="about" params={params} />;
}
