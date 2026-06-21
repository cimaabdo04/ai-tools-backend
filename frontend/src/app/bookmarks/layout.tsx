import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Bookmarks",
  description: "View your bookmarked AI tools.",
  path: "/bookmarks",
});

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
