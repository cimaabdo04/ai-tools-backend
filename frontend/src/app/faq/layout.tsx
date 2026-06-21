import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "FAQ",
  description: "Frequently asked questions about AI Tools Directory.",
  path: "/faq",
});

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
