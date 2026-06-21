"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid3X3, X, LayoutGrid, Mail, Send, Check, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { ToolGrid } from "@components/common/tool-grid";
import { PaginationWrapper } from "@components/common/pagination";
import { useTools } from "@hooks/use-tools";
import { useCategories } from "@hooks/use-categories";
import { useFilterStore } from "@stores/filter-store";
import { useDebounce } from "@hooks/use-debounce";
import { useMediaQuery, breakpoints } from "@hooks/use-media-query";
import { ITEMS_PER_PAGE, PRICING_MODELS, SORT_OPTIONS, ROUTES } from "@lib/constants";
import { cn, getCategoryName } from "@lib/utils";
import { getCategoryConfig } from "@lib/categories-config";
import { AdSlot } from "@components/tools/ad-slot";
import "./tools-page.css";

export default function ToolsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery(breakpoints.lg);
  const isRtl = locale === "ar";

  const {
    search, categoryId, pricing, sort, minRating, page,
    setSearch, setCategoryId, togglePricing, setPricing, setSort, setMinRating, setPage, reset,
  } = useFilterStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const [emailInput, setEmailInput] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const debouncedSearch = useDebounce(localSearch, 300);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories ?? [];

  const CATEGORY_SLUGS = [
    "video", "audio-music", "code-development", "design-art", "ecommerce",
    "education", "gaming", "image-generation", "marketing-sales", "productivity",
    "research-analysis", "text-writing", "3d-modeling",
  ];

  const orderedCategories = useMemo(() => {
    return CATEGORY_SLUGS
      .map(slug => categories.find(c => c.slug === slug))
      .filter(Boolean);
  }, [categories]);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl) {
      setLocalSearch(searchFromUrl);
      setSearch(searchFromUrl);
    }
  }, [searchParams, setSearch]);

  const { data, isLoading, isError, error, refetch } = useTools({
    page,
    perPage: ITEMS_PER_PAGE,
    search,
    categoryId: categoryId ?? undefined,
    pricing: pricing.length > 0 ? pricing.join(",") : undefined,
    sort,
    minRating: minRating > 0 ? minRating : undefined,
  });

  const { data: freeToolsData } = useTools({
    pricing: "free",
    perPage: 100,
  });

  const freeCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    if (freeToolsData?.data) {
      for (const tool of freeToolsData.data) {
        for (const tc of tool.toolCategories || []) {
          if (tc?.category?.id) ids.add(tc.category.id);
        }
      }
    }
    return ids;
  }, [freeToolsData]);

  const tools = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  const hasActiveFilters = search || categoryId || pricing.length > 0 || minRating > 0 || sort !== "newest";

  const activeFilterCount = [
    search, categoryId,
    ...pricing,
    minRating > 0 ? "rating" : null,
    sort !== "newest" ? "sort" : null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    reset();
    setLocalSearch("");
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t("tools.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("tools.subtitle")}</p>
      </motion.div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xl">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t("search.placeholder")}
            className={cn(isRtl ? 'pr-10' : 'pl-10')}
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); setSearch(""); }}
              className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden gap-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Grid3X3 className="h-4 w-4" />
          الأقسام
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs mr-1">{activeFilterCount}</Badge>
          )}
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          "w-[264px] shrink-0 tp-sidebar-stack",
          "lg:block",
          sidebarOpen
            ? "fixed inset-y-0 left-0 z-50 bg-background p-4 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:p-0 lg:bg-transparent"
            : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between lg:hidden mb-3">
            <h3 className="font-semibold">الأقسام والفلاتر</h3>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* ─── CATEGORIES CARD ─── */}
          <div className="tp-card">
            <button
              onClick={() => setCollapsed(p => ({ ...p, cats: !p.cats }))}
              className="tp-coll-hd tp-card-hd collapsible"
            >
              <div className="tp-card-hd-left">
                <div className="tp-card-hd-icon" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <LayoutGrid className="h-[15px] w-[15px]" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <span className="tp-card-hd-title">تصفح حسب التصنيف</span>
              </div>
              <span className="tp-card-hd-badge">{orderedCategories.length} تصنيف</span>
              <ChevronDown className={cn("tp-coll-chevron h-4 w-4 mr-1", collapsed.cats ? "" : "open")} />
            </button>
            <div className={cn("tp-cat-grid tp-coll-body", collapsed.cats && "closed")}>
              {/* All button */}
              <button
                onClick={() => setCategoryId(null)}
                className={cn("tp-cat-btn", !categoryId && "active")}
              >
                <div className="tp-cat-ic" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Search className="h-[15px] w-[15px]" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <span className="tp-cat-lbl">الكل</span>
              </button>
              {orderedCategories.map((cat: any) => {
                const cfg = getCategoryConfig(cat.slug);
                const isActive = categoryId === cat.id;
                const hasFree = freeCategoryIds.has(cat.id);
                const catColor = cat.color || "var(--primary)";
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={cn("tp-cat-btn", isActive && "active")}
                  >
                    <div className="tp-cat-ic" style={{ background: isActive ? `${catColor}1A` : "hsl(var(--muted) / 0.5)" }}>
                      <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
                    </div>
                    <span className="tp-cat-lbl">{getCategoryName(cat)}</span>
                    {hasFree && <span className="tp-cat-free-tag">مجاني</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── FILTER + SORT CARD ─── */}
          <div className="tp-card">
            <button
              onClick={() => setCollapsed(p => ({ ...p, filter: !p.filter }))}
              className="tp-coll-hd tp-card-hd collapsible"
            >
              <div className="tp-card-hd-left">
                <div className="tp-card-hd-icon" style={{ background: "hsl(262 83% 58% / 0.1)" }}>
                  <Grid3X3 className="h-[15px] w-[15px]" style={{ color: "hsl(262 83% 58%)" }} />
                </div>
                <span className="tp-card-hd-title">تصفية وترتيب</span>
              </div>
              <ChevronDown className={cn("tp-coll-chevron h-4 w-4 mr-1", collapsed.filter ? "" : "open")} />
            </button>
            <div className={cn("tp-coll-body", collapsed.filter && "closed")}>
              {/* Price */}
              <button
                onClick={() => setCollapsed(p => ({ ...p, priceSect: !p.priceSect }))}
                className="tp-coll-hd"
              >
                <div className="tp-sec-label" style={{ padding: "10px 12px 0", margin: 0, flex: 1, textAlign: "initial" }}>السعر</div>
                <ChevronDown className={cn("tp-coll-chevron h-3 w-3 ml-3", collapsed.priceSect ? "" : "open")} style={{ marginInlineEnd: 12 }} />
              </button>
              <div className={cn("tp-coll-body", collapsed.priceSect && "closed")}>
                <div className="tp-price-wrap" style={{ paddingTop: 8 }}>
                  <div className="tp-price-chips">
                    <button
                      onClick={() => setPricing([])}
                      className={cn("tp-pchip", pricing.length === 0 && "active")}
                    >
                      <span className="tp-pdot" style={{ background: pricing.length === 0 ? "hsl(var(--primary-foreground) / 0.7)" : "#8a9aaa" }} />
                      الكل
                    </button>
                    {PRICING_MODELS.filter(m => m !== "contact").map((model) => (
                      <button
                        key={model}
                        onClick={() => togglePricing(model)}
                        className={cn("tp-pchip", pricing.includes(model) && "active")}
                      >
                        <span className="tp-pdot" style={{
                          background: model === "free" ? "#22c55e" : model === "freemium" ? "#f59e0b" : "#f43f5e"
                        }} />
                        {t(`pricing.${model}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sort */}
              <button
                onClick={() => setCollapsed(p => ({ ...p, sortSect: !p.sortSect }))}
                className="tp-coll-hd"
              >
                <div className="tp-sec-label" style={{ padding: "10px 12px 0", margin: 0, flex: 1, textAlign: "initial" }}>ترتيب حسب</div>
                <ChevronDown className={cn("tp-coll-chevron h-3 w-3 ml-3", collapsed.sortSect ? "" : "open")} style={{ marginInlineEnd: 12 }} />
              </button>
              <div className={cn("tp-coll-body", collapsed.sortSect && "closed")}>
                <div className="tp-sort-wrap" style={{ paddingTop: 8 }}>
                  <div className="tp-sort-rows">
                    {SORT_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => setSort(opt.value as typeof sort)}
                        className={cn("tp-sort-row", sort === opt.value && "active")}
                      >
                        <Sparkles className="h-[14px] w-[14px]" />
                        {t(`sort.${opt.value}`)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Rating */}
              <button
                onClick={() => setCollapsed(p => ({ ...p, ratingSect: !p.ratingSect }))}
                className="tp-coll-hd"
              >
                <div className="tp-sec-label" style={{ padding: "10px 12px 0", margin: 0, flex: 1, textAlign: "initial" }}>الحد الأدنى للتقييم</div>
                <ChevronDown className={cn("tp-coll-chevron h-3 w-3 ml-3", collapsed.ratingSect ? "" : "open")} style={{ marginInlineEnd: 12 }} />
              </button>
              <div className={cn("tp-coll-body", collapsed.ratingSect && "closed")}>
                <div className="tp-rating-wrap" style={{ paddingTop: 8 }}>
                  {[
                    { value: 0, stars: 5, label: "أي تقييم" },
                    { value: 4, stars: 4, label: "4+ نجوم" },
                    { value: 4.5, stars: 5, label: "4.5+ نجوم" },
                  ].map((r) => (
                    <div
                      key={r.value}
                      onClick={() => setMinRating(r.value)}
                      className={cn("tp-stars-row", minRating === r.value && "active")}
                    >
                      <span className="tp-stars">
                        {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      </span>
                      <span className="tp-stars-lbl">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── PROMO BANNER ─── */}
          <div className="tp-banner">
            <button
              onClick={() => setCollapsed(p => ({ ...p, promo: !p.promo }))}
              className="tp-coll-hd"
              style={{ width: "100%" }}
            >
              <div className="tp-banner-top" style={{ flex: 1 }}>
                <div className="tp-banner-eyebrow">إعلان مميز</div>
                <div className="tp-banner-title">أضف أداتك على دليل أدوات AI</div>
                <div className="tp-banner-sub">وصول مباشر لآلاف الباحثين العرب عن أدوات الذكاء الاصطناعي</div>
              </div>
              <ChevronDown className={cn("tp-coll-chevron h-4 w-4", collapsed.promo ? "" : "open")} style={{ margin: "12px 8px 0 0", flexShrink: 0, color: "hsl(var(--primary-foreground) / 0.7)" }} />
            </button>
            <div className={cn("tp-coll-body", collapsed.promo && "closed")}>
              <div className="tp-banner-bottom">
                <div className="tp-banner-features">
                  <div className="tp-banner-feat">
                    <Check className="h-[13px] w-[13px]" style={{ color: "hsl(var(--primary))" }} />
                    ظهور في نتائج البحث العربية
                  </div>
                  <div className="tp-banner-feat">
                    <Check className="h-[13px] w-[13px]" style={{ color: "hsl(var(--primary))" }} />
                    صفحة تفصيلية مع سيو كامل
                  </div>
                  <div className="tp-banner-feat">
                    <Check className="h-[13px] w-[13px]" style={{ color: "hsl(var(--primary))" }} />
                    إضافة مجانية خلال فترة الإطلاق
                  </div>
                </div>
                <Link href="/submit-tool">
                  <button className="tp-banner-btn">أضف أداتك الآن — مجاناً</button>
                </Link>
                <div className="tp-banner-note">بدون بطاقة ائتمان · مراجعة خلال 24 ساعة</div>
              </div>
            </div>
          </div>

          {/* ─── AD SPACE ─── */}
          <div className="tp-adspace">
            <button
              onClick={() => setCollapsed(p => ({ ...p, ad: !p.ad }))}
              className="tp-coll-hd"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}
            >
              <div className="tp-adspace-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <path d="M16 2v20" /><path d="M2 12h20" />
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div className="tp-adspace-title">مساحة إعلانية</div>
                <div className="tp-adspace-sub">ضع إعلانك هنا وتواصل مع جمهور عربي مهتم بالذكاء الاصطناعي</div>
              </div>
              <ChevronDown className={cn("tp-coll-chevron h-4 w-4", collapsed.ad ? "" : "open")} style={{ flexShrink: 0, color: "hsl(var(--muted-foreground))" }} />
            </button>
            <div className={cn("tp-coll-body", collapsed.ad && "closed")}>
              <div className="tp-adspace-dim" style={{ marginTop: 10 }}>300 × 250 px</div>
            </div>
          </div>

          {/* ─── NEWSLETTER ─── */}
          <div className="tp-nl">
            <button
              onClick={() => setCollapsed(p => ({ ...p, nl: !p.nl }))}
              className="tp-coll-hd"
              style={{ width: "100%" }}
            >
              <div className="tp-nl-top" style={{ flex: 1 }}>
                <div className="tp-nl-top-icon">
                  <Mail className="h-[19px] w-[19px] text-white" />
                </div>
                <div className="tp-nl-top-text">
                  <div className="tp-nl-top-title">النشرة الأسبوعية</div>
                  <div className="tp-nl-top-sub">أحدث أدوات AI المجانية مباشرة في بريدك كل أسبوع</div>
                </div>
              </div>
              <ChevronDown className={cn("tp-coll-chevron h-4 w-4", collapsed.nl ? "" : "open")} style={{ marginInlineEnd: 14, flexShrink: 0, color: "hsl(var(--muted-foreground))" }} />
            </button>
            <div className={cn("tp-coll-body", collapsed.nl && "closed")}>
              <div className="tp-nl-body">
                <div className="tp-nl-perks">
                  <div className="tp-nl-perk">
                    <Check className="h-[13px] w-[13px]" style={{ color: "hsl(142 71% 45%)" }} />
                    أدوات AI مجانية وحديثة كل أسبوع
                  </div>
                  <div className="tp-nl-perk">
                    <Check className="h-[13px] w-[13px]" style={{ color: "hsl(142 71% 45%)" }} />
                    مقارنات وتقييمات بالعربي
                  </div>
                  <div className="tp-nl-perk">
                    <Check className="h-[13px] w-[13px]" style={{ color: "hsl(142 71% 45%)" }} />
                    نصائح للمصممين والمونتيرين
                  </div>
                </div>
                <input
                  className="tp-nl-input"
                  type="email"
                  placeholder="بريدك الإلكتروني..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button className="tp-nl-btn">
                  <Send className="h-[14px] w-[14px]" />
                  اشترك مجاناً
                </button>
                <div className="tp-nl-count">انضم لـ <strong>+2,400</strong> مشترك عربي</div>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-2">
              <X className="h-3 w-3" />
              {t("filters.clear")}
            </Button>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {search && (
                <Badge variant="secondary" className="gap-1">
                  &ldquo;{search}&rdquo;
                  <X className="h-3 w-3 cursor-pointer" onClick={() => { setLocalSearch(""); setSearch(""); }} />
                </Badge>
              )}
              {categoryId && (() => {
                const activeCat = categories.find(c => c.id === categoryId);
                return (
                  <Badge className="gap-1 border-0 font-medium" style={activeCat ? { backgroundColor: `${(activeCat as any).color || "#6366f1"}1A`, color: (activeCat as any).color || "#6366f1" } : {}}>
                    {activeCat?.name ?? categoryId}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryId(null)} />
                  </Badge>
                );
              })()}
              {pricing.map((m) => (
                <Badge key={m} variant="secondary" className="gap-1">
                  {t(`pricing.${m}`)}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => togglePricing(m)} />
                </Badge>
              ))}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minRating}+
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating(0)} />
                </Badge>
              )}
              {sort !== "newest" && (
                <Badge variant="secondary" className="gap-1">
                  {t(`sort.${sort}`)}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSort("newest")} />
                </Badge>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${search}-${categoryId}-${pricing.join()}-${sort}-${minRating}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ToolGrid
                tools={tools}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={() => refetch()}
                columns={isDesktop ? 3 : 2}
              />
            </motion.div>
          </AnimatePresence>

          {meta && totalPages > 1 && (
            <PaginationWrapper
              currentPage={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
