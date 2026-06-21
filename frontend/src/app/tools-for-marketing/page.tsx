"use client";

import { UseCasePageTemplate } from "@components/common/use-case-page-template";
import { useCasePages } from "@/data/use-case-pages";

export default function ToolsForMarketing() {
  const config = useCasePages.find((p) => p.slug === "tools-for-marketing")!;
  return <UseCasePageTemplate config={config} />;
}
