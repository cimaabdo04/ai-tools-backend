"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api, uploadFile, deleteUpload } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { RichTextEditor } from "@components/ui/rich-text-editor";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { useToast } from "@components/ui/use-toast";
import { Save, ArrowLeft, Trash2, ImageUp, Video } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  videoUrl?: string | null;
  published: boolean;
  authorName: string;
  tags: string;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditBlogPost() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    coverImage: "", videoUrl: "", tags: "", seoTitle: "", seoDescription: "", published: false,
  });

  const { data: raw, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: async () => {
      const res = await api.get<{ data: BlogPost }>(`/admin/cms/blog/${id}`);
      const post = res?.data;
      if (post) {
        const tags = typeof post.tags === "string" ? post.tags : JSON.stringify(post.tags || []);
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          content: post.content,
          coverImage: post.coverImage || "",
          videoUrl: post.videoUrl || "",
          tags: tags === "[]" ? "" : tags.replace(/[\[\]"]/g, ""),
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          published: post.published,
        });
      }
      return res;
    },
  });

  const post = raw?.data;

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put(`/admin/cms/blog/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast({ title: "تم حفظ المقال بنجاح", variant: "success" });
      router.push("/admin/cms/blog");
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء حفظ المقال", variant: "error" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm({ ...form, coverImage: url });
    } catch {
      toast({ title: "فشل رفع الصورة", variant: "error" });
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

  const handleSave = () => {
    const tags = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    saveMutation.mutate({
      ...form,
      tags,
      coverImage: form.coverImage || undefined,
      videoUrl: form.videoUrl || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !post) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cms/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">تعديل المقال</h1>
            <p className="text-sm text-muted-foreground">
              {post.title} &middot; آخر تحديث: {new Date(post.updatedAt).toLocaleDateString("ar-EG")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/cms/blog">إلغاء</Link>
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 ml-2" />
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ المقال"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">عنوان المقال</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">الرابط (Slug)</label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium">الوسوم (Tags)</label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">الملخص</label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">محتوى المقال</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  placeholder="اكتب محتوى المقال هنا..."
                  minHeight={400}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm">إعدادات SEO</h3>
              <div>
                <label className="text-sm font-medium">عنوان SEO</label>
                <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">وصف SEO</label>
                <Textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm">نشر</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm">حالة النشر</label>
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${form.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {form.published ? "منشور" : "مسودة"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, published: !form.published })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.published ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.published ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <p className="text-xs text-muted-foreground">
                {form.published ? "المقال منشور ومرئي للجميع" : "المقال غير منشور (مسودة)"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm">الصورة الرئيسية</h3>
              {form.coverImage ? (
                <div className="relative rounded-lg overflow-hidden border bg-muted group">
                  <img src={form.coverImage} alt="Cover" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                    <Button size="sm" variant="destructive" className="opacity-0 group-hover:opacity-100 transition" onClick={handleRemoveImage}>
                      <Trash2 className="h-4 w-4 ml-1" /> حذف
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition bg-muted/30">
                  <ImageUp className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">{uploading ? "جاري الرفع..." : "اضغط لرفع صورة"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Video */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Video className="h-4 w-4" /> فيديو المقال
              </h3>
              {form.videoUrl && (
                <div className="rounded-lg overflow-hidden border bg-muted">
                  {form.videoUrl.includes("youtube") || form.videoUrl.includes("youtu.be") ? (
                    <iframe
                      src={form.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/").split("&")[0]}
                      className="w-full aspect-video"
                      allowFullScreen
                    />
                  ) : (
                    <video src={form.videoUrl} controls className="w-full" />
                  )}
                </div>
              )}
              <Input dir="ltr" placeholder="رابط يوتيوب" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
              <label className="flex items-center justify-center h-10 rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition bg-muted/30 text-sm text-muted-foreground">
                <Video className="h-4 w-4 ml-2" /> رفع فيديو
                <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try { const url = await uploadFile(file); setForm({ ...form, videoUrl: url }); }
                  catch { toast({ title: "فشل رفع الفيديو", variant: "error" }); }
                }} />
              </label>
            </CardContent>
          </Card>

          {/* Post Info */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-medium text-sm">معلومات المقال</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الكاتب</span>
                  <span>{post.authorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المشاهدات</span>
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الإنشاء</span>
                  <span>{new Date(post.createdAt).toLocaleDateString("ar-EG")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
