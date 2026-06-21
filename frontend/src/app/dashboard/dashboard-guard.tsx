"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@stores/auth-store";
import { LoadingSpinner } from "@components/common/loading-spinner";

export function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return <>{children}</>;
}
