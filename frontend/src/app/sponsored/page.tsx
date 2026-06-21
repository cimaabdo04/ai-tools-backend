"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ToolGrid } from "@components/common/tool-grid";
import { useFeaturedTools } from "@hooks/use-tools";

export default function SponsoredToolsPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useFeaturedTools();
  const tools = data?.tools ?? [];

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {t("tools.featured")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Sponsored and featured AI tool listings.
        </p>
      </motion.div>

      <ToolGrid
        tools={tools}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        variant="featured"
      />
    </div>
  );
}
