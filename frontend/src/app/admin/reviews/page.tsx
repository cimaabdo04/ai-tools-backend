"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Star, Trash2, Check } from "lucide-react";
import { formatRelativeDate } from "@lib/utils";
import { useDebounce } from "@hooks/use-debounce";
import { useTranslations } from "next-intl";

interface AdminReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  tool: { id: string; name: string; slug: string };
  user: { id: string; name: string; email: string };
  flagged: boolean;
  flagReason?: string;
  createdAt: string;
}

export default function AdminReviews() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [flaggedFilter, setFlaggedFilter] = useState("");
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "reviews", page, debouncedSearch, ratingFilter, flaggedFilter],
    queryFn: () =>
      api.get<{ reviews: AdminReview[]; total: number; totalPages: number }>("/admin/reviews", {
        params: {
          page,
          search: debouncedSearch || undefined,
          rating: ratingFilter || undefined,
          flagged: flaggedFilter || undefined,
        },
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}`, { flagged: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.reviews")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.reviewsDescription")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder={t("admin.searchReviews")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: "", label: t("admin.allRatings") },
                { value: "5", label: "5 Stars" },
                { value: "4", label: "4 Stars" },
                { value: "3", label: "3 Stars" },
                { value: "2", label: "2 Stars" },
                { value: "1", label: "1 Star" },
              ]}
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            />
            <Select
              options={[
                { value: "", label: t("admin.allReviews") },
                { value: "true", label: t("admin.flagged") },
                { value: "false", label: t("admin.unflagged") },
              ]}
              value={flaggedFilter}
              onChange={(e) => { setFlaggedFilter(e.target.value); setPage(1); }}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.reviews.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "tool", header: t("admin.tool"), sortable: true, render: (item) => (item.tool as { name: string })?.name },
                  { key: "user", header: t("admin.user"), sortable: true, render: (item) => (item.user as { name: string })?.name },
                  { key: "rating", header: t("admin.rating"), sortable: true, render: (item) => (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Number(item.rating) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )},
                  { key: "title", header: t("admin.title"), sortable: true },
                  { key: "flagged", header: t("admin.flagged"), render: (item) => item.flagged ? <Badge variant="destructive">{t("admin.flagged")}</Badge> : null },
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatRelativeDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedReview(item as unknown as AdminReview); setDetailOpen(true); }}>
                        {t("admin.view")}
                      </Button>
                      {(item.flagged as boolean) && (
                        <Button size="sm" variant="ghost" onClick={() => approveMutation.mutate((item as AdminReview).id)}>
                          <Check className="h-4 w-4 text-emerald-500" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate((item as AdminReview).id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )},
                ]}
                data={data.reviews}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent title={t("admin.reviewDetails")} className="max-w-xl">
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: selectedReview.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div>
                <p className="font-semibold">{selectedReview.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedReview.content}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{t("admin.by")} {selectedReview.user.name} ({selectedReview.user.email})</p>
                <p>{t("admin.on")} {selectedReview.tool.name}</p>
                <p>{formatRelativeDate(selectedReview.createdAt)}</p>
              </div>
              {selectedReview.flagged && selectedReview.flagReason && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive">{t("admin.flagReason")}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.flagReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t("admin.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
