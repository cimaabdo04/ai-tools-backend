"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, uploadFile, deleteUpload } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { RichTextEditor } from "@components/ui/rich-text-editor";
import { Switch } from "@components/ui/switch";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Plus, Pencil, Trash2, ImageUp } from "lucide-react";
import { formatDate } from "@lib/utils";
import { useTranslations } from "next-intl";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export default function AdminBlog() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    coverImage: "", seoTitle: "", seoDescription: "", published: false,
  });

  const { data: raw, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "blog", page],
    queryFn: () =>
      api.get<{ data: { posts: BlogPost[]; total: number; totalPages: number } }>("/admin/cms/blog", {
        params: { page },
      }),
  });
  const data = raw?.data;

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post("/admin/cms/blog", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      setDialogOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/admin/cms/blog/${id}`, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm({ ...form, coverImage: url });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const oldUrl = form.coverImage;
    setForm({ ...form, coverImage: "" });
    if (oldUrl && oldUrl.includes("/upload/")) {
      try { await deleteUpload(oldUrl); } catch {}
    }
  };

  const openNew = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", seoTitle: "", seoDescription: "", published: false });
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    router.push(`/admin/cms/blog/${post.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.blog")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.blogDescription")}</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addPost")}
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.posts.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "title", header: t("admin.title"), sortable: true },
                  { key: "excerpt", header: t("admin.excerpt"), render: (item) => (
                    <span className="text-sm text-muted-foreground truncate block max-w-xs">
                      {item.excerpt as string}
                    </span>
                  )},
                  { key: "coverImage", header: t("admin.image"), render: (item) => item.coverImage
                    ? <Badge variant="outline" className="text-xs">✓</Badge>
                    : <span className="text-xs text-muted-foreground">—</span>
                  },
                  { key: "published", header: t("admin.status"), render: (item) => item.published
                    ? <Badge variant="success">{t("admin.published")}</Badge>
                    : <Badge variant="secondary">{t("admin.draft")}</Badge>
                  },
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item as unknown as BlogPost)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        {t("admin.edit")}
                      </Button>
                      <Switch
                        checked={item.published as boolean}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: (item as BlogPost).id, published: checked })}
                      />
                    </div>
                  )},
                ]}
                data={data.posts}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={t("admin.createPost")} className="max-w-2xl">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("admin.title")}</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t("admin.slug")}</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.excerpt")}</label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.content")}</label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="اكتب المحتوى..."
                minHeight={300}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="text-sm font-medium">الصورة الرئيسية</label>
              {form.coverImage ? (
                <div className="mt-2 relative rounded-lg overflow-hidden border bg-muted group">
                  <img
                    src={form.coverImage}
                    alt="Cover"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف الصورة
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition bg-muted/30">
                  <ImageUp className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "جاري الرفع..." : "اضغط لرفع صورة"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">{t("admin.seoFields")}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">{t("admin.seoTitle")}</label>
                  <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("admin.seoDescription")}</label>
                  <Textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={2} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.cancel")}</Button>
            <Button
              onClick={() => saveMutation.mutate({ ...form, coverImage: form.coverImage || undefined })}
            >
              {t("admin.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
