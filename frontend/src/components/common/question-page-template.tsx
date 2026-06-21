"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle, Check, ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { ROUTES } from "@lib/constants";
import type { QuestionPageConfig } from "@/data/question-pages";

function QuestionPageContent({ config }: { config: QuestionPageConfig }) {
  const tr = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ChevronDir = isRtl ? ChevronLeft : ChevronRight;

  useEffect(() => {
    document.title = config.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", config.description);
  }, [config.title, config.description]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="container py-8"
      >
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              {tr("nav.home")}
            </Link>
            <ChevronDir className="h-3 w-3" />
            <span className="text-foreground font-medium">{config.title}</span>
          </nav>

          {/* Hero */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {config.h1}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {config.intro}
          </p>

          {/* Content Sections */}
          <div className="space-y-10">
            {config.contentSections.map((section, i) => (
              <motion.div
                key={section.heading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h2 className="text-xl font-bold mb-3">{section.heading}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {section.body}
                </p>
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2">
                    {section.bulletPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>

          {/* Related Links */}
          {config.relatedLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold mb-4">مواضيع ذات صلة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {config.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:shadow-md hover:border-primary/50 transition-all text-sm font-medium"
                  >
                    <ArrowLeft className="h-4 w-4 text-primary shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {config.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold mb-2">
                الأسئلة الشائعة
              </h2>
              <p className="text-muted-foreground mb-6">
                إجابات مباشرة لأكثر الأسئلة شيوعاً
              </p>
              <div className="space-y-3">
                {config.faqs.map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-lg border bg-card overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium hover:text-primary transition-colors">
                      <span>{faq.q}</span>
                      <HelpCircle className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0 mr-2" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

interface QuestionPageTemplateProps {
  config: QuestionPageConfig;
}

export function QuestionPageTemplate({ config }: QuestionPageTemplateProps) {
  return <QuestionPageContent config={config} />;
}
