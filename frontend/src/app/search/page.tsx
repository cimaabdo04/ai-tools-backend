"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { ToolGrid } from "@components/common/tool-grid";
import { PaginationWrapper } from "@components/common/pagination";
import { useTools, useSearchTools } from "@hooks/use-tools";
import { useDebounce } from "@hooks/use-debounce";
import { ITEMS_PER_PAGE, SORT_OPTIONS } from "@lib/constants";
import { cn } from "@lib/utils";

export default function SearchPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRtl = locale === "ar";

  const queryFromUrl = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const [query, setQuery] = useState(queryFromUrl);
  const debouncedQuery = useDebounce(query, 300);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useTools({
    search: debouncedQuery,
    perPage: ITEMS_PER_PAGE,
    sort: sort === "relevance" ? undefined : sort,
    page,
  });

  const tools = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
    }
  };

  const clearSearch = () => {
    setQuery("");
    router.push("/search");
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t("search.results")}</h1>
      </motion.div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-2xl">
        <div className="relative flex-1">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className={cn(isRtl ? 'pr-10' : 'pl-10')}
            autoFocus
          />
        </div>
        <Button type="submit">{t("common.search")}</Button>
      </form>

      <div className="flex items-center justify-between mb-6">
        {debouncedQuery && (
          <p className="text-sm text-muted-foreground">
            {total > 0
              ? `Found ${total} result${total !== 1 ? "s" : ""} for &ldquo;${debouncedQuery}&rdquo;`
              : `No results for &ldquo;${debouncedQuery}&rdquo;`}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("filters.sortBy")}:</span>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="relevance">Relevance</option>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`sort.${opt.value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {debouncedQuery && (
        <Badge variant="secondary" className="mb-4 gap-1">
          &ldquo;{debouncedQuery}&rdquo;
          <X className="h-3 w-3 cursor-pointer" onClick={clearSearch} />
        </Badge>
      )}

      <ToolGrid
        tools={tools}
        isLoading={isLoading && !!debouncedQuery}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
      />

      {meta && totalPages > 1 && (
        <PaginationWrapper
          currentPage={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
