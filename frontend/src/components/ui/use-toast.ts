"use client";

import { useUiStore } from "@stores/ui-store";

export function useToast() {
  const addToast = useUiStore((s) => s.addToast);

  const toast = ({ title, variant }: { title: string; variant?: "success" | "error" | "warning" | "info" | "destructive" }) => {
    addToast({
      title,
      type: variant === "destructive" ? "error" : (variant || "info"),
    });
  };

  return { toast };
}
