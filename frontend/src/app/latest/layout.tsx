import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Latest AI Tools",
  description: "Discover the newest AI tools added to our directory.",
  path: "/latest",
});

export default function LatestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
