"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatCurrency, formatDate } from "@lib/utils";
import { DollarSign, Check, X, ChevronDown, Trash2, Wallet, Clock, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Affiliate {
  id: string;
  user: { id: string; name: string; email: string };
  code: string;
  commissionRate: number;
  totalLinks: number;
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  totalReferrals: number;
  conversionRate: number;
  maxManualLinks: number;
  paypalEmail?: string;
  cryptoType?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  contactForPayment?: boolean;
  status: string;
}

interface Referral {
  id: string;
  name: string | null;
  email: string;
  registeredAt: string;
  country: string | null;
  linkCode: string;
  clickIp: string | null;
  clickCountry: string | null;
  clickedAt: string | null;
}

interface Application {
  id: string;
  user: { id: string; name: string; email: string; avatarUrl?: string };
  status: string;
  platforms: { name: string; url: string }[];
  fullName?: string;
  phone?: string;
  country?: string;
  paypalEmail?: string;
  cryptoType?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  contactForPayment?: boolean;
  note?: string;
  adminNote?: string;
  maxManualLinks: number;
  createdAt: string;
}

interface CountryRate {
  id: string;
  countryCode: string;
  countryName: string;
  clickValue: number;
  conversionValue: number;
  isActive: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentDetails: string | null;
  adminNote: string | null;
  processedAt: string | null;
  createdAt: string;
  affiliate: { id: string; name: string | null; email: string };
}

interface Level {
  id: string;
  level: number;
  name: string;
  minConversions: number;
  minEarnings: number;
  commissionRate: number;
}

export default function AdminAffiliates() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("links");
  const [page, setPage] = useState(1);
  const [appPage, setAppPage] = useState(1);
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [referralsDialog, setReferralsDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState<{ id: string; action: string; adminNote: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<Affiliate | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [commissionEdit, setCommissionEdit] = useState<{ id: string; rate: number } | null>(null);
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryName, setNewCountryName] = useState("");
  const [newClickValue, setNewClickValue] = useState("0.001");
  const [newConversionValue, setNewConversionValue] = useState("1.0");
  const [newLevelNum, setNewLevelNum] = useState("");
  const [newLevelName, setNewLevelName] = useState("");
  const [newLevelConversions, setNewLevelConversions] = useState("0");
  const [newLevelEarnings, setNewLevelEarnings] = useState("0");
  const [newLevelRate, setNewLevelRate] = useState("0.20");
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [reviewNote, setReviewNote] = useState("");

  const { data: withdrawalsRaw, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["admin", "affiliates", "withdrawals", withdrawPage],
    queryFn: () => api.get<{ data: { withdrawals: Withdrawal[]; total: number; totalPages: number } }>("/admin/affiliates/withdrawals", { params: { page: withdrawPage } }),
    enabled: tab === "withdrawals",
  });
  const withdrawalsData = withdrawalsRaw?.data;
  const withdrawalsList = withdrawalsData?.withdrawals || [];
  const totalWithdrawalsPages = withdrawalsData?.totalPages || 1;

  const approveWithdrawal = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      api.patch(`/admin/affiliates/withdrawals/${id}`, { status: "APPROVED", adminNote }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] }); setWithdrawDialog(null); },
  });

  const rejectWithdrawal = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      api.patch(`/admin/affiliates/withdrawals/${id}`, { status: "REJECTED", adminNote }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] }); setWithdrawDialog(null); },
  });

  const { data: affiliatesRaw, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "affiliates", page],
    queryFn: () => api.get<{ data: { affiliates: Affiliate[]; total: number; totalPages: number } }>("/admin/affiliates", { params: { page } }),
    enabled: tab === "links",
  });
  const data = affiliatesRaw?.data;
  const affiliatesList = data?.affiliates || [];
  const totalAffiliates = data?.total || 0;
  const totalAffiliatesPages = data?.totalPages || 1;

  const { data: appsRaw, isLoading: appsLoading } = useQuery({
    queryKey: ["admin", "affiliates", "applications", appPage],
    queryFn: () => api.get<{ data: { applications: Application[]; total: number; totalPages: number } }>("/admin/affiliates/applications", { params: { page: appPage } }),
    enabled: tab === "applications",
  });
  const appsData = appsRaw?.data;
  const applications = appsData?.applications || [];
  const totalApplications = appsData?.total || 0;

  const { data: ratesRaw, isLoading: ratesLoading } = useQuery({
    queryKey: ["admin", "affiliates", "country-rates"],
    queryFn: () => api.get<{ data: CountryRate[] }>("/admin/affiliates/country-rates"),
    enabled: tab === "rates",
  });
  const countryRates = ratesRaw?.data || [];

  const { data: levelsRaw, isLoading: levelsLoading } = useQuery({
    queryKey: ["admin", "affiliates", "levels"],
    queryFn: () => api.get<{ data: Level[] }>("/admin/affiliates/levels"),
    enabled: tab === "levels",
  });
  const levelsList = levelsRaw?.data || [];

  const { data: referralsRaw, isLoading: referralsLoading } = useQuery({
    queryKey: ["admin", "affiliates", "referrals", selectedUser?.id],
    queryFn: () => api.get<{ data: Referral[] }>(`/admin/affiliates/${selectedUser!.id}/referrals`),
    enabled: !!selectedUser && referralsDialog,
  });
  const referralsList = referralsRaw?.data || [];

  const updateCommission = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) => api.patch(`/admin/affiliates/${id}`, { commissionRate: rate }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] }); setCommissionEdit(null); },
  });

  const processPayout = useMutation({
    mutationFn: (id: string) => api.post(`/admin/affiliates/${id}/payout`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] }); setPayoutDialog(false); },
  });

  const reviewApp = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) =>
      api.patch(`/admin/affiliates/applications/${id}/review`, { status, adminNote }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] }); setReviewDialog(false); setSelectedApp(null); },
  });

  const addRate = useMutation({
    mutationFn: () => api.post("/admin/affiliates/country-rates", {
      countryCode: newCountryCode.toUpperCase(), countryName: newCountryName,
      clickValue: Number(newClickValue), conversionValue: Number(newConversionValue),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "country-rates"] }); setNewCountryCode(""); setNewCountryName(""); },
  });

  const deleteRate = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/affiliates/country-rates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "country-rates"] }),
  });

  const addLevel = useMutation({
    mutationFn: () => api.post("/admin/affiliates/levels", {
      level: Number(newLevelNum), name: newLevelName,
      minConversions: Number(newLevelConversions), minEarnings: Number(newLevelEarnings), commissionRate: Number(newLevelRate),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "levels"] }); setNewLevelNum(""); setNewLevelName(""); },
  });

  const deleteLevel = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/affiliates/levels/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "levels"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إدارة المسوقين</h1>
        <p className="text-sm text-muted-foreground">إدارة بيانات المسوقين والطلبات والأسعار والمستويات والسحوبات</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="links">المسوقين</TabsTrigger>
                <TabsTrigger value="applications">
            طلبات الانضمام
            {totalApplications > 0 && <Badge variant="secondary" className="mr-2">{totalApplications}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="rates">أسعار البلدان</TabsTrigger>
          <TabsTrigger value="levels">المستويات</TabsTrigger>
          <TabsTrigger value="withdrawals">السحوبات</TabsTrigger>
        </TabsList>

        <TabsContent value="links">
          {isLoading ? (
            <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : !data?.affiliates.length ? (
            <EmptyState title="لا يوجد أفلييت" message="لم يتم الموافقة على أي طلب انضمام بعد" />
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      { key: "user", header: "المستخدم", render: (item) => {
                        const a = item as Affiliate;
                        return (
                          <Link href={`/admin/affiliates/${a.user?.id}`} className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                            {a.user?.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        );
                      }},
                      { key: "code", header: "الكود", sortable: true },
                      { key: "commissionRate", header: "العمولة", sortable: true, render: (item) => {
                        const a = item as Affiliate;
                        return commissionEdit?.id === a.id ? (
                          <div className="flex items-center gap-1">
                            <Input type="number" className="w-20 h-8" value={commissionEdit.rate} onChange={(e) => setCommissionEdit({ ...commissionEdit, rate: Number(e.target.value) })} />
                            <Button size="sm" variant="ghost" onClick={() => updateCommission.mutate(commissionEdit)}>حفظ</Button>
                          </div>
                        ) : (
                          <span className="cursor-pointer hover:text-primary" onClick={() => setCommissionEdit({ id: a.id, rate: Number(a.commissionRate) })}>
                            {Number(a.commissionRate) * 100}%
                          </span>
                        );
                      }},
                      { key: "totalLinks", header: "الروابط", sortable: true },
                      { key: "totalEarnings", header: "الأرباح", sortable: true, render: (item) => formatCurrency(Number((item as Affiliate).totalEarnings)) },
                      { key: "totalClicks", header: "الزيارات", sortable: true },
                      { key: "totalConversions", header: "التحويلات", sortable: true },
                      { key: "totalReferrals", header: "الإحالات", sortable: true },
                      { key: "conversionRate", header: "نسبة التحويل", sortable: true, render: (item) => `${(item as Affiliate).conversionRate}%` },
                      { key: "payment", header: "وسائل الدفع", render: (item) => {
                        const a = item as Affiliate;
                        return (
                          <div className="text-xs space-y-0.5">
                            {a.paypalEmail && <div>PayPal: {a.paypalEmail}</div>}
                            {a.cryptoType && <div>{a.cryptoType} ({a.cryptoNetwork}): {a.cryptoAddress?.slice(0, 12)}...</div>}
                            {a.contactForPayment && <div className="text-muted-foreground">تواصل معنا</div>}
                          </div>
                        );
                      }},
                      { key: "actions", header: "", render: (item) => (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedUser(item as Affiliate); setReferralsDialog(true); }}>
                            الإحالات
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedUser(item as Affiliate); setPayoutDialog(true); }}>
                            <DollarSign className="h-4 w-4 ml-1" />
                            صرف
                          </Button>
                        </div>
                      )},
                    ]}
                    data={affiliatesList}
                    keyExtractor={(item) => item.id}
                  />
                </CardContent>
              </Card>
              {totalAffiliatesPages > 1 && <Pagination currentPage={page} totalPages={totalAffiliatesPages} onPageChange={setPage} />}
            </>
          )}
        </TabsContent>

        <TabsContent value="applications">
          {appsLoading ? (
            <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)}</CardContent></Card>
          ) : !appsData?.applications.length ? (
            <EmptyState title="لا توجد طلبات" message="لم يتم تقديم أي طلبات انضمام بعد" />
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      { key: "user", header: "المستخدم", render: (item) => (item as Application).user?.name },
                      { key: "platforms", header: "المنصات", render: (item) => {
                        const platforms = (item as Application).platforms;
                        return Array.isArray(platforms) ? platforms.map((p, i) => (
                          <div key={i} className="text-xs"><span className="font-medium">{p.name}</span>: {p.url}</div>
                        )) : "-";
                      }},
                      { key: "paypal", header: "PayPal", render: (item) => (item as Application).paypalEmail || "-" },
                      { key: "crypto", header: "الكريبتو", render: (item) => {
                        const a = item as Application;
                        return a.cryptoType ? `${a.cryptoType}: ${a.cryptoAddress?.slice(0, 12)}...` : "-";
                      }},
                      { key: "createdAt", header: "تاريخ التقديم", render: (item) => formatDate((item as Application).createdAt) },
                      { key: "status", header: "الحالة", render: (item) => {
                        const s = (item as Application).status;
                        const variants: Record<string, "warning" | "success" | "destructive" | "secondary"> = { pending: "warning", approved: "success", rejected: "destructive", incomplete: "secondary" };
                        const labels: Record<string, string> = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض", incomplete: "بيانات ناقصة" };
                        return <Badge variant={variants[s] || "secondary"}>{labels[s] || s}</Badge>;
                      }},
                      { key: "actions", header: "", render: (item) => {
                        const app = item as Application;
                        return (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => { setSelectedApp(app); setReviewDialog(true); }}>
                              <Check className="h-4 w-4 ml-1" /> {app.status === "rejected" || app.status === "incomplete" ? "قبول" : "موافقة"}
                            </Button>
                            {app.status !== "rejected" && (
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setSelectedApp(app); setReviewDialog(true); }}>
                                <X className="h-4 w-4 ml-1" /> رفض
                              </Button>
                            )}
                            {app.status !== "incomplete" && (
                              <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setReviewDialog(true); }}>
                                استكمال بيانات
                              </Button>
                            )}
                          </div>
                        );
                      }},
                    ]}
                    data={applications}
                    keyExtractor={(item) => item.id}
                  />
                </CardContent>
              </Card>
              {(appsData?.totalPages || 0) > 1 && <Pagination currentPage={appPage} totalPages={appsData?.totalPages || 1} onPageChange={setAppPage} />}
            </>
          )}
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="text-xs mb-1 block">الدولة</label>
                  <Input placeholder="مثال: US" value={newCountryCode} onChange={(e) => setNewCountryCode(e.target.value)} className="w-16" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">اسم الدولة</label>
                  <Input placeholder="United States" value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} className="w-36" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">قيمة النقرة</label>
                  <Input placeholder="0.001" value={newClickValue} onChange={(e) => setNewClickValue(e.target.value)} className="w-20" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">قيمة التسجيل</label>
                  <Input placeholder="1.0" value={newConversionValue} onChange={(e) => setNewConversionValue(e.target.value)} className="w-20" dir="ltr" />
                </div>
                <Button size="sm" onClick={() => addRate.mutate()} disabled={!newCountryCode || !newCountryName}>إضافة</Button>
              </div>
              {ratesLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : !countryRates.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد أسعار بلدان. أضف بلداً للبدء.</p>
              ) : (
                <div className="divide-y">
                  {countryRates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium">{rate.countryName} ({rate.countryCode})</span>
                      <div className="flex items-center gap-4">
                        <span>نقرة: ${rate.clickValue}</span>
                        <span>تسجيل: ${rate.conversionValue}</span>
                        <Badge variant={rate.isActive ? "success" : "secondary"}>{rate.isActive ? "نشط" : "غير نشط"}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteRate.mutate(rate.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="text-xs mb-1 block">رقم المستوى</label>
                  <Input placeholder="1" value={newLevelNum} onChange={(e) => setNewLevelNum(e.target.value)} className="w-16" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">الاسم</label>
                  <Input placeholder="برونزي" value={newLevelName} onChange={(e) => setNewLevelName(e.target.value)} className="w-24" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">أقل تحويلات</label>
                  <Input placeholder="0" value={newLevelConversions} onChange={(e) => setNewLevelConversions(e.target.value)} className="w-16" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">أقل أرباح ($)</label>
                  <Input placeholder="0" value={newLevelEarnings} onChange={(e) => setNewLevelEarnings(e.target.value)} className="w-20" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">نسبة العمولة</label>
                  <Input placeholder="0.20" value={newLevelRate} onChange={(e) => setNewLevelRate(e.target.value)} className="w-20" dir="ltr" />
                </div>
                <Button size="sm" onClick={() => addLevel.mutate()} disabled={!newLevelNum || !newLevelName}>إضافة</Button>
              </div>
              {levelsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : !levelsList.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد مستويات. أضف مستوى للبدء.</p>
              ) : (
                <div className="divide-y">
                  {levelsList.map((level) => (
                    <div key={level.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <span className="font-medium ml-2">المستوى {level.level}</span>
                        <Badge>{level.name}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>≥ {level.minConversions} تحويل</span>
                        <span>≥ ${level.minEarnings}</span>
                        <span className="font-mono">{level.commissionRate * 100}%</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteLevel.mutate(level.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          {withdrawalsLoading ? (
            <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)}</CardContent></Card>
          ) : !withdrawalsList.length ? (
            <EmptyState title="لا توجد طلبات سحب" message="لم يتم تقديم أي طلبات سحب بعد" />
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      { key: "affiliate", header: "المسوق", render: (item) => (item as Withdrawal).affiliate?.name || (item as Withdrawal).affiliate?.email },
                      { key: "amount", header: "المبلغ", sortable: true, render: (item) => formatCurrency((item as Withdrawal).amount) },
                      { key: "paymentMethod", header: "طريقة الدفع", render: (item) => (item as Withdrawal).paymentMethod || "-" },
                      { key: "paymentDetails", header: "التفاصيل", render: (item) => (item as Withdrawal).paymentDetails || "-" },
                      { key: "createdAt", header: "تاريخ الطلب", render: (item) => formatDate((item as Withdrawal).createdAt) },
                      { key: "status", header: "الحالة", render: (item) => {
                        const s = (item as Withdrawal).status;
                        const colors: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };
                        const labels: Record<string, string> = { PENDING: "قيد الانتظار", APPROVED: "تمت الموافقة", REJECTED: "مرفوض" };
                        return <span className={`text-xs px-2 py-1 rounded-full ${colors[s] || ""}`}>{labels[s] || s}</span>;
                      }},
                      { key: "actions", header: "", render: (item) => {
                        const w = item as Withdrawal;
                        if (w.status !== "PENDING") return null;
                        return (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => { setWithdrawDialog({ id: w.id, action: "approve", adminNote: "" }); }}>
                              <Check className="h-4 w-4 ml-1" /> موافقة
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setWithdrawDialog({ id: w.id, action: "reject", adminNote: "" })}>
                              <X className="h-4 w-4 ml-1" /> رفض
                            </Button>
                          </div>
                        );
                      }},
                    ]}
                    data={withdrawalsList}
                    keyExtractor={(item) => item.id}
                  />
                </CardContent>
              </Card>
              {totalWithdrawalsPages > 1 && <Pagination currentPage={withdrawPage} totalPages={totalWithdrawalsPages} onPageChange={setWithdrawPage} />}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!withdrawDialog} onOpenChange={(open) => { if (!open) setWithdrawDialog(null); }}>
        <DialogContent title={withdrawDialog?.action === "approve" ? "تأكيد الموافقة على السحب" : "رفض طلب السحب"}>
          {withdrawDialog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1 block font-medium">ملاحظة (اختياري)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="أضف ملاحظة..."
                  value={withdrawDialog.adminNote}
                  onChange={(e) => setWithdrawDialog({ ...withdrawDialog, adminNote: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                {withdrawDialog.action === "approve" ? (
                  <Button className="flex-1" onClick={() => approveWithdrawal.mutate({ id: withdrawDialog.id, adminNote: withdrawDialog.adminNote || undefined })}>
                    <Check className="h-4 w-4 ml-2" /> تأكيد الموافقة
                  </Button>
                ) : (
                  <Button className="flex-1" variant="destructive" onClick={() => rejectWithdrawal.mutate({ id: withdrawDialog.id, adminNote: withdrawDialog.adminNote || undefined })}>
                    <X className="h-4 w-4 ml-2" /> تأكيد الرفض
                  </Button>
                )}
                <Button variant="outline" onClick={() => setWithdrawDialog(null)}>إلغاء</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={payoutDialog} onOpenChange={setPayoutDialog}>
        <DialogContent title="صرف مستحقات">
          {selectedUser && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="font-medium">{selectedUser.user?.name}</p>
                <p className="text-sm text-muted-foreground">الكود: {selectedUser.code}</p>
                {selectedUser.paypalEmail && <p className="text-sm text-muted-foreground">PayPal: {selectedUser.paypalEmail}</p>}
                {selectedUser.cryptoType && <p className="text-sm text-muted-foreground">{selectedUser.cryptoType} ({selectedUser.cryptoNetwork}): {selectedUser.cryptoAddress}</p>}
                {selectedUser.contactForPayment && <p className="text-sm text-muted-foreground">تواصل معنا</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">الأرباح</p><p className="font-medium">{formatCurrency(selectedUser.totalEarnings)}</p></div>
                <div><p className="text-muted-foreground">العمولة</p><p className="font-medium">{selectedUser.commissionRate * 100}%</p></div>
              </div>
              <Button className="w-full" onClick={() => processPayout.mutate(selectedUser.id)}>
                {processPayout.isPending ? "جارٍ الصرف..." : "تأكيد الصرف"}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialog(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent title="مراجعة الطلب">
          {selectedApp && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="font-medium">{selectedApp.user?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedApp.user?.email}</p>
                {selectedApp.fullName && <p className="text-sm mt-1">الاسم: {selectedApp.fullName}</p>}
                {selectedApp.phone && <p className="text-sm">التلفون: {selectedApp.phone}</p>}
                {selectedApp.country && <p className="text-sm">البلد: {selectedApp.country}</p>}
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">المنصات:</span></p>
                {Array.isArray(selectedApp.platforms) && selectedApp.platforms.map((p, i) => (
                  <p key={i} className="text-muted-foreground mr-4">• {p.name}: {p.url}</p>
                ))}
                <p><span className="font-medium">PayPal:</span> {selectedApp.paypalEmail || "-"}</p>
                {selectedApp.cryptoType && <p><span className="font-medium">كريبتو:</span> {selectedApp.cryptoType} ({selectedApp.cryptoNetwork}): {selectedApp.cryptoAddress}</p>}
                {selectedApp.contactForPayment && <p><span className="font-medium text-muted-foreground">تواصل معنا</span></p>}
                {selectedApp.note && <p><span className="font-medium">ملاحظة:</span> {selectedApp.note}</p>}
              </div>
              <div>
                <label className="text-sm mb-1 block font-medium">ملاحظة الإدارة (اختياري)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={selectedApp.status === "rejected" ? "سبب الرفض..." : selectedApp.status === "incomplete" ? "البيانات المطلوبة..." : "ملاحظة (اختياري)..."}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => {
                  reviewApp.mutate({ id: selectedApp.id, status: "rejected", adminNote: reviewNote || undefined });
                  setReviewNote("");
                }}>
                  <X className="h-4 w-4 ml-2" /> رفض
                </Button>
                <Button className="flex-1" variant="secondary" onClick={() => {
                  reviewApp.mutate({ id: selectedApp.id, status: "incomplete", adminNote: reviewNote || undefined });
                  setReviewNote("");
                }}>
                  استكمال بيانات
                </Button>
                <Button className="flex-1" onClick={() => {
                  reviewApp.mutate({ id: selectedApp.id, status: "approved" });
                  setReviewNote("");
                }}>
                  <Check className="h-4 w-4 ml-2" /> موافقة
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewDialog(false); setReviewNote(""); }}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={referralsDialog} onOpenChange={(open) => { setReferralsDialog(open); if (!open) setSelectedUser(null); }}>
        <DialogContent title="إحالات المسوق" description={selectedUser?.user?.name ? `إحالات: ${selectedUser.user.name}` : ""} className="max-w-3xl">
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{selectedUser.totalClicks}</p>
                  <p className="text-xs text-muted-foreground">الزيارات</p>
                </CardContent></Card>
                <Card><CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{selectedUser.totalReferrals}</p>
                  <p className="text-xs text-muted-foreground">الإحالات الناجحة</p>
                </CardContent></Card>
                <Card><CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{selectedUser.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">نسبة التحويل</p>
                </CardContent></Card>
              </div>

              {referralsLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : referralsList.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">لا توجد إحالات بعد</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-right p-2 font-medium">الاسم</th>
                        <th className="text-right p-2 font-medium">البريد</th>
                        <th className="text-right p-2 font-medium">تاريخ التسجيل</th>
                        <th className="text-right p-2 font-medium">البلد</th>
                        <th className="text-right p-2 font-medium">الرابط</th>
                        <th className="text-right p-2 font-medium">IP النقرة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralsList.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="p-2">{r.name || "-"}</td>
                          <td className="p-2 font-mono text-xs">{r.email}</td>
                          <td className="p-2 text-xs">{formatDate(r.registeredAt)}</td>
                          <td className="p-2">{r.country || r.clickCountry || "-"}</td>
                          <td className="p-2 font-mono text-xs">{r.linkCode}</td>
                          <td className="p-2 font-mono text-xs">{r.clickIp || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReferralsDialog(false); setSelectedUser(null); }}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
