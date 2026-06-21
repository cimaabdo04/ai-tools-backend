"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatRelativeDate } from "@lib/utils";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface PendingEdit {
  id: string;
  tool: { id: string; name: string };
  user: { id: string; name: string };
  changes: Record<string, { old: unknown; new: unknown }>;
  status: string;
  createdAt: string;
}

export default function AdminEdits() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedEdit, setSelectedEdit] = useState<PendingEdit | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "edits", page],
    queryFn: () =>
      api.get<{ edits: PendingEdit[]; total: number; totalPages: number }>("/admin/edits", {
        params: { page },
      }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.post(`/admin/edits/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "edits"] });
      setReviewOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.pendingEdits")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.editsDescription")}</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.edits.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "tool", header: t("admin.tool"), sortable: true, render: (item) => (item.tool as { name: string })?.name },
                  { key: "user", header: t("admin.user"), sortable: true, render: (item) => (item.user as { name: string })?.name },
                  { key: "changes", header: t("admin.changes"), render: (item) => `${Object.keys(item.changes as Record<string, unknown>).length} field(s) changed` },
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatRelativeDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <Button size="sm" variant="outline" onClick={() => { setSelectedEdit(item as unknown as PendingEdit); setReviewOpen(true); }}>
                      {t("admin.review")}
                    </Button>
                  )},
                ]}
                data={data.edits}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent title={t("admin.reviewChanges")} className="max-w-2xl">
          {selectedEdit && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-3">
                <p className="font-medium">{(selectedEdit.tool as { name: string })?.name}</p>
                <p className="text-sm text-muted-foreground">{t("admin.editedBy")} {(selectedEdit.user as { name: string })?.name}</p>
              </div>
              <div className="space-y-3">
                {Object.entries(selectedEdit.changes).map(([field, change]) => (
                  <div key={field} className="rounded-md border p-3">
                    <p className="text-sm font-medium mb-2">{field}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("admin.oldValue")}</p>
                        <p className="text-sm bg-destructive/10 p-2 rounded">{String(change.old ?? "-")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("admin.newValue")}</p>
                        <p className="text-sm bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">{String(change.new ?? "-")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => editMutation.mutate({ id: selectedEdit.id, action: "approve" })}>
                  <Check className="h-4 w-4 mr-2" />
                  {t("admin.approve")}
                </Button>
                <Button variant="destructive" onClick={() => editMutation.mutate({ id: selectedEdit.id, action: "reject" })}>
                  <X className="h-4 w-4 mr-2" />
                  {t("admin.reject")}
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
