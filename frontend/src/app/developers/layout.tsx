import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "API Documentation",
  description: "Integrate AI Tools Directory data into your applications with our API.",
  path: "/developers",
});

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
