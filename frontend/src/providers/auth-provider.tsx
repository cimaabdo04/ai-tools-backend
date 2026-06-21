"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@stores/auth-store";
import { useMe } from "@hooks/use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuthStore();
  const { isLoading } = useMe();

  useEffect(() => {
    const handleLogout = () => {
      useAuthStore.getState().logout();
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  if (token && isAuthenticated && isLoading) {
    return null;
  }

  return <>{children}</>;
}
