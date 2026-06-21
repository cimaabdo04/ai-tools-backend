"use client";

import { UseCasePageTemplate } from "@components/common/use-case-page-template";
import { useCasePages } from "@/data/use-case-pages";

export default function ToolsForDesigners() {
  const config = useCasePages.find((p) => p.slug === "tools-for-designers")!;
  return <UseCasePageTemplate config={config} />;
}
