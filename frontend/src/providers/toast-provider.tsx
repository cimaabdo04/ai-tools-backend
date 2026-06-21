"use client";

import { type ReactNode } from "react";
import { useUiStore } from "@stores/ui-store";

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useUiStore();

  return (
    <>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
          dir="ltr"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="alert"
              className={`animate-slide-in-right flex min-w-[300px] max-w-[450px] items-start gap-3 rounded-lg border p-4 shadow-lg ${
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : toast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                  : toast.type === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                  : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-xs opacity-80">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded p-1 opacity-60 hover:opacity-100"
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
