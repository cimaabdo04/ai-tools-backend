"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { X, Plus, BarChart3, ExternalLink, Star, Check, Minus, Globe } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Rating } from "@components/ui/rating";
import { Input } from "@components/ui/input";
import { useLocalStorage } from "@hooks/use-local-storage";
import { useTools, useSearchTools } from "@hooks/use-tools";
import { useDebounce } from "@hooks/use-debounce";
import { ROUTES } from "@lib/constants";
import { cn, getCategoryName } from "@lib/utils";

interface CompareTool {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl?: string;
  logoUrl?: string;
  pricingTypes?: string | string[];
  pricingMin?: number;
  averageRating?: number;
  reviewCount?: number;
  categories?: { id: string; name: string; slug: string }[];
  features: string[];
  useCases?: string[];
  platforms: string[];
}

export default function ComparePage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [compareIds, setCompareIds] = useLocalStorage<string[]>("compare-tools", []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: allData } = useTools({ perPage: 100 });
  const allTools: CompareTool[] = (allData?.data ?? []) as any;

  const { data: searchData } = useSearchTools(debouncedSearch, debouncedSearch.length > 0);
  const searchResults = (searchData?.tools ?? []).filter((tool: any) => !compareIds.includes(tool.id));

  const compareTools = compareIds
    .map((id) => allTools.find((tool) => tool.id === id))
    .filter(Boolean) as CompareTool[];

  const removeTool = (id: string) => {
    setCompareIds((prev) => prev.filter((i) => i !== id));
  };

  const addTool = (id: string) => {
    if (compareIds.length < 5) {
      setCompareIds((prev) => [...prev, id]);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const clearAll = () => setCompareIds([]);

  const getPricingTypes = (tool: CompareTool): string[] => {
    if (Array.isArray(tool.pricingTypes)) return tool.pricingTypes;
    try { return JSON.parse(tool.pricingTypes || "[]"); } catch { return []; }
  };

  const pricingLabels: Record<string, string> = {
    free: "مجاني", freemium: "مجاني ومدفوع", paid: "مدفوع", contact: "تواصل",
  };

  if (compareIds.length === 0) {
    return (
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {t("compare.title")}
          </h1>
        </motion.div>

        <div className="rounded-xl border-2 border-dashed p-20 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">{t("compare.empty")}</h2>
          <p className="text-muted-foreground mb-6">
            أضف حتى 5 أدوات لمقارنة المميزات جنباً إلى جنب.
          </p>
          <div className="max-w-sm mx-auto space-y-4">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                placeholder={t("search.placeholder")}
              />
            </div>
            {searchQuery && searchResults.length > 0 && (
              <div className="rounded-lg border max-h-48 overflow-y-auto">
                {searchResults.slice(0, 10).map((tool: any) => (
                  <button
                    key={tool.id}
                    onClick={() => addTool(tool.id)}
                    className="w-full px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {tool.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="font-medium truncate">{tool.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" className="mt-4" asChild>
            <Link href={ROUTES.TOOLS}>{t("compare.browseTools")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const rows = [
    {
      key: "description",
      label: "الوصف",
      render: (tool: CompareTool) => (
        <span className="text-muted-foreground text-sm leading-relaxed block max-w-[250px]">
          {tool.description?.length > 120 ? tool.description.slice(0, 120) + "..." : tool.description}
        </span>
      ),
    },
    {
      key: "pricing",
      label: "التسعير",
      render: (tool: CompareTool) => (
        <div className="flex flex-wrap gap-1">
          {getPricingTypes(tool).map((p) => (
            <Badge key={p} variant="secondary" className="text-xs">
              {pricingLabels[p] || p}
            </Badge>
          ))}
          {tool.pricingMin != null && (
            <span className="text-xs text-muted-foreground w-full mt-1">
              {tool.pricingMin > 0 ? `يبدأ من $${tool.pricingMin}` : "مجاني"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "التقييم",
      render: (tool: CompareTool) => (
        <div className="flex items-center gap-2">
          <Rating value={tool.averageRating} size="sm" />
          <span className="text-sm font-medium">({tool.reviewCount ?? 0})</span>
        </div>
      ),
    },
    {
      key: "categories",
      label: "التصنيفات",
      render: (tool: CompareTool) => (
        <div className="flex flex-wrap gap-1">
          {tool.categories?.length ? tool.categories.map((cat) => (
            <Badge key={cat.id} variant="outline" className="text-xs">
              {getCategoryName(cat)}
            </Badge>
          )) : <span className="text-xs text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      key: "features",
      label: "المميزات",
      render: (tool: CompareTool) => (
        <ul className="space-y-1.5">
          {tool.features?.slice(0, 5).map((f) => (
            <li key={f} className="flex items-start gap-1.5 text-xs">
              <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          )) || <span className="text-xs text-muted-foreground">-</span>}
          {(tool.features?.length ?? 0) > 5 && (
            <li className="text-xs text-muted-foreground">+{tool.features.length - 5} أخرى</li>
          )}
        </ul>
      ),
    },
    {
      key: "useCases",
      label: "الاستخدامات",
      render: (tool: CompareTool) => (
        <div className="flex flex-wrap gap-1">
          {tool.useCases?.length ? tool.useCases.slice(0, 4).map((uc) => (
            <Badge key={uc} variant="secondary" className="text-xs">
              {uc}
            </Badge>
          )) : <span className="text-xs text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      key: "platforms",
      label: "المنصات",
      render: (tool: CompareTool) => (
        <div className="flex flex-wrap gap-1">
          {tool.platforms?.length ? tool.platforms.map((p) => (
            <Badge key={p} variant="outline" className="text-xs gap-1">
              <Globe className="h-3 w-3" /> {p}
            </Badge>
          )) : <span className="text-xs text-muted-foreground">-</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          {t("compare.title")}
        </h1>
        <Button variant="outline" size="sm" onClick={clearAll}>
          {t("compare.clear")}
        </Button>
      </motion.div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="w-40 p-3 text-sm font-medium text-muted-foreground text-start" />
              {compareTools.map((tool) => (
                <th key={tool.id} className="p-3 min-w-[200px] align-top">
                  <div className="relative rounded-lg border bg-card p-4">
                    <button
                      onClick={() => removeTool(tool.id)}
                      className="absolute top-2 end-2 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Link
                      href={ROUTES.TOOL_DETAIL(tool.slug)}
                      className="font-semibold text-base hover:text-primary transition-colors block truncate pe-6"
                    >
                      {tool.name}
                    </Link>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1" asChild>
                      <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        زيارة
                      </a>
                    </Button>
                  </div>
                </th>
              ))}
              {compareIds.length < 5 && (
                <th className="p-3 min-w-[200px] align-top">
                  <div className="relative">
                    {showSearch ? (
                      <div className="space-y-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ابحث عن أداة..."
                          className="w-full"
                          autoFocus
                        />
                        {searchResults.length > 0 && (
                          <div className="rounded-lg border max-h-40 overflow-y-auto">
                            {searchResults.slice(0, 10).map((tool: any) => (
                              <button
                                key={tool.id}
                                onClick={() => addTool(tool.id)}
                                className="w-full px-3 py-2 text-sm hover:bg-accent transition-colors truncate text-start"
                              >
                                {tool.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-full min-h-[100px] rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-sm">إضافة</span>
                      </button>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b">
                <td className="p-3 text-sm font-medium text-muted-foreground">{row.label}</td>
                {compareTools.map((tool) => (
                  <td key={tool.id} className="p-3">
                    {row.render(tool)}
                  </td>
                ))}
                {compareIds.length < 5 && <td className="p-3" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
