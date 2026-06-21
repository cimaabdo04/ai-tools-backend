"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useAuthStore } from "@stores/auth-store";
import { Loader2, CheckCircle, UserCheck } from "lucide-react";

export default function AffiliateApplyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [website, setWebsite] = useState("");
  const [howDidYouHear, setHowDidYouHear] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const applyMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post("/affiliates/apply", body),
    onSuccess: () => setSubmitted(true),
    onError: (err: Error) => setError(err.message),
  });

  if (submitted) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <Card className="w-full max-w-lg border-emerald-200">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">تم استلام طلبك!</h1>
            <p className="text-muted-foreground mb-6">
              شكراً لاهتمامك بالانضمام كشريك تسويقي. فريقنا سيراجع طلبك والتواصل معك خلال 24 ساعة.
            </p>
            <Button onClick={() => router.push("/")}>العودة للرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">انضم كشريك تسويقي</h1>
            <p className="text-muted-foreground mb-6">
              سجل الدخول أو أنشئ حساباً جديداً لتقديم طلب الانضمام.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/login?redirect=/affiliates/apply")}>
                تسجيل الدخول
              </Button>
              <Button variant="outline" onClick={() => router.push("/register?redirect=/affiliates/apply")}>
                إنشاء حساب
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName) { setError("الاسم الكامل مطلوب"); return; }
    if (!agreeTerms) { setError("يرجى الموافقة على الشروط والأحكام"); return; }

    applyMutation.mutate({
      fullName,
      platforms: howDidYouHear ? [{ name: howDidYouHear, url: website || "https://" }] : [{ name: "direct", url: "https://" }],
      ...(website ? { note: `الموقع: ${website}` } : {}),
    });
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-lg border-primary/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">انضم كشريك تسويقي</h1>
              <p className="text-sm text-muted-foreground">احصل على رابطك التابع وابدأ الربح</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1 block">الاسم الكامل</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">موقعك (اختياري)</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">كيف سمعت عنا؟</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={howDidYouHear}
                onChange={(e) => setHowDidYouHear(e.target.value)}
              >
                <option value="">-- اختر --</option>
                <option value="google">محرك بحث (قوقل)</option>
                <option value="social_media">وسائل التواصل الاجتماعي</option>
                <option value="friend">صديق/زميل</option>
                <option value="blog">مدونة أو مقال</option>
                <option value="youtube">يوتيوب</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                أوافق على{" "}
                <Link href="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
                {" "}وسياسة الخصوصية الخاصة بالبرنامج.
              </span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? (
                <><Loader2 className="h-4 w-4 ml-2 animate-spin" /> جارٍ الإرسال...</>
              ) : (
                "قدم طلب الانضمام"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-md p-3">
              ℹ️ ملاحظة: طلبك سيُراجع خلال 24 ساعة
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
