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
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatRelativeDate } from "@lib/utils";
import { useTranslations } from "next-intl";

interface Report {
  id: string;
  reason: string;
  details?: string;
  status: string;
  reporter: { id: string; name: string };
  reportedTool: { id: string; name: string };
  createdAt: string;
}

export default function AdminReports() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "reports", page, statusFilter],
    queryFn: () =>
      api.get<{ reports: Report[]; total: number; totalPages: number }>("/admin/reports", {
        params: { page, status: statusFilter || undefined },
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/reports/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setReviewOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.reports")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.reportsDescription")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Select
              options={[
                { value: "", label: t("admin.allStatus") },
                { value: "pending", label: t("admin.pending") },
                { value: "investigating", label: t("admin.investigating") },
                { value: "resolved", label: t("admin.resolved") },
                { value: "dismissed", label: t("admin.dismissed") },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.reports.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "reportedTool", header: t("admin.tool"), render: (item) => (item.reportedTool as { name: string })?.name },
                  { key: "reporter", header: t("admin.reporter"), render: (item) => (item.reporter as { name: string })?.name },
                  { key: "reason", header: t("admin.reason"), sortable: true },
                  { key: "status", header: t("admin.status"), sortable: true, render: (item) => {
                    const v: Record<string, "warning" | "info" | "success" | "secondary"> = {
                      pending: "warning", investigating: "info", resolved: "success", dismissed: "secondary",
                    };
                    return <Badge variant={v[item.status as string] || "secondary"}>{item.status as string}</Badge>;
                  }},
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatRelativeDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <Button size="sm" variant="outline" onClick={() => { setSelectedReport(item as unknown as Report); setReviewOpen(true); }}>
                      {t("admin.review")}
                    </Button>
                  )},
                ]}
                data={data.reports}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent title={t("admin.reviewReport")} className="max-w-xl">
          {selectedReport && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium">{t("admin.reportedTool")}: {(selectedReport.reportedTool as { name: string })?.name}</p>
                <p className="text-sm font-medium mt-2">{t("admin.reporter")}: {(selectedReport.reporter as { name: string })?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("admin.reason")}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
              </div>
              {selectedReport.details && (
                <div>
                  <p className="text-sm font-medium">{t("admin.details")}</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.details}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => updateMutation.mutate({ id: selectedReport.id, status: "investigating" })}>
                  {t("admin.markInvestigating")}
                </Button>
                <Button variant="default" onClick={() => updateMutation.mutate({ id: selectedReport.id, status: "resolved" })}>
                  {t("admin.markResolved")}
                </Button>
                <Button variant="outline" onClick={() => updateMutation.mutate({ id: selectedReport.id, status: "dismissed" })}>
                  {t("admin.dismiss")}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>{t("admin.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
