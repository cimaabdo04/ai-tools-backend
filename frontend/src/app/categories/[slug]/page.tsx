"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ChevronRight, Tag } from "lucide-react";
import { Button } from "@components/ui/button";
import { ToolGrid } from "@components/common/tool-grid";
import { useCategory } from "@hooks/use-categories";
import { useTools } from "@hooks/use-tools";
import { ROUTES } from "@lib/constants";
import { cn, getCategoryName } from "@lib/utils";
import { getCategoryConfig } from "@lib/categories-config";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = use(params);
  const t = useTranslations();
  const isRtl = locale === "ar";

  const { data: catData, isLoading: catLoading, isError: catError } = useCategory(slug);
  const category = catData?.category;

  const { data: toolsData, isLoading: toolsLoading, isError: toolsError } = useTools({
    categoryId: slug,
    perPage: 100,
  });
  const tools = toolsData?.data ?? [];

  const config = getCategoryConfig(slug);
  const subcategories = config.subcategories;

  if (catLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (catError || !category) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">{t("errors.notFound")}</h2>
        <p className="text-muted-foreground mt-2">{t("categories.noTools")}</p>
        <Button asChild className="mt-6">
          <Link href={ROUTES.CATEGORIES}>{t("common.back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href={ROUTES.CATEGORIES} className="hover:text-foreground transition-colors">
          {t("categories.title")}
        </Link>
        <ChevronRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span className="text-foreground font-medium">{getCategoryName(category)}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-8"
      >
        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shrink-0", config.gradientClass)}>
          <span className="text-3xl">{config.emoji}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getCategoryName(category)}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {category.toolCount} {t("categories.tools")}
          </p>
        </div>
      </motion.div>

      {subcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            {t("categories.subcategories")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub, i) => {
              const commonClasses = cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                "border border-[#8b5cf6]/30 bg-[#13131a] text-[#a1a1aa]",
                sub.tagSlug ? "hover:border-[#8b5cf6] hover:text-[#f4f4f5] transition-all" : ""
              );
              return sub.tagSlug ? (
                <Link
                  key={i}
                  href={`${ROUTES.CATEGORY_DETAIL(slug)}/${sub.tagSlug}`}
                  className={commonClasses}
                >
                  <span className={cn("h-2 w-2 rounded-full", config.dotClass)} />
                  {sub.name}
                </Link>
              ) : (
                <span key={i} className={cn(commonClasses, "opacity-70")}>
                  <span className={cn("h-2 w-2 rounded-full", config.dotClass)} />
                  {sub.name}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      <ToolGrid tools={tools} isLoading={toolsLoading} isError={toolsError} />
    </div>
  );
}
