import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Submit an AI Tool",
  description: "Submit your AI tool to be featured in our directory.",
  path: "/submit-tool",
});

export default function SubmitToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
