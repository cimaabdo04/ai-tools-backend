"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { DataTable } from "@components/ui/data-table";
import { Chart } from "@components/ui/chart";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { formatCurrency } from "@lib/utils";
import { Download, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalTools: number;
    totalRevenue: number;
    totalViews: number;
    activeUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  trafficSources: { name: string; value: number }[];
  geoData: { country: string; users: number; percentage: number }[];
  userGrowth: { month: string; users: number }[];
  revenueData: { month: string; revenue: number }[];
  topTools: { id: string; name: string; views: number; clicks: number; rating: number }[];
}

export default function AdminAnalytics() {
  const t = useTranslations();
  const [dateRange, setDateRange] = useState("30d");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "analytics", dateRange],
    queryFn: () =>
      api.get<{ analytics: AnalyticsData }>("/admin/analytics", {
        params: { period: dateRange },
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.analytics")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.analyticsDescription")}</p>
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "7d", label: t("admin.last7Days") },
              { value: "30d", label: t("admin.last30Days") },
              { value: "90d", label: t("admin.last90Days") },
              { value: "1y", label: t("admin.lastYear") },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("admin.exportCSV")}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("admin.exportPDF")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
            ))}
          </div>
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.analytics ? null : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{t("admin.totalUsers")}</p>
                <p className="text-2xl font-bold">{data.analytics.overview.totalUsers.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{t("admin.totalTools")}</p>
                <p className="text-2xl font-bold">{data.analytics.overview.totalTools.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{t("admin.totalRevenue")}</p>
                <p className="text-2xl font-bold">{formatCurrency(data.analytics.overview.totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{t("admin.totalViews")}</p>
                <p className="text-2xl font-bold">{data.analytics.overview.totalViews.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{t("admin.bounceRate")}</p>
                <p className="text-2xl font-bold">{data.analytics.overview.bounceRate}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.trafficSources")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart type="pie" data={data.analytics.trafficSources} xKey="name" yKey="value" height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.geoDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    { key: "country", header: t("admin.country"), sortable: true },
                    { key: "users", header: t("admin.users"), sortable: true },
                    { key: "percentage", header: "%", sortable: true, render: (item) => `${item.percentage}%` },
                  ]}
                  data={data.analytics.geoData}
                  keyExtractor={(item) => item.country}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.userGrowth")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart type="area" data={data.analytics.userGrowth} xKey="month" yKey="users" height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.revenue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart type="bar" data={data.analytics.revenueData} xKey="month" yKey="revenue" height={300} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.topPerformingTools")}</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "name", header: t("admin.tool"), sortable: true },
                  { key: "views", header: t("admin.views"), sortable: true },
                  { key: "clicks", header: t("admin.clicks"), sortable: true },
                  { key: "rating", header: t("admin.rating"), sortable: true, render: (item) => Number(item.rating).toFixed(1) },
                ]}
                data={data.analytics.topTools}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
