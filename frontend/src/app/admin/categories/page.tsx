"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  toolCount: number;
  sortOrder: number;
}

export default function AdminCategories() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "" });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get<{ categories: Category[] }>("/admin/categories"),
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof form & { id?: string }) =>
      body.id
        ? api.put(`/admin/categories/${body.id}`, body)
        : api.post("/admin/categories", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "", description: "", icon: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setDeleteOpen(false);
      setDeleteId(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orders: { id: string; sortOrder: number }[]) =>
      api.post("/admin/categories/reorder", { orders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.categories")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.categoriesDescription")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addCategory")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.categories.length ? (
        <EmptyState />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.categories.map((cat, index) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground truncate">{cat.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">{cat.toolCount} tools</Badge>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeleteId(cat.id);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title={editing ? t("admin.editCategory") : t("admin.createCategory")}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("admin.name")}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("admin.categoryNamePlaceholder")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.description")}</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button
              onClick={() =>
                saveMutation.mutate(editing ? { ...form, id: editing.id } : form)
              }
            >
              {editing ? t("admin.save") : t("admin.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          title={t("admin.confirmDelete")}
          description={t("admin.categoryDeleteWarning")}
        >
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {t("admin.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
