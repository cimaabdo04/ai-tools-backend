"use client";

import { UseCasePageTemplate } from "@components/common/use-case-page-template";
import { useCasePages } from "@/data/use-case-pages";

export default function ToolsForContentCreation() {
  const config = useCasePages.find((p) => p.slug === "tools-for-content-creation")!;
  return <UseCasePageTemplate config={config} />;
}
