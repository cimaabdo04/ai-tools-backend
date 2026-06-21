import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "AI Tools",
  description: "Browse our comprehensive collection of AI tools. Find the perfect tool for your needs.",
  path: "/tools",
});

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
