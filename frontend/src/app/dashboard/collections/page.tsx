"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, uploadFile } from "@lib/api";
import Link from "next/link";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Switch } from "@components/ui/switch";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatRelativeDate } from "@lib/utils";
import { ROUTES } from "@lib/constants";
import {
  FolderKanban, Plus, Edit3, Trash2, Lock, Globe, Upload, Image,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  coverUrl: string | null;
  _count: { tools: number };
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formCoverUrl, setFormCoverUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["collections"],
    queryFn: () => api.get<{ data: Collection[] }>("/collections"),
  });

  const collections = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string; isPublic: boolean; coverUrl?: string }) =>
      api.post("/collections", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.put(`/collections/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setDeleteConfirmId(null);
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormIsPublic(true);
    setFormCoverUrl("");
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (col: Collection) => {
    setEditingId(col.id);
    setFormName(col.name);
    setFormDescription(col.description || "");
    setFormIsPublic(col.isPublic);
    setFormCoverUrl(col.coverUrl || "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    const body = {
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      isPublic: formIsPublic,
      coverUrl: formCoverUrl || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFormCoverUrl(url);
    } catch { /* ignore */ } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مجموعاتي</h1>
          <p className="text-muted-foreground mt-1">نظم أدواتك المفضلة في مجموعات</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-2" />
          مجموعة جديدة
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
        <DialogContent title={editingId ? "تعديل المجموعة" : "مجموعة جديدة"}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">الاسم</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="اسم المجموعة" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف (اختياري)</label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="وصف المجموعة" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">صورة الغلاف</label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input value={formCoverUrl} onChange={(e) => setFormCoverUrl(e.target.value)} dir="ltr" placeholder="URL الصورة" />
                </div>
                <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadCover} />
              </div>
              {formCoverUrl && (
                <img src={formCoverUrl} alt="" className="mt-2 h-20 w-32 object-cover rounded border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={formIsPublic} onCheckedChange={setFormIsPublic} />
              <span className="text-sm">مجموعة عامة</span>
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={!formName.trim() || isPending}>
                {isPending ? "..." : editingId ? "تحديث" : "إنشاء"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : collections.length === 0 ? (
        <EmptyState
          title="لا توجد مجموعات"
          message="أنشئ مجموعتك الأولى لتنظيم أدواتك المفضلة"
          action={{ label: "إنشاء مجموعة", onClick: openCreate }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Card key={col.id} className="group hover:border-primary/50 transition-colors overflow-hidden">
              {col.coverUrl && (
                <div className="h-28 bg-muted overflow-hidden">
                  <img src={col.coverUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <CardContent className={`p-5 ${col.coverUrl ? "" : "pt-5"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {col.coverUrl ? (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={col.coverUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).src = ""; }} />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link href={`/dashboard/collections/${col.slug}`} className="font-semibold hover:text-primary transition-colors truncate block">
                        {col.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{col._count?.tools ?? 0} أدوات</span>
                        {col.isPublic ? (
                          <span className="flex items-center gap-1"><Globe className="h-3 w-3" />عام</span>
                        ) : (
                          <span className="flex items-center gap-1"><Lock className="h-3 w-3" />خاص</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(col)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {deleteConfirmId === col.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => deleteMutation.mutate(col.id)}>تأكيد</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setDeleteConfirmId(null)}>إلغاء</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirmId(col.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {col.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{col.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>آخر تحديث {formatRelativeDate(col.updatedAt)}</span>
                  <Link href={`/dashboard/collections/${col.slug}`} className="flex items-center gap-1 text-primary hover:underline">
                    عرض <FolderKanban className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
