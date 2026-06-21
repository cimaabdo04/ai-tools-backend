"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { DataTable } from "@components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Plus, Pencil, Trash2, Merge } from "lucide-react";
import { useTranslations } from "next-intl";

interface Tag {
  id: string;
  name: string;
  slug: string;
  toolCount: number;
}

export default function AdminTags() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [mergeFrom, setMergeFrom] = useState("");
  const [mergeInto, setMergeInto] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: () => api.get<{ tags: Tag[] }>("/admin/tags"),
  });

  const saveMutation = useMutation({
    mutationFn: (body: { name: string; id?: string }) =>
      body.id
        ? api.put(`/admin/tags/${body.id}`, body)
        : api.post("/admin/tags", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      setDeleteOpen(false);
    },
  });

  const mergeMutation = useMutation({
    mutationFn: (body: { fromId: string; intoId: string }) =>
      api.post("/admin/tags/merge", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      setMergeOpen(false);
      setMergeFrom("");
      setMergeInto("");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.tags")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.tagsDescription")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMergeOpen(true)}>
            <Merge className="h-4 w-4 mr-2" />
            {t("admin.mergeTags")}
          </Button>
          <Button onClick={() => { setEditing(null); setForm({ name: "" }); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.addTag")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.tags.length ? (
        <EmptyState />
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: "name", header: t("admin.name"), sortable: true },
                { key: "slug", header: t("admin.slug"), sortable: true },
                { key: "toolCount", header: t("admin.toolsCount"), sortable: true,
                  render: (item) => <Badge variant="secondary">{item.toolCount as number}</Badge> },
                { key: "actions", header: "", render: (item) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditing(item as unknown as Tag);
                      setForm({ name: (item as Tag).name });
                      setDialogOpen(true);
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setDeleteId((item as Tag).id);
                      setDeleteOpen(true);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )},
              ]}
              data={data.tags}
              keyExtractor={(item) => item.id}
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editing ? t("admin.editTag") : t("admin.createTag")}>
          <div>
            <label className="text-sm font-medium">{t("admin.name")}</label>
            <Input value={form.name} onChange={(e) => setForm({ name: e.target.value })} />
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.cancel")}</Button>
            <Button onClick={() => saveMutation.mutate(editing ? { ...form, id: editing.id } : form)}>
              {editing ? t("admin.save") : t("admin.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent title={t("admin.mergeTags")} description={t("admin.mergeTagsDescription")}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("admin.sourceTag")}</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={mergeFrom}
                onChange={(e) => setMergeFrom(e.target.value)}
              >
                <option value="">{t("admin.selectTag")}</option>
                {(data?.tags ?? []).map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name} ({tag.toolCount})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.targetTag")}</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={mergeInto}
                onChange={(e) => setMergeInto(e.target.value)}
              >
                <option value="">{t("admin.selectTag")}</option>
                {(data?.tags ?? []).map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name} ({tag.toolCount})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setMergeOpen(false)}>{t("admin.cancel")}</Button>
            <Button
              onClick={() => mergeMutation.mutate({ fromId: mergeFrom, intoId: mergeInto })}
              disabled={!mergeFrom || !mergeInto || mergeFrom === mergeInto}
            >
              {t("admin.merge")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent title={t("admin.confirmDelete")} description={t("admin.tagDeleteWarning")}>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t("admin.cancel")}</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {t("admin.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
