import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Terms of Service",
  description: "Read the AI Tools Directory terms of service.",
  path: "/terms",
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
