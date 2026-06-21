"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { ROUTES } from "@lib/constants";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";
import { cn } from "@lib/utils";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
      setSuccess(true);
      setTimeout(() => router.push(ROUTES.LOGIN), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("auth.resetPassword")}</h1>
          <p className="text-muted-foreground mt-2">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Password reset!</h2>
            <p className="text-muted-foreground mb-6">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">{t("auth.password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("auth.confirmPassword")}</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("auth.resetPassword")}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
