"use client";

import { UseCasePageTemplate } from "@components/common/use-case-page-template";
import { useCasePages } from "@/data/use-case-pages";

export default function ToolsForDevelopers() {
  const config = useCasePages.find((p) => p.slug === "tools-for-developers")!;
  return <UseCasePageTemplate config={config} />;
}
