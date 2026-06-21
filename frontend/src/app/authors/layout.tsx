import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Author Profile",
  description: "View AI tool author profiles and their submitted tools.",
  path: "/authors",
});

export default function AuthorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
