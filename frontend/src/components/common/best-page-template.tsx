"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Star, ExternalLink, ChevronLeft, ChevronRight, HelpCircle, Check } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Rating } from "@components/ui/rating";
import { useTools, useFeaturedTools } from "@hooks/use-tools";
import { useCategories } from "@hooks/use-categories";
import { ROUTES } from "@lib/constants";
import { formatDate, getCategoryName, cn } from "@lib/utils";
import type { BestPageConfig } from "@/data/best-pages";

function BestPageContent({ config }: { config: BestPageConfig }) {
  const tr = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ChevronDir = isRtl ? ChevronLeft : ChevronRight;

  useEffect(() => {
    document.title = config.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", config.description);
  }, [config.title, config.description]);

  const { data: allTools, isLoading } = useTools({
    perPage: 100,
    sort: config.sortBy ?? "rating",
  });

  const { data: categoriesData } = useCategories();

  let tools = allTools?.data ?? [];
  if (config.categorySlug) {
    const catSlug = config.categorySlug;
    tools = tools.filter((t) =>
      t.categories?.some((c) => c.slug === catSlug)
    );
  }

  tools = tools.slice(0, 10);

  const category = categoriesData?.categories?.find(
    (c) => c.slug === config.categorySlug
  );

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

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="container py-8"
      >
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {config.h1}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {config.intro}
          </p>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      <div className="container pb-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {tr("nav.home")}
          </Link>
          <ChevronDir className="h-3 w-3" />
          <span className="text-foreground font-medium">{config.title}</span>
        </nav>
      </div>

      {/* Tool List */}
      <div className="container pb-12">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg border bg-card animate-pulse" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">لا توجد أدوات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tools.map((tool, index) => {
              const pricingTypes = (() => {
                try {
                  return JSON.parse(tool.pricingTypes || "[]");
                } catch {
                  return [];
                }
              })();

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-md hover:border-primary/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Rank Number */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                href={ROUTES.TOOL_DETAIL(tool.slug)}
                                className="text-xl font-bold hover:text-primary transition-colors"
                              >
                                {tool.name}
                              </Link>
                              <p className="text-muted-foreground mt-1 leading-relaxed">
                                {tool.description}
                              </p>
                            </div>

                            {/* Rating Badge */}
                            {tool.averageRating != null && (
                              <div className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {tool.averageRating.toFixed(1)}
                              </div>
                            )}
                          </div>

                          {/* Features */}
                          {tool.features && tool.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {tool.features.slice(0, 4).map((f) => (
                                <span
                                  key={f}
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
                                >
                                  <Check className="h-3 w-3 text-green-500" />
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {/* Pricing */}
                            {pricingTypes.map((p: string) => (
                              <Badge key={p} variant="secondary" className="text-xs">
                                {p === "free" ? "مجاني" : p === "paid" ? "مدفوع" : p === "freemium" ? "مجاني ومدفوع" : p}
                              </Badge>
                            ))}

                            {/* Categories */}
                            {tool.categories?.slice(0, 2).map((cat) => (
                              <Link key={cat.id} href={ROUTES.CATEGORY_DETAIL(cat.slug)}>
                                <span
                                  className="inline-block text-xs px-2 py-0.5 rounded-md font-medium"
                                  style={{ backgroundColor: `${(cat as any).color || "#6366f1"}1A`, color: (cat as any).color || "#6366f1" }}
                                >
                                  {getCategoryName(cat)}
                                </span>
                              </Link>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-4">
                            <Button size="sm" asChild>
                              <Link href={ROUTES.TOOL_DETAIL(tool.slug)}>
                                عرض التفاصيل
                              </Link>
                            </Button>
                            {tool.websiteUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={tool.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                  زيارة الموقع
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      {config.faqs.length > 0 && (
        <div className="bg-muted/50 py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold mb-2">
              الأسئلة الشائعة عن {config.title}
            </h2>
            <p className="text-muted-foreground mb-8">
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
        </div>
      )}

      {/* Related Links */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="p-6 text-center">
              <p className="text-2xl mb-2">📂</p>
              <h3 className="font-semibold mb-1">تصفح التصنيفات</h3>
              <p className="text-sm text-muted-foreground mb-4">
                استكشف جميع تصنيفات أدوات الذكاء الاصطناعي
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.CATEGORIES}>جميع التصنيفات</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="p-6 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <h3 className="font-semibold mb-1">ابحث عن أداة</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ابحث في مئات الأدوات حسب احتياجك
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.TOOLS}>البحث في الأدوات</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="p-6 text-center">
              <p className="text-2xl mb-2">📝</p>
              <h3 className="font-semibold mb-1">المدونة</h3>
              <p className="text-sm text-muted-foreground mb-4">
                مقالات وشروحات عن أدوات الذكاء الاصطناعي
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.BLOG}>زيارة المدونة</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

interface BestPageTemplateProps {
  config: BestPageConfig;
}

export function BestPageTemplate({ config }: BestPageTemplateProps) {
  return <BestPageContent config={config} />;
}
