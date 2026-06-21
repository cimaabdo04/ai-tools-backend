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
import { Check, X, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Claim {
  id: string;
  tool: { id: string; name: string; slug: string };
  claimant: { id: string; name: string; email: string };
  evidence: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminClaims() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "claims", page, statusFilter],
    queryFn: () =>
      api.get<{ claims: Claim[]; total: number; totalPages: number }>("/admin/claims", {
        params: { page, status: statusFilter || undefined },
      }),
  });

  const claimMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: string; notes?: string }) =>
      api.post(`/admin/claims/${id}/${action}`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "claims"] });
      setReviewOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.claims")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.claimsDescription")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Select
            options={[
              { value: "", label: t("admin.allStatus") },
              { value: "pending", label: t("admin.pending") },
              { value: "approved", label: t("admin.approved") },
              { value: "rejected", label: t("admin.rejected") },
            ]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.claims.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "tool", header: t("admin.tool"), render: (item) => (
                    <Link href={`/admin/tools/${(item.tool as { id: string })?.id}`} className="font-medium hover:text-primary">
                      {(item.tool as { name: string })?.name}
                    </Link>
                  )},
                  { key: "claimant", header: t("admin.claimant"), render: (item) => (item.claimant as { name: string })?.name },
                  { key: "status", header: t("admin.status"), sortable: true, render: (item) => {
                    const v: Record<string, "warning" | "success" | "destructive"> = { pending: "warning", approved: "success", rejected: "destructive" };
                    return <Badge variant={v[item.status as string] || "secondary"}>{item.status as string}</Badge>;
                  }},
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatRelativeDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedClaim(item as unknown as Claim); setReviewOpen(true); }}>
                        {t("admin.review")}
                      </Button>
                    </div>
                  )},
                ]}
                data={data.claims}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent title={t("admin.reviewClaim")} className="max-w-xl">
          {selectedClaim && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="font-medium">{(selectedClaim.tool as { name: string })?.name}</p>
                <p className="text-sm text-muted-foreground">{t("admin.claimedBy")} {(selectedClaim.claimant as { name: string })?.name} ({(selectedClaim.claimant as { email: string })?.email})</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("admin.evidence")}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedClaim.evidence}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => claimMutation.mutate({ id: selectedClaim.id, action: "approve" })}>
                  <Check className="h-4 w-4 mr-2" />
                  {t("admin.approve")}
                </Button>
                <Button variant="destructive" onClick={() => claimMutation.mutate({ id: selectedClaim.id, action: "reject" })}>
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
