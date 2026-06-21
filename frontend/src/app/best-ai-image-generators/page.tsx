"use client";

import { BestPageTemplate } from "@components/common/best-page-template";
import { bestPages } from "@/data/best-pages";

export default function BestAiImageGeneratorsPage() {
  const config = bestPages.find((p) => p.slug === "best-ai-image-generators")!;
  return <BestPageTemplate config={config} />;
}
