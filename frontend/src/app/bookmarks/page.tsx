"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { ToolGrid } from "@components/common/tool-grid";
import { useBookmarks } from "@hooks/use-bookmarks";
import { useAuthStore } from "@stores/auth-store";
import { ROUTES } from "@lib/constants";
import Link from "next/link";

export default function BookmarksPage() {
  const t = useTranslations();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useBookmarks();
  const bookmarks = data?.bookmarks ?? [];

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("auth.login")}</h2>
        <p className="text-muted-foreground mb-6">{t("bookmarks.loginRequired")}</p>
        <Button asChild>
          <Link href={ROUTES.LOGIN}>{t("auth.login")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          {t("dashboard.bookmarks")}
        </h1>
      </motion.div>

      {bookmarks.length === 0 && !isLoading ? (
        <div className="rounded-xl border-2 border-dashed p-20 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">{t("bookmarks.empty")}</h2>
          <Button variant="outline" asChild>
            <Link href={ROUTES.TOOLS}>
              {t("bookmarks.browseTools")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <ToolGrid
          tools={[]}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />
      )}
    </div>
  );
}
