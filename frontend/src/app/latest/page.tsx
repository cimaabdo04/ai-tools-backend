"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { ToolGrid } from "@components/common/tool-grid";
import { PaginationWrapper } from "@components/common/pagination";
import { useTools } from "@hooks/use-tools";
import { ITEMS_PER_PAGE } from "@lib/constants";

export default function LatestToolsPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useTools({
    page,
    perPage: ITEMS_PER_PAGE,
    sort: "newest",
  });

  const tools = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          {t("tools.newest")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Recently submitted AI tools, sorted by newest first.
        </p>
      </motion.div>

      <ToolGrid
        tools={tools}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
      />

      {meta && totalPages > 1 && (
        <PaginationWrapper
          currentPage={page}
          totalPages={totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
