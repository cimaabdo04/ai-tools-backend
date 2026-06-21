"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@stores/auth-store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      localStorage.setItem("oauth_tokens", JSON.stringify({ accessToken, refreshToken }));
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
        .then((r) => r.json())
        .then((res) => {
          const user = res?.data || res;
          if (user?.id) {
            login(user, accessToken);
          }
        })
        .catch(() => {});
    }

    window.location.hash = "";
    router.replace("/");
  }, [router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}
