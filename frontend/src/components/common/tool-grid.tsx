"use client";

import { cn } from "@lib/utils";
import { ToolCard } from "@components/common/tool-card";
import { EmptyState } from "@components/common/empty-state";
import { LoadingSpinner } from "@components/common/loading-spinner";
import { ErrorState } from "@components/common/error-state";
import { useTranslations } from "next-intl";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl?: string;
  logoUrl?: string;
  pricingTypes?: string;
  pricingMin?: number;
  averageRating?: number;
  reviewCount?: number;
  categories?: { id: string; name: string; slug: string }[];
  tags?: { tag: { id: string; name: string; slug: string } }[];
  createdAt: string;
  country?: string;
  version?: string;
  models?: string;
}

interface ToolGridProps {
  tools?: Tool[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  variant?: "default" | "compact" | "featured";
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function ToolGrid({
  tools,
  isLoading,
  isError,
  error,
  onRetry,
  variant = "default",
  columns = 3,
  className,
}: ToolGridProps) {
  const t = useTranslations();

  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t("errors.loadingTools")}
        message={error?.message}
        onRetry={onRetry}
      />
    );
  }

  if (!tools || tools.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} variant={variant} />
      ))}
    </div>
  );
}
