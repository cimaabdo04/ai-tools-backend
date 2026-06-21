"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { formatRelativeDate } from "@lib/utils";
import {
  Grid3X3, Users, Star, Plus, Eye, FileText, Settings, ArrowUp, ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@lib/constants";

interface AdminStats {
  totalTools: number;
  totalUsers: number;
  totalReviews: number;
  toolsChange: number;
  usersChange: number;
  reviewsChange: number;
  recentTools: { id: string; name: string; status: string; category: string; createdAt: string }[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
}

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  approved: { label: "مقبول", variant: "success" },
  pending: { label: "معلق", variant: "warning" },
  rejected: { label: "مرفوض", variant: "secondary" },
  draft: { label: "مسودة", variant: "secondary" },
};

export default function AdminOverview() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<{ data: { stats: AdminStats } }>("/admin/dashboard"),
  });

  if (isLoading) return <AdminOverviewSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const stats = data?.data?.stats;

  if (!stats) return <EmptyState />;

  const statCards = [
    { label: "إجمالي الأدوات", value: stats.totalTools.toLocaleString(), change: stats.toolsChange, icon: Grid3X3, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "إجمالي المستخدمين", value: stats.totalUsers.toLocaleString(), change: stats.usersChange, icon: Users, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "إجمالي التقييمات", value: stats.totalReviews.toLocaleString(), change: stats.reviewsChange, icon: Star, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">الرئيسية</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">نظرة عامة</h1>
          <p className="text-sm text-muted-foreground">إحصائيات وأدوات إدارة الموقع</p>
        </div>
        <Button asChild>
          <Link href="/admin/tools/new">
            <Plus className="h-4 w-4 ml-2" />
            إضافة أداة
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(stat.change)}%
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أحدث الأدوات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-right font-medium">الاسم</th>
                    <th className="p-3 text-center font-medium hidden sm:table-cell">الحالة</th>
                    <th className="p-3 text-center font-medium hidden sm:table-cell">التصنيف</th>
                    <th className="p-3 text-center font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTools.map((tool) => (
                    <tr key={tool.id} className="border-b hover:bg-muted/10">
                      <td className="p-3 font-medium">{tool.name}</td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <Badge variant={statusMap[tool.status]?.variant || "secondary"} className="text-[10px]">
                          {statusMap[tool.status]?.label || tool.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-muted-foreground text-xs hidden sm:table-cell">
                        {tool.category || "—"}
                      </td>
                      <td className="p-3 text-center text-xs text-muted-foreground">
                        {formatRelativeDate(tool.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">أحدث المستخدمين</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا يوجد مستخدمين بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 text-right font-medium">الاسم</th>
                      <th className="p-3 text-right font-medium hidden sm:table-cell">البريد</th>
                      <th className="p-3 text-center font-medium hidden sm:table-cell">الدور</th>
                      <th className="p-3 text-center font-medium">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/10">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{u.email}</td>
                        <td className="p-3 text-center hidden sm:table-cell">
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                            {u.role === "admin" ? "مشرف" : "مستخدم"}
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-xs text-muted-foreground">{formatRelativeDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/tools">
                <Eye className="h-4 w-4 ml-2" />
                عرض الأدوات
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/tools/new">
                <Plus className="h-4 w-4 ml-2" />
                إضافة أداة
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/reports">
                <FileText className="h-4 w-4 ml-2" />
                التقارير
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24 mt-3" />
              <Skeleton className="h-8 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">حدث خطأ في تحميل البيانات</p>
      <Button onClick={onRetry}>إعادة المحاولة</Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">لا توجد بيانات</p>
    </div>
  );
}
