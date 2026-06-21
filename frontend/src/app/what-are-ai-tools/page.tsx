"use client";

import { QuestionPageTemplate } from "@components/common/question-page-template";
import { questionPages } from "@/data/question-pages";

export default function WhatAreAiTools() {
  const config = questionPages.find((p) => p.slug === "what-are-ai-tools")!;
  return <QuestionPageTemplate config={config} />;
}
