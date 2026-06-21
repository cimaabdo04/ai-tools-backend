"use client";

import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-1">
        {title ?? t("errors.somethingWentWrong")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {message ?? t("errors.tryAgain")}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("errors.retry")}
        </Button>
      )}
    </div>
  );
}
