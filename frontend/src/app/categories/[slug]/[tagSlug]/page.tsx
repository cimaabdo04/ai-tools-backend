"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Tag as TagIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { ToolGrid } from "@components/common/tool-grid";
import { useCategory } from "@hooks/use-categories";
import { useTools } from "@hooks/use-tools";
import { api } from "@lib/api";
import { ROUTES, ITEMS_PER_PAGE, API_ENDPOINTS } from "@lib/constants";
import { cn, getCategoryName } from "@lib/utils";

interface TagData {
  id: string;
  name: string;
  slug: string;
  category: { id: string; name: string; slug: string };
}

export default function TagDetailPage({
  params,
}: {
  params: Promise<{ slug: string; tagSlug: string; locale: string }>;
}) {
  const { slug, tagSlug, locale } = use(params);
  const t = useTranslations();
  const isRtl = locale === "ar";

  const { data: catData, isLoading: catLoading } = useCategory(slug);
  const category = catData?.category;

  const { data: tagData, isLoading: tagLoading } = useQuery({
    queryKey: ["tag", tagSlug],
    queryFn: async () => {
      const res = await api.get<{ data: TagData }>(API_ENDPOINTS.TAGS.DETAIL(tagSlug));
      return { tag: res.data };
    },
    enabled: !!tagSlug,
  });
  const tag = tagData?.tag;

  const { data: toolsData, isLoading: toolsLoading, isError: toolsError } = useTools({
    categoryId: slug,
    tags: tagSlug,
    perPage: ITEMS_PER_PAGE,
  });
  const tools = toolsData?.data ?? [];

  const isLoading = catLoading || tagLoading;

  if (isLoading) {
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

  if (!tag) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">{t("errors.notFound")}</h2>
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
        <Link
          href={ROUTES.CATEGORY_DETAIL(slug)}
          className="hover:text-foreground transition-colors"
        >
          {category ? getCategoryName(category) : slug}
        </Link>
        <ChevronRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span className="text-foreground font-medium">{tag.name}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-8"
      >
        <div className="h-16 w-16 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center shrink-0">
          <TagIcon className="h-8 w-8 text-[#8b5cf6]" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium",
              "bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/30"
            )}>
              {tag.category?.name || ""}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {tools.length} {t("categories.tools")}
          </p>
        </div>
      </motion.div>

      <ToolGrid tools={tools} isLoading={toolsLoading} isError={toolsError} />
    </div>
  );
}
