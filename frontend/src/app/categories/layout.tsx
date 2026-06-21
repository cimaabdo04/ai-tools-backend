import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Categories",
  description: "Explore AI tools by category. Find tools for your specific needs.",
  path: "/categories",
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
