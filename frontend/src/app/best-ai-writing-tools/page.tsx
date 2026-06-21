"use client";

import { BestPageTemplate } from "@components/common/best-page-template";
import { bestPages } from "@/data/best-pages";

export default function BestAiWritingToolsPage() {
  const config = bestPages.find((p) => p.slug === "best-ai-writing-tools")!;
  return <BestPageTemplate config={config} />;
}
