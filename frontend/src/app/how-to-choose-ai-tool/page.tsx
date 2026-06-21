"use client";

import { QuestionPageTemplate } from "@components/common/question-page-template";
import { questionPages } from "@/data/question-pages";

export default function HowToChooseAiTool() {
  const config = questionPages.find((p) => p.slug === "how-to-choose-ai-tool")!;
  return <QuestionPageTemplate config={config} />;
}
