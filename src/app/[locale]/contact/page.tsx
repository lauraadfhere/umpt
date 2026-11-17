import type { Metadata } from "next";
import { ManagedSitePage, managedPageMetadata } from "@/components/site/ManagedSitePage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return managedPageMetadata("contact", params);
}

export default function ContactPage({ params }: Props) {
  return <ManagedSitePage slug="contact" params={params} />;
}
