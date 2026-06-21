import { generateMetadata } from "@lib/seo";
import type { Metadata } from "next";

interface SeoHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  tags?: string[];
  noIndex?: boolean;
}

export function seoMetadata(props: SeoHeadProps): Metadata {
  return generateMetadata(props);
}
