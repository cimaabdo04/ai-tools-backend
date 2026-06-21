"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { ROUTES } from "@lib/constants";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
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
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={ROUTES.LOGIN}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>

        <div className="text-center mb-8">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">{t("auth.forgotPassword")}</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <Button variant="outline" asChild>
              <Link href={ROUTES.LOGIN}>{t("common.back")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-1 block">
                {t("auth.email")}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Reset Link
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
