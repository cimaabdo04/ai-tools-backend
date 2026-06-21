"use client";

import Link from "next/link";
import { cn, getCategoryName } from "@lib/utils";
import { ROUTES } from "@lib/constants";
import { Card, CardContent } from "@components/ui/card";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@components/ui/category-icon";
import { useTranslations } from "next-intl";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  toolCount: number;
}

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const t = useTranslations();

  return (
    <Link href={`${ROUTES.CATEGORIES}/${category.slug}`}>
      <Card
        className={cn(
          "group transition-all hover:shadow-md hover:border-primary/50 h-full",
          className
        )}
      >
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <CategoryIcon icon={category.icon} color={category.color} size="lg" />
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {getCategoryName(category)}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
              {category.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            {category.toolCount} {t("categories.tools")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
