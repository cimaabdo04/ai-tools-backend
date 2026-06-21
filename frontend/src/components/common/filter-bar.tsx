"use client";

import { useFilterStore } from "@stores/filter-store";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Select } from "@components/ui/select";
import { PRICING_MODELS, SORT_OPTIONS } from "@lib/constants";
import { X, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@lib/utils";

interface FilterBarProps {
  categories?: { id: string; name: string }[];
  className?: string;
}

export function FilterBar({ categories = [], className }: FilterBarProps) {
  const t = useTranslations();
  const {
    search,
    categoryId,
    pricing,
    sort,
    minRating,
    setSearch,
    setCategoryId,
    togglePricing,
    setSort,
    setMinRating,
    reset,
  } = useFilterStore();

  const hasFilters = search || categoryId || pricing.length > 0 || minRating > 0 || sort !== "newest";

  const activeFilterCount = [
    search,
    categoryId,
    ...pricing,
    minRating > 0 ? "rating" : null,
    sort !== "newest" ? "sort" : null,
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("filters.title")}</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select
            options={[
              { value: "", label: t("filters.allCategories") },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="w-44"
          />

          <Select
            options={SORT_OPTIONS.map((opt) => ({
              value: opt.value,
              label: t(`sort.${opt.value}`),
            }))}
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="w-36"
          />

          <Select
            options={[
              { value: "0", label: t("filters.anyRating") },
              { value: "3", label: "3+" },
              { value: "4", label: "4+" },
              { value: "4.5", label: "4.5+" },
            ]}
            value={String(minRating)}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-28"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
            <X className="h-3 w-3" />
            {t("filters.clear")}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRICING_MODELS.map((model) => {
          const isActive = pricing.includes(model);
          return (
            <button
              key={model}
              onClick={() => togglePricing(model)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {t(`pricing.${model}`)}
              {isActive && <X className="h-3 w-3 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
