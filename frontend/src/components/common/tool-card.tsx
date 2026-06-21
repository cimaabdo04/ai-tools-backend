"use client";

import Link from "next/link";
import { cn, truncate, formatRelativeDate, getCategoryName } from "@lib/utils";
import { ROUTES } from "@lib/constants";
import { Card, CardContent, CardFooter } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Rating } from "@components/ui/rating";
import { BookmarkButton } from "@components/common/bookmark-button";
import { CompareButton } from "@components/common/compare-button";
import Image from "next/image";
import { ExternalLink, Users, DollarSign, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { getFlagEmoji, getCountryName } from "@lib/countries";

interface ToolCardTool {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoDescription?: string;
  websiteUrl?: string;
  logoUrl?: string;
  pricingTypes?: string;
  pricingMin?: number;
  pricingMax?: number;
  averageRating?: number;
  reviewCount?: number;
  categories?: { id: string; name: string; slug: string; icon?: string; color?: string }[];
  tags?: { tag: { id: string; name: string; slug: string } }[];
  createdAt?: string;
  submittedAt?: string;
  country?: string;
  version?: string;
  models?: string;
}

interface ToolCardProps {
  tool: ToolCardTool;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

const pricingLabels: Record<string, string> = {
  free: "toolPricing.free",
  freemium: "toolPricing.freemium",
  paid: "toolPricing.paid",
  contact: "toolPricing.contact",
};

const pricingVariants: Record<string, "success" | "info" | "default" | "warning"> = {
  free: "success",
  freemium: "info",
  paid: "default",
  contact: "warning",
};

export function ToolCard({ tool, variant = "default", className }: ToolCardProps) {
  const t = useTranslations();

  if (variant === "compact") {
    return (
      <Link href={ROUTES.TOOL_DETAIL(tool.slug)}>
        <Card
          className={cn(
            "group transition-all hover:shadow-md hover:border-primary/50",
            className
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {tool.logoUrl ? (
                <Image src={tool.logoUrl} alt={tool.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {tool.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{tool.name}</p>
                <Rating value={tool.averageRating} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-md hover:border-primary/50",
        variant === "featured" && "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {tool.logoUrl ? (
              <Image src={tool.logoUrl} alt={tool.name} width={48} height={48} className="h-12 w-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {tool.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <Link
                href={ROUTES.TOOL_DETAIL(tool.slug)}
                className="font-semibold text-lg hover:text-primary transition-colors truncate block"
              >
                {tool.name}
              </Link>
              {tool.version && (
                <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                  {tool.version}
                </span>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <Rating value={tool.averageRating} size="sm" showValue />
                <span className="text-xs text-muted-foreground">
                  ({tool.reviewCount ?? 0})
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <BookmarkButton toolId={tool.id} />
            <CompareButton toolId={tool.id} toolName={tool.name} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {tool.seoDescription || truncate(tool.description, 120)}
        </p>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {(tool.categories ?? []).slice(0, 2).map((cat) => (
            <Link key={cat.slug} href={`${ROUTES.CATEGORIES}/${cat.slug}`}>
              <Badge
                className="text-xs border-0"
                style={{ backgroundColor: `${cat.color || "#6366f1"}1A`, color: cat.color || "#6366f1" }}
              >
                {getCategoryName(cat)}
              </Badge>
            </Link>
          ))}
          {(tool.categories?.length ?? 0) > 2 && (
            <span className="text-xs text-muted-foreground">
              +{(tool.categories?.length ?? 0) - 2}
            </span>
          )}
          {(() => {
            const pricing = (() => { try { return JSON.parse(tool.pricingTypes || '[]'); } catch { return []; } })();
            const p = pricing[0];
            return p ? (
              <Badge
                variant={pricingVariants[p?.toLowerCase() as keyof typeof pricingVariants] ?? "default"}
                className="text-xs"
              >
                {t(pricingLabels[p?.toLowerCase() ?? ""] ?? p)}
              </Badge>
            ) : null;
          })()}
          {(tool.tags ?? []).slice(0, 2).map((t) => (
            <Badge key={t.tag.id} variant="outline" className="text-xs">
              {t.tag.name}
            </Badge>
          ))}
          {(tool.tags?.length ?? 0) > 2 && (
            <span className="text-xs text-muted-foreground">
              +{(tool.tags?.length ?? 0) - 2}
            </span>
          )}
          {(() => {
            const models = (() => { try { return JSON.parse(tool.models || '[]'); } catch { return []; } })();
            return models.slice(0, 3).map((m: any, i: number) => (
              <Badge key={i} variant="outline" className="text-xs text-primary border-primary/30">
                {m.name || m}
              </Badge>
            ));
          })()}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {tool.country && (
              <span className="flex items-center gap-1" title={getCountryName(tool.country)}>
                <Globe className="h-3 w-3" />
                {getFlagEmoji(tool.country)} {getCountryName(tool.country)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {formatRelativeDate(tool.createdAt ?? tool.submittedAt ?? "")}
            </span>
          </div>
          <a
            href={tool.websiteUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            {t("toolCard.visit")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
