"use client";

import { BestPageTemplate } from "@components/common/best-page-template";
import { bestPages } from "@/data/best-pages";

export default function BestAiToolsPage() {
  const config = bestPages.find((p) => p.slug === "best-ai-tools")!;
  return <BestPageTemplate config={config} />;
}
