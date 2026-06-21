"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatCurrency, formatDate } from "@lib/utils";
import { ArrowRight, MousePointerClick, Users, DollarSign, TrendingUp, Monitor, Smartphone, Tablet, Globe, ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Click {
  id: string;
  ip: string | null;
  country: string | null;
  deviceType: string | null;
  source: string | null;
  token: string | null;
  converted: boolean;
  convertedAt: string | null;
  clickValue: number;
  createdAt: string;
  linkCode: string;
}

interface BreakdownItem {
  country?: string;
  source?: string;
  device?: string;
  count: number;
  percentage: number;
}

const SOURCE_LABELS: Record<string, string> = {
  facebook: "فيسبوك", twitter: "تويتر", instagram: "انستجرام",
  linkedin: "لينكد إن", youtube: "يوتيوب", tiktok: "تيك توك",
  pinterest: "بينتريست", whatsapp: "واتساب", telegram: "تيليجرام",
  google: "جوجل", search: "بحث", email: "بريد",
  reddit: "ريديت", discord: "ديسكورد", direct: "مباشر",
  other: "أخرى", unknown: "غير معروف",
};

const DEVICE_LABELS: Record<string, { label: string; icon: any }> = {
  mobile: { label: "موبايل", icon: Smartphone },
  tablet: { label: "تابلت", icon: Tablet },
  desktop: { label: "كمبيوتر", icon: Monitor },
  unknown: { label: "غير معروف", icon: Monitor },
};

const SOURCE_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  twitter: "bg-sky-100 text-sky-700",
  google: "bg-green-100 text-green-700",
  direct: "bg-gray-100 text-gray-700",
  linkedin: "bg-blue-200 text-blue-800",
  youtube: "bg-red-100 text-red-700",
  instagram: "bg-pink-100 text-pink-700",
};

export default function AffiliateDetail() {
  const params = useParams();
  const userId = params.id as string;

  const [clickPage, setClickPage] = useState(1);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterDevice, setFilterDevice] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const { data: statsRaw, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["admin", "affiliates", userId, "stats"],
    queryFn: () => api.get<{ data: any }>(`/admin/affiliates/${userId}/stats`),
  });
  const stats = statsRaw?.data;

  const { data: reportsRaw, isLoading: reportsLoading } = useQuery({
    queryKey: ["admin", "affiliates", userId, "reports"],
    queryFn: () => api.get<{ data: any }>(`/admin/affiliates/${userId}/reports`),
  });
  const reports = reportsRaw?.data;

  const { data: clicksRaw, isLoading: clicksLoading } = useQuery({
    queryKey: ["admin", "affiliates", userId, "clicks", clickPage, filterCountry, filterDevice, filterSource, filterFrom, filterTo],
    queryFn: () => {
      const params: Record<string, string | number | boolean | undefined> = { page: clickPage, limit: 20 };
      if (filterCountry) params.country = filterCountry;
      if (filterDevice) params.device = filterDevice;
      if (filterSource) params.source = filterSource;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      return api.get<{ data: { clicks: Click[]; total: number; page: number; totalPages: number; breakdowns: { country: BreakdownItem[]; source: BreakdownItem[]; device: BreakdownItem[] } } }>(
        `/admin/affiliates/${userId}/clicks`, { params }
      );
    },
  });
  const clicksData = clicksRaw?.data;
  const clicks = clicksData?.clicks || [];
  const totalClicksPages = clicksData?.totalPages || 1;
  const clickBreakdowns = clicksData?.breakdowns;

  if (statsLoading || reportsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (statsError) {
    return <ErrorState onRetry={refetchStats} />;
  }

  const totalClicks = stats?.totalClicks || 0;
  const totalConversions = stats?.totalConversions || 0;
  const totalEarned = stats?.totalEarned || 0;
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0.00";
  const affiliateLevel = stats?.affiliateLevel;
  const links = stats?.links || [];

  const renderPercentageBar = (percentage: number, color = "bg-primary") => (
    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/affiliates">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إحصاءات المسوق</h1>
            <p className="text-sm text-muted-foreground">تحليلات مفصلة للمسوق</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {links[0] && (
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-md">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span dir="ltr" className="font-mono text-xs">{links[0].code}</span>
                </div>
              )}
              {affiliateLevel && (
                <Badge variant="secondary">
                  {affiliateLevel.name} (مستوى {affiliateLevel.level}) — {affiliateLevel.commissionRate * 100}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {links.length > 0 && (
                <span>{links.length} {links.length === 1 ? "رابط" : "روابط"}</span>
              )}
              {links[0] && (
                <span>العمولة: {Number(links[0].commissionRate) * 100}%</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزيارات</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            {reports?.sourceBreakdown?.slice(0, 2).map((s: any) => (
              <p key={s.source} className="text-xs text-muted-foreground">
                {SOURCE_LABELS[s.source] || s.source}: {s.count} ({s.percentage}%)
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التحويلات الناجحة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              من {totalClicks.toLocaleString()} زيارة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarned)}</div>
            {reports?.avgCommission && (
              <p className="text-xs text-muted-foreground">
                متوسط العمولة: {formatCurrency(reports.avgCommission)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              من إجمالي الزيارات
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> الدول
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!clickBreakdowns?.country?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {clickBreakdowns.country.slice(0, 10).map((b) => (
                  <div key={b.country}>
                    <div className="flex justify-between text-sm">
                      <span>{b.country === "unknown" ? "غير معروف" : b.country}</span>
                      <span className="text-muted-foreground">{b.count} ({b.percentage}%)</span>
                    </div>
                    {renderPercentageBar(b.percentage, "bg-violet-500")}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> المصادر
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!clickBreakdowns?.source?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {clickBreakdowns.source.slice(0, 10).map((b) => (
                  <div key={b.source}>
                    <div className="flex justify-between text-sm">
                      <span>{b.source ? (SOURCE_LABELS[b.source] || b.source) : "غير معروف"}</span>
                      <span className="text-muted-foreground">{b.count} ({b.percentage}%)</span>
                    </div>
                    {renderPercentageBar(b.percentage, "bg-emerald-500")}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" /> الأجهزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!clickBreakdowns?.device?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {clickBreakdowns.device.map((b) => {
                  const deviceInfo = b.device ? (DEVICE_LABELS[b.device] || { label: b.device, icon: Monitor }) : { label: "غير معروف", icon: Monitor };
                  const Icon = deviceInfo.icon;
                  return (
                    <div key={b.device}>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {deviceInfo.label}
                        </span>
                        <span className="text-muted-foreground">{b.count} ({b.percentage}%)</span>
                      </div>
                      {renderPercentageBar(b.percentage, "bg-amber-500")}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">فلترة النقرات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs mb-1 block">البلد</label>
              <Input placeholder="مصر" value={filterCountry} onChange={(e) => { setFilterCountry(e.target.value); setClickPage(1); }} className="w-28" />
            </div>
            <div>
              <label className="text-xs mb-1 block">الجهاز</label>
              <select
                className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterDevice}
                onChange={(e) => { setFilterDevice(e.target.value); setClickPage(1); }}
              >
                <option value="">الكل</option>
                <option value="mobile">موبايل</option>
                <option value="tablet">تابلت</option>
                <option value="desktop">كمبيوتر</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block">المصدر</label>
              <select
                className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterSource}
                onChange={(e) => { setFilterSource(e.target.value); setClickPage(1); }}
              >
                <option value="">الكل</option>
                {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block">من</label>
              <Input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setClickPage(1); }} className="w-36" dir="ltr" />
            </div>
            <div>
              <label className="text-xs mb-1 block">إلى</label>
              <Input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setClickPage(1); }} className="w-36" dir="ltr" />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFilterCountry(""); setFilterDevice(""); setFilterSource(""); setFilterFrom(""); setFilterTo(""); setClickPage(1); }}>
              مسح الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">سجل النقرات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clicksLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !clicks.length ? (
            <EmptyState title="لا توجد نقرات" message="لم يسجل أي نقرة بعد" />
          ) : (
            <>
              <DataTable
                columns={[
                  { key: "createdAt", header: "التاريخ", render: (item) => formatDate((item as Click).createdAt, "yyyy-MM-dd HH:mm") },
                  { key: "ip", header: "IP", render: (item) => <span dir="ltr" className="font-mono text-xs">{(item as Click).ip || "-"}</span> },
                  { key: "country", header: "البلد", render: (item) => (item as Click).country || "-" },
                  { key: "deviceType", header: "الجهاز", render: (item) => {
                    const d = (item as Click).deviceType;
                    const info = DEVICE_LABELS[d || "unknown"];
                    return info ? info.label : d || "-";
                  }},
                  { key: "source", header: "المصدر", render: (item) => {
                    const s = (item as Click).source || "";
                    return (
                      <Badge variant="outline" className={SOURCE_COLORS[s] || ""}>
                        {SOURCE_LABELS[s] || s || "-"}
                      </Badge>
                    );
                  }},
                  { key: "converted", header: "تحويل", render: (item) => {
                    const c = item as Click;
                    return c.converted ? (
                      <Badge variant="success" className="text-xs">ناجح</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    );
                  }},
                  { key: "clickValue", header: "القيمة", render: (item) => formatCurrency((item as Click).clickValue) },
                  { key: "linkCode", header: "الرابط", render: (item) => <span dir="ltr" className="font-mono text-xs">{(item as Click).linkCode}</span> },
                ]}
                data={clicks}
                keyExtractor={(item) => item.id}
              />
              {totalClicksPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination currentPage={clickPage} totalPages={totalClicksPages} onPageChange={setClickPage} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
