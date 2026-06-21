import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Sponsored AI Tools",
  description: "Browse sponsored AI tools featured on our directory.",
  path: "/sponsored",
});

export default function SponsoredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
