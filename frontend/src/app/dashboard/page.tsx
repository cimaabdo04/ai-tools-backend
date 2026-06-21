"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@stores/auth-store";
import { api } from "@lib/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { formatRelativeDate } from "@lib/utils";
import { useTools } from "@hooks/use-tools";
import {
  FileText,
  Bookmark,
  Star,
  FolderKanban,
  PlusCircle,
  Bell,
  ArrowRight,
  Clock,
  User,
  Eye,
  MessageSquare,
} from "lucide-react";
import { ROUTES } from "@lib/constants";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const recentActivity = [
  { id: "1", type: "submission", message: "تمت الموافقة على الأداة 'ChatGPT Writer'", time: new Date(Date.now() - 3600000) },
  { id: "2", type: "review", message: "قيمت 'Midjourney AI'", time: new Date(Date.now() - 7200000) },
  { id: "3", type: "bookmark", message: "أضفت 'Runway ML' للمفضلة", time: new Date(Date.now() - 86400000) },
  { id: "4", type: "collection", message: "تم تحديث مجموعة 'Design Tools'", time: new Date(Date.now() - 172800000) },
];

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();

  const { data: notifData } = useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: () => api.get<{ data: { data: NotificationItem[]; meta: { total: number; unreadCount: number } } }>("/notifications", { params: { take: 3 } }),
    enabled: !!user,
  });

  const { data: toolsData } = useTools({ page: 1, perPage: 1 });

  const { data: toolsViewsData } = useQuery({
    queryKey: ["dashboard", "tools-views"],
    queryFn: () => api.get<{ data: { meta: { total: number } } }>("/tools", { params: { take: 1, sort: "popular" } }),
  });

  const notifications = notifData?.data?.data || [];
  const unreadCount = notifData?.data?.meta?.unreadCount || 0;
  const totalTools = toolsData?.meta?.total ?? 0;
  const totalViews = toolsViewsData?.data?.meta?.total ?? 0;

  const quickStats = [
    { label: "إجمالي الأدوات", value: totalTools, icon: FileText, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "إجمالي المشاهدات", value: totalViews, icon: Eye, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
    { label: "عدد التصنيفات", value: 13, icon: FolderKanban, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "التقييمات", value: 0, icon: Star, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          مرحباً بعودتك، {user?.name ?? "..."} 👋
        </h1>
        <p className="text-muted-foreground mt-1">نظرة عامة</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              آخر النشاطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">لا توجد نشاطات حديثة</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={ROUTES.DASHBOARD_SUBMIT}>
                  <PlusCircle className="h-4 w-4 ml-2" />
                  إضافة أداة جديدة
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={ROUTES.DASHBOARD_TOOLS}>
                  <FileText className="h-4 w-4 ml-2" />
                  أدواتي
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={ROUTES.DASHBOARD_BOOKMARKS}>
                  <Bookmark className="h-4 w-4 ml-2" />
                  مفضلتي
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={ROUTES.DASHBOARD_PROFILE}>
                  <User className="h-4 w-4 ml-2" />
                  تعديل الملف الشخصي
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                الإشعارات
                {unreadCount > 0 && (
                  <Badge className="h-4 min-w-[18px] text-[10px]">{unreadCount}</Badge>
                )}
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.DASHBOARD_NOTIFICATIONS}>
                  عرض الكل <ArrowRight className="h-3 w-3 mr-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات</p>
              ) : (
                notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{n.title}</p>
                        {!n.isRead && <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
