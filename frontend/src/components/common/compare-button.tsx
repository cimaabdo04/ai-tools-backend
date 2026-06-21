"use client";

import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Tooltip } from "@components/ui/tooltip";
import { BarChart3 } from "lucide-react";
import { useLocalStorage } from "@hooks/use-local-storage";
import { MAX_COMPARE_ITEMS } from "@lib/constants";
import { useTranslations } from "next-intl";

interface CompareButtonProps {
  toolId: string;
  toolName: string;
  className?: string;
  variant?: "icon" | "button";
}

export function CompareButton({
  toolId,
  toolName,
  className,
  variant = "icon",
}: CompareButtonProps) {
  const t = useTranslations();
  const [compareIds, setCompareIds] = useLocalStorage<string[]>(
    "compare-tools",
    []
  );
  const isInCompare = compareIds.includes(toolId);

  const handleToggle = () => {
    if (isInCompare) {
      setCompareIds((prev) => prev.filter((id) => id !== toolId));
    } else {
      if (compareIds.length >= MAX_COMPARE_ITEMS) return;
      setCompareIds((prev) => [...prev, toolId]);
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant={isInCompare ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className={cn("gap-2", className)}
        disabled={!isInCompare && compareIds.length >= MAX_COMPARE_ITEMS}
      >
        <BarChart3 className="h-4 w-4" />
        {isInCompare ? t("compare.remove") : t("compare.add")}
      </Button>
    );
  }

  return (
    <Tooltip
      content={
        isInCompare
          ? t("compare.removeFromCompare")
          : compareIds.length >= MAX_COMPARE_ITEMS
          ? t("compare.maxReached")
          : t("compare.addToCompare")
      }
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className={cn(
          "rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
          isInCompare && "text-primary",
          className
        )}
        aria-label={isInCompare ? t("compare.remove") : t("compare.add")}
      >
        {isInCompare ? (
          <BarChart3 className="h-4 w-4 text-primary" />
        ) : (
          <BarChart3 className="h-4 w-4" />
        )}
      </button>
    </Tooltip>
  );
}
