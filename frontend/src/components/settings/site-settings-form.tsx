"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { NavLinksEditor } from "./nav-links-editor";
import { FooterLinksEditor } from "./footer-links-editor";
import { ImageUploader } from "./image-uploader";
import { Save } from "lucide-react";
import { useUiStore } from "@stores/ui-store";

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  logo?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleAdsId?: string;
  googleAdsLabel?: string;
  facebookPixelId?: string;
  rateLimitingEnabled: boolean;
  rateLimitingMax: number;
  rateLimitingWindow: number;
  maintenanceEnabled: boolean;
  maintenanceMessage: string;
  headerHtml?: string;
  footerHtml?: string;
  navLinks?: string;
  footerLinks?: string;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

interface FooterSection {
  title: string;
  links: NavLink[];
}

const defaultNavLinks: NavLink[] = [
  { label: "الأدوات", href: "/tools" },
  { label: "التصنيفات", href: "/categories" },
  { label: "الأسعار", href: "/pricing" },
  { label: "المدونة", href: "/blog" },
];

const defaultFooterLinks: FooterSection[] = [
  {
    title: "المنتج",
    links: [
      { label: "الأدوات", href: "/tools" },
      { label: "التصنيفات", href: "/categories" },
      { label: "الأسعار", href: "/pricing" },
      { label: "تقديم أداة", href: "/submit-tool" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "عن", href: "/about" },
      { label: "المدونة", href: "/blog" },
      { label: "اتصل بنا", href: "/contact" },
      { label: "الأسئلة الشائعة", href: "/faq" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "شروط الخدمة", href: "/terms" },
      { label: "ملفات تعريف الارتباط", href: "/cookies" },
    ],
  },
];

const defaults: SiteSettings = {
  siteName: "Aiatlas",
  siteDescription: "",
  supportEmail: "",
  logo: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  smtpSecure: true,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  canonicalUrl: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  googleAdsId: "",
  googleAdsLabel: "",
  facebookPixelId: "",
  rateLimitingEnabled: true,
  rateLimitingMax: 100,
  rateLimitingWindow: 60000,
  maintenanceEnabled: false,
  maintenanceMessage: "",
  headerHtml: "",
  footerHtml: "",
  navLinks: JSON.stringify(defaultNavLinks),
  footerLinks: JSON.stringify(defaultFooterLinks),
};

export function SiteSettingsForm() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState<SiteSettings>(defaults);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ data: SiteSettings }>("/settings"),
  });

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      setForm((prev) => ({
        ...prev,
        ...d,
        logo: d.logo || "",
        navLinks: typeof d.navLinks === "string" ? d.navLinks : d.navLinks ? JSON.stringify(d.navLinks) : prev.navLinks,
        footerLinks: typeof d.footerLinks === "string" ? d.footerLinks : d.footerLinks ? JSON.stringify(d.footerLinks) : prev.footerLinks,
      }));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: SiteSettings) => {
      const allowed: (keyof SiteSettings)[] = [
        "siteName","siteDescription","supportEmail","logo",
        "smtpHost","smtpPort","smtpUser","smtpPass","smtpFrom","smtpSecure",
        "metaTitle","metaDescription","metaKeywords","ogImage","canonicalUrl",
        "googleAnalyticsId","googleTagManagerId","googleAdsId","googleAdsLabel","facebookPixelId",
        "rateLimitingEnabled","rateLimitingMax","rateLimitingWindow",
        "maintenanceEnabled","maintenanceMessage",
        "headerHtml","footerHtml",
        "navLinks","footerLinks",
      ];
      const payload: Record<string, unknown> = {};
      for (const key of allowed) {
        payload[key] = (body as any)[key];
      }
      return api.put("/settings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      addToast({ type: "success", title: "تم الحفظ", description: "تم حفظ الإعدادات بنجاح" });
    },
    onError: (err: any) => {
      addToast({ type: "error", title: "فشل الحفظ", description: err?.message || err?.data?.message || "حدث خطأ" });
    },
  });

  const update = (field: keyof SiteSettings, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إعدادات الموقع</h1>
          <p className="text-sm text-muted-foreground">التحكم في إعدادات الموقع العامة</p>
        </div>
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 ml-2" />
          {saveMutation.isPending ? "جاري الحفظ..." : "حفظ الكل"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
          <TabsTrigger value="seo">تحسين محركات البحث</TabsTrigger>
          <TabsTrigger value="tracking">التتبع والإحصائيات</TabsTrigger>
          <TabsTrigger value="ratelimit">التحكم بالطلبات</TabsTrigger>
          <TabsTrigger value="maintenance">وضع الصيانة</TabsTrigger>
          <TabsTrigger value="custom">أكواد مخصصة</TabsTrigger>
          <TabsTrigger value="navbar">القائمة العلوية</TabsTrigger>
          <TabsTrigger value="footer">الفوتر</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">اسم الموقع</label>
                <Input value={form.siteName || ""} onChange={(e) => update("siteName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">وصف الموقع</label>
                <Textarea value={form.siteDescription || ""} onChange={(e) => update("siteDescription", e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">بريد الدعم الفني (للموقع)</label>
                <Input type="email" value={form.supportEmail || ""} onChange={(e) => update("supportEmail", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">هذا البريد يظهر للزوار في صفحة اتصل بنا، ليس بريد الأدمن</p>
              </div>
              <div>
                <label className="text-sm font-medium">رابط الشعار</label>
                <div className="flex gap-2">
                  <Input value={form.logo || ""} onChange={(e) => update("logo", e.target.value)} dir="ltr" placeholder="https://..." className="flex-1" />
                  <ImageUploader onUpload={(url) => update("logo", url)} />
                </div>
                {form.logo && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border p-2">
                    <img src={form.logo} alt="Logo" className="h-10 w-10 rounded object-contain" />
                    <span className="text-xs text-muted-foreground truncate">{form.logo}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground mb-2">إعدادات إرسال البريد الإلكتروني من الموقع للمستخدمين</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">خادم SMTP</label>
                  <Input value={form.smtpHost || ""} onChange={(e) => update("smtpHost", e.target.value)} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium">المنفذ</label>
                  <Input type="number" value={form.smtpPort} onChange={(e) => update("smtpPort", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">اسم المستخدم</label>
                  <Input value={form.smtpUser || ""} onChange={(e) => update("smtpUser", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input type="password" value={form.smtpPass || ""} onChange={(e) => update("smtpPass", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">البريد المرسل (From)</label>
                <Input value={form.smtpFrom || ""} onChange={(e) => update("smtpFrom", e.target.value)} dir="ltr" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">استخدام SSL/TLS</span>
                  <p className="text-xs text-muted-foreground">تشفير الاتصال بخادم البريد</p>
                </div>
                <Switch checked={form.smtpSecure} onCheckedChange={(c) => update("smtpSecure", c)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">عنوان الموقع (Meta Title)</label>
                <Input value={form.metaTitle || ""} onChange={(e) => update("metaTitle", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">وصف الموقع (Meta Description)</label>
                <Textarea value={form.metaDescription || ""} onChange={(e) => update("metaDescription", e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">الكلمات المفتاحية (Meta Keywords)</label>
                <Input value={form.metaKeywords || ""} onChange={(e) => update("metaKeywords", e.target.value)} placeholder="أداة ذكاء اصطناعي, AI, تعلم آلة" />
                <p className="text-xs text-muted-foreground mt-1">افصل بين الكلمات بفاصلة</p>
              </div>
              <div>
                <label className="text-sm font-medium">صورة OG (لمشاركة الروابط)</label>
                <Input value={form.ogImage || ""} onChange={(e) => update("ogImage", e.target.value)} placeholder="https://..." dir="ltr" />
              </div>
              <div>
                <label className="text-sm font-medium">الرابط الأساسي (Canonical URL)</label>
                <Input value={form.canonicalUrl || ""} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder="https://..." dir="ltr" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>رموز التتبع والإحصائيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Google Analytics ID (GA4)</label>
                <Input value={form.googleAnalyticsId || ""} onChange={(e) => update("googleAnalyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" dir="ltr" />
                <p className="text-xs text-muted-foreground mt-1">معرف القياس من Google Analytics 4</p>
              </div>
              <div>
                <label className="text-sm font-medium">Google Tag Manager ID</label>
                <Input value={form.googleTagManagerId || ""} onChange={(e) => update("googleTagManagerId", e.target.value)} placeholder="GTM-XXXXXXX" dir="ltr" />
                <p className="text-xs text-muted-foreground mt-1">معرف الحاوية من Google Tag Manager</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Google Ads ID</label>
                  <Input value={form.googleAdsId || ""} onChange={(e) => update("googleAdsId", e.target.value)} placeholder="AW-XXXXXXXXX" dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium">وسم تحويل Google Ads</label>
                  <Input value={form.googleAdsLabel || ""} onChange={(e) => update("googleAdsLabel", e.target.value)} placeholder="XXXXXXXXXX" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Facebook Pixel ID</label>
                <Input value={form.facebookPixelId || ""} onChange={(e) => update("facebookPixelId", e.target.value)} placeholder="XXXXXXXXXXXXXXX" dir="ltr" />
                <p className="text-xs text-muted-foreground mt-1">معرف البكسل من Meta/Facebook</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratelimit" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">تفعيل الحد من الطلبات</p>
                  <p className="text-xs text-muted-foreground">حماية الموقع من الهجمات والطلبات المفرطة</p>
                </div>
                <Switch checked={form.rateLimitingEnabled} onCheckedChange={(c) => update("rateLimitingEnabled", c)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">الحد الأقصى للطلبات</label>
                  <Input type="number" value={form.rateLimitingMax} onChange={(e) => update("rateLimitingMax", Number(e.target.value))} disabled={!form.rateLimitingEnabled} />
                </div>
                <div>
                  <label className="text-sm font-medium">النافذة الزمنية (مللي ثانية)</label>
                  <Input type="number" value={form.rateLimitingWindow} onChange={(e) => update("rateLimitingWindow", Number(e.target.value))} disabled={!form.rateLimitingEnabled} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">وضع الصيانة</p>
                  <p className="text-xs text-muted-foreground">إخفاء الموقع عن الزوار وعرض رسالة صيانة</p>
                </div>
                <Switch checked={form.maintenanceEnabled} onCheckedChange={(c) => update("maintenanceEnabled", c)} />
              </div>
              {form.maintenanceEnabled && (
                <div>
                  <label className="text-sm font-medium">رسالة الصيانة</label>
                  <Textarea value={form.maintenanceMessage || ""} onChange={(e) => update("maintenanceMessage", e.target.value)} rows={3} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>الأكواد المخصصة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">أكواد الرأس (header) - توضع قبل &lt;/head&gt;</label>
                <Textarea value={form.headerHtml || ""} onChange={(e) => update("headerHtml", e.target.value)} rows={8} className="font-mono text-xs" placeholder="ضع هنا أكواد CSS أو JavaScript أو Meta Tags" />
                <p className="text-xs text-muted-foreground mt-1">هذه الأكواد تضاف قبل إغلاق وسم &lt;/head&gt; في كل صفحات الموقع</p>
              </div>
              <div>
                <label className="text-sm font-medium">أكواد الفوتر (footer) - توضع قبل &lt;/body&gt;</label>
                <Textarea value={form.footerHtml || ""} onChange={(e) => update("footerHtml", e.target.value)} rows={8} className="font-mono text-xs" placeholder="ضع هنا أكواد JavaScript أو أدوات التتبع" />
                <p className="text-xs text-muted-foreground mt-1">هذه الأكواد تضاف قبل إغلاق وسم &lt;/body&gt; في كل صفحات الموقع</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="navbar" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>روابط القائمة العلوية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">الروابط التي تظهر في الشريط العلوي للموقع. يمكن إضافة روابط فرعية للقوائم المنسدلة.</p>
              <NavLinksEditor
                value={form.navLinks || "[]"}
                onChange={(v) => update("navLinks", v)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="footer" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>روابط الفوتر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">الأقسام والروابط التي تظهر في الفوتر.</p>
              <FooterLinksEditor
                value={form.footerLinks || "[]"}
                onChange={(v) => update("footerLinks", v)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
