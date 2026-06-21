"use client";

import * as React from "react";
import { cn } from "@lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  info:
    "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

interface ToastProps {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  type = "info",
  title,
  description,
  onClose,
  className,
}: ToastProps) {
  const Icon = icons[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-slide-in-right",
        styles[type],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-xs opacity-80">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded p-1 opacity-60 hover:opacity-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
