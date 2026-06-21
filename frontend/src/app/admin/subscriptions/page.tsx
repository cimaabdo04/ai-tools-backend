"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Select } from "@components/ui/select";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatDate, formatCurrency } from "@lib/utils";
import { useTranslations } from "next-intl";

interface Subscription {
  id: string;
  user: { id: string; name: string; email: string };
  plan: { id: string; name: string };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export default function AdminSubscriptions() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "subscriptions", page, planFilter],
    queryFn: () =>
      api.get<{ subscriptions: Subscription[]; total: number; totalPages: number }>(
        "/admin/subscriptions",
        { params: { page, planId: planFilter || undefined } }
      ),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/subscriptions/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.subscriptions")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.subscriptionsDescription")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Select
            options={[
              { value: "", label: t("admin.allPlans") },
              { value: "active", label: "Active" },
              { value: "canceled", label: "Canceled" },
              { value: "past_due", label: "Past Due" },
              { value: "trialing", label: "Trialing" },
            ]}
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.subscriptions.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "user", header: t("admin.user"), render: (item) => (item.user as { name: string })?.name },
                  { key: "plan", header: t("admin.plan"), render: (item) => (item.plan as { name: string })?.name },
                  { key: "status", header: t("admin.status"), sortable: true, render: (item) => {
                    const v: Record<string, "success" | "destructive" | "warning" | "info"> = {
                      active: "success", canceled: "destructive", past_due: "warning", trialing: "info",
                    };
                    return <Badge variant={v[item.status as string] || "secondary"}>{item.status as string}</Badge>;
                  }},
                  { key: "currentPeriodEnd", header: t("admin.renews"), render: (item) => formatDate(item.currentPeriodEnd as string) },
                  { key: "cancelAtPeriodEnd", header: t("admin.cancelAtEnd"), render: (item) => item.cancelAtPeriodEnd ? <Badge variant="warning">{t("admin.yes")}</Badge> : <Badge variant="secondary">{t("admin.no")}</Badge> },
                  { key: "actions", header: "", render: (item) => (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelMutation.mutate((item as Subscription).id)}
                      disabled={(item as Subscription).status === "canceled"}
                    >
                      {t("admin.cancel")}
                    </Button>
                  )},
                ]}
                data={data.subscriptions}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
