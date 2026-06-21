"use client";

import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">
        {title ?? t("emptyState.title")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {message ?? t("emptyState.message")}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
