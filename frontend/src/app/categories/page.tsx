"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@components/common/loading-spinner";
import { useCategories } from "@hooks/use-categories";
import { getCategoryName } from "@lib/utils";
import { getCategoryConfig } from "@lib/categories-config";
import { ROUTES } from "@lib/constants";

export default function CategoriesPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useCategories();
  const categories = data?.categories ?? [];
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || isLoading) {
    return (
      <div className="container py-8">
        <LoadingSpinner className="py-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold">{t("errors.somethingWentWrong")}</h2>
          <p className="text-muted-foreground mt-2">{error?.message}</p>
          <button onClick={() => refetch()} className="mt-4 text-primary hover:underline">
            {t("errors.retry")}
          </button>
        </div>
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
        <h1 className="categories-title">{t("categories.title")}</h1>
        <p className="categories-subtitle">{t("categories.subtitle")}</p>
      </motion.div>

      <div className="category-grid">
        {categories.map((cat, i) => {
          const config = getCategoryConfig(cat.slug);
          const subs = config.subcategories;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`${ROUTES.CATEGORIES}/${cat.slug}`} className="category-card block">
              <div className="category-header">
                <div className={`category-icon ${config.gradientClass}`}>
                  {config.emoji}
                </div>
                <div>
                  <div className="category-title">{getCategoryName(cat)}</div>
                  <div className="category-count">
                    {config.subCount} {t("categories.tools")}
                  </div>
                </div>
              </div>
              <div className="category-body">
                <div className="subcategories">
                  {subs.map((sub, j) => (
                    <span key={j} className="sub-item">
                      <span className={`dot ${config.dotClass}`} />
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <style jsx global>{`
        .categories-title {
          text-align: center;
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #8b5cf6, #14b8a6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .categories-subtitle {
          text-align: center;
          color: hsl(var(--muted-foreground));
          font-size: 16px;
          margin-bottom: 48px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .category-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .category-card:hover {
          border-color: hsl(var(--primary));
          transform: translateY(-4px);
        }

        .category-header {
          padding: 20px 24px;
          border-bottom: 1px solid hsl(var(--border));
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .category-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .category-title {
          font-size: 18px;
          font-weight: 700;
        }

        .category-count {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          margin-top: 2px;
        }

        .category-body {
          padding: 16px 24px 24px;
          flex: 1;
        }

        .subcategories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sub-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          font-size: 13px;
          color: hsl(var(--muted-foreground));
          transition: all 0.2s;
        }

        .sub-item:hover {
          background: rgba(139, 92, 246, 0.15);
          color: hsl(var(--foreground));
          border-color: #8b5cf6;
        }

        .sub-item .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
