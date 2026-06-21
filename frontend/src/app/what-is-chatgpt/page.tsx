"use client";

import { QuestionPageTemplate } from "@components/common/question-page-template";
import { questionPages } from "@/data/question-pages";

export default function WhatIsChatGpt() {
  const config = questionPages.find((p) => p.slug === "what-is-chatgpt")!;
  return <QuestionPageTemplate config={config} />;
}
