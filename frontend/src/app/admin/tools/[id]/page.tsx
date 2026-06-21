"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api, uploadFile, deleteUpload } from "@lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { RichTextEditor } from "@components/ui/rich-text-editor";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { Chart } from "@components/ui/chart";
import { formatDate } from "@lib/utils";
import { FaqManager } from "@components/tools/faq-manager";
import { Save, ArrowLeft, ExternalLink, X, Plus, Upload, Image, Hash, CheckSquare, Github, Globe, DollarSign, Search, Linkedin, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const pricingOptions = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "contact", label: "Contact" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

const platformOptions = ["Web", "iOS", "Android", "Mac", "Windows", "Linux", "Chrome", "API", "CLI", "Desktop"];

function ImageUpload({ value, onChange, label }: { value?: string | null; onChange: (url: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL أو استخدم زر الرفع"
            dir="ltr"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-20 w-20 object-contain rounded border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}
    </div>
  );
}

function GalleryUpload({ value, onChange, label }: { value: string; onChange: (json: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const images: string[] = (() => { try { return JSON.parse(value || '[]'); } catch { return []; } })();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        urls.push(url);
      }
      onChange(JSON.stringify([...images, ...urls]));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = async (idx: number) => {
    const img = images[idx];
    if (img && img.includes("/upload/")) {
      try { await deleteUpload(img); } catch {}
    }
    onChange(JSON.stringify(images.filter((_, i) => i !== idx)));
  };

  const addUrl = () => {
    const url = prompt("أدخل رابط الصورة:");
    if (url) onChange(JSON.stringify([...images, url]));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 mb-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Upload className="h-4 w-4 ml-1" />}
          {uploading ? "جاري الرفع..." : "رفع صور"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addUrl}>
          + إضافة رابط
        </Button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="h-20 w-20 object-cover rounded border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      {images.length === 0 && <p className="text-xs text-muted-foreground">لم تتم إضافة أي صور بعد</p>}
    </div>
  );
}

export default function AdminToolDetail() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "tool", id],
    queryFn: () => api.get<{ tool: any }>(`/admin/tools/${id}`),
    enabled: !!id,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get<{ categories: { id: string; name: string }[] }>("/admin/categories"),
  });

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get<{ data: { id: string; name: string }[] }>("/tags?includeInactive=true"),
  });

  const [form, setForm] = useState<Record<string, any>>({});
  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch(`/admin/tools/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tool", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
    },
  });

  const saveAll = () => {
    if (Object.keys(form).length > 0) {
      updateMutation.mutate(form);
    }
  };

  const setFormField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={refetch} />;
  const rawTool = (data as any)?.data?.tool;
  if (!rawTool) return null;

  const tool = rawTool;
  const tagsList = (tagsQuery.data as any)?.data || [];
  const categoriesList = (categoriesQuery.data as any)?.data?.categories || [];

  const currentTags = form.tags !== undefined ? form.tags : tool.tags;
  const currentFeatures = form.features !== undefined ? form.features : tool.features || [];
  const currentPlatforms = form.platforms !== undefined ? form.platforms : tool.platforms || [];

  const parseArr = (v: any): string[] => { if (Array.isArray(v)) return v; if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } } return []; };
  const currentPros: string[] = form.pros !== undefined ? form.pros : parseArr(tool.pros);
  const currentCons: string[] = form.cons !== undefined ? form.cons : parseArr(tool.cons);

  const addTag = (tagId: string) => {
    const tag = tagsList.find((t: any) => t.id === tagId);
    if (!tag || currentTags.some((ct: any) => ct.id === tagId || ct.id === tag.id)) return;
    setFormField("tags", [...currentTags, { id: tag.id, name: tag.name }]);
  };

  const removeTag = (tagId: string) => {
    setFormField("tags", currentTags.filter((t: any) => t.id !== tagId && t.id !== tagId));
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val || currentFeatures.length >= 20) return;
    setFormField("features", [...currentFeatures, val]);
    setFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    setFormField("features", currentFeatures.filter((_: any, i: number) => i !== idx));
  };

  const togglePlatform = (p: string) => {
    const updated = currentPlatforms.includes(p)
      ? currentPlatforms.filter((x: string) => x !== p)
      : [...currentPlatforms, p];
    setFormField("platforms", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">/{tool.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/tools/${tool.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4 ml-2" />
              {t("admin.viewPublic")}
            </Link>
          </Button>
          <Button onClick={saveAll} disabled={Object.keys(form).length === 0 || updateMutation.isPending}>
            <Save className="h-4 w-4 ml-2" />
            {updateMutation.isPending ? "جاري الحفظ..." : t("admin.save")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
          <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
          <TabsTrigger value="article">المقال</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">الاسم</label>
                  <Input defaultValue={tool.name} onChange={(e) => setFormField("name", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">الوصف</label>
                  <RichTextEditor value={form.description !== undefined ? form.description : tool.description || ''} onChange={(v) => setFormField("description", v)} />
                </div>
                <div>
                  <label className="text-sm font-medium">الموقع الإلكتروني</label>
                  <Input defaultValue={tool.website} onChange={(e) => setFormField("website", e.target.value)} dir="ltr" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">الوسائط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  label="الشعار"
                  value={form.logo !== undefined ? form.logo : tool.logo}
                  onChange={(url) => setFormField("logo", url)}
                />
                <ImageUpload
                  label="لقطة الشاشة"
                  value={form.screenshot !== undefined ? form.screenshot : tool.screenshot}
                  onChange={(url) => setFormField("screenshot", url)}
                />
                <div>
                  <label className="text-sm font-medium">رابط فيديو</label>
                  <Input
                    defaultValue={tool.videoUrl || ""}
                    onChange={(e) => setFormField("videoUrl", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">التصنيف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">التصنيف</label>
                  <Select
                    options={[
                      { value: "", label: "اختر تصنيف" },
                      ...categoriesList.map((c: any) => ({ value: c.id, label: c.name })),
                    ]}
                    defaultValue={tool.category?.id || ""}
                    onChange={(e) => setFormField("category", { id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">الوسوم</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm"
                      value=""
                      onChange={(e) => { if (e.target.value) { addTag(e.target.value); } }}
                    >
                      <option value="">أضف وسماً...</option>
                      {tagsList
                        .filter((tag: any) => !currentTags.some((ct: any) => ct.id === tag.id || ct.id === tag.id))
                        .map((tag: any) => (
                          <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentTags.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary" className="gap-1">
                        <Hash className="h-3 w-3" />{tag.name}
                        <button type="button" onClick={() => removeTag(tag.id)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">التسعير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">نموذج التسعير</label>
                    <Select
                      options={pricingOptions}
                      defaultValue={tool.pricingModel || "free"}
                      onChange={(e) => setFormField("pricingModel", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">السعر يبدأ من $</label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      defaultValue={tool.pricingStartingAt ?? ""}
                      onChange={(e) => setFormField("pricingStartingAt", Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">الميزات والمنصات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">الميزات</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                    placeholder="أضف ميزة..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addFeature} disabled={currentFeatures.length >= 20}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {currentFeatures.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                      <button type="button" onClick={() => removeFeature(i)} className="mr-auto text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">المنصات</label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        currentPlatforms.includes(p)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">الإيجابيات والسلبيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">الإيجابيات (Pros)</label>
                <div className="space-y-1.5 mt-2">
                  {currentPros.map((pro, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-500 shrink-0">+</span>
                      <span>{pro}</span>
                      <button type="button" onClick={() => setFormField("pros", currentPros.filter((_, idx) => idx !== i))} className="mr-auto text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="أضف إيجابية..." className="flex-1" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) { setFormField("pros", [...currentPros, val]); (e.target as HTMLInputElement).value = ""; }
                    }
                  }} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">السلبيات (Cons)</label>
                <div className="space-y-1.5 mt-2">
                  {currentCons.map((con, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-red-500 shrink-0">-</span>
                      <span>{con}</span>
                      <button type="button" onClick={() => setFormField("cons", currentCons.filter((_, idx) => idx !== i))} className="mr-auto text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="أضف سلبية..." className="flex-1" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) { setFormField("cons", [...currentCons, val]); (e.target as HTMLInputElement).value = ""; }
                    }
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">دعم العربية</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                options={[
                  { value: "", label: "اختر..." },
                  { value: "yes", label: "يدعم العربية" },
                  { value: "partial", label: "دعم جزئي" },
                  { value: "no", label: "لا يدعم" },
                ]}
                defaultValue={form.arabicSupport !== undefined ? form.arabicSupport : (tool.arabicSupport || "")}
                onChange={(e) => setFormField("arabicSupport", e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">الحالة والإعدادات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <Select
                    options={statusOptions}
                    defaultValue={tool.status}
                    onChange={(e) => setFormField("status", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">مميز</p>
                  <p className="text-xs text-muted-foreground">عرض في قسم الأدوات المميزة</p>
                </div>
                <Switch
                  checked={form.featured !== undefined ? form.featured : tool.featured}
                  onCheckedChange={(checked) => setFormField("featured", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">موثّق</p>
                  <p className="text-xs text-muted-foreground">تم التحقق من الأداة</p>
                </div>
                <Switch
                  checked={form.verified !== undefined ? form.verified : tool.verified}
                  onCheckedChange={(checked) => setFormField("verified", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">مفتوح المصدر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.openSource !== undefined ? form.openSource : tool.openSource}
                  onCheckedChange={(checked) => setFormField("openSource", checked)}
                />
                <span className="text-sm">هذه الأداة مفتوحة المصدر</span>
              </div>
              {(form.openSource !== undefined ? form.openSource : tool.openSource) && (
                <div>
                  <label className="text-sm font-medium">رابط GitHub</label>
                  <Input
                    defaultValue={tool.githubUrl || ""}
                    onChange={(e) => setFormField("githubUrl", e.target.value)}
                    placeholder="https://github.com/username/repo"
                    dir="ltr"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">روابط التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">تويتر</label>
                  <Input
                    defaultValue={tool.twitterUrl || ""}
                    onChange={(e) => setFormField("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">لينكد إن</label>
                  <Input
                    defaultValue={tool.linkedinUrl || ""}
                    onChange={(e) => setFormField("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ديسكورد</label>
                  <Input
                    defaultValue={tool.discordUrl || ""}
                    onChange={(e) => setFormField("discordUrl", e.target.value)}
                    placeholder="https://discord.gg/..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GitHub</label>
                  <Input
                    defaultValue={tool.githubUrl || ""}
                    onChange={(e) => setFormField("githubUrl", e.target.value)}
                    placeholder="https://github.com/..."
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">تحسين محركات البحث (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">العنوان (SEO) {form.seoTitle?.length ?? tool.seoTitle?.length ?? 0}/70</label>
                <Input
                  defaultValue={tool.seoTitle || ""}
                  onChange={(e) => setFormField("seoTitle", e.target.value)}
                  placeholder="العنوان في نتائج البحث"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف (SEO) {form.seoDescription?.length ?? tool.seoDescription?.length ?? 0}/160</label>
                <Textarea
                  defaultValue={tool.seoDescription || ""}
                  rows={3}
                  onChange={(e) => setFormField("seoDescription", e.target.value)}
                  placeholder="وصف قصير لمحركات البحث"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الأسئلة الشائعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FaqManager toolId={tool.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{tool.views}</p>
                <p className="text-xs text-muted-foreground">إجمالي المشاهدات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{tool.clicks}</p>
                <p className="text-xs text-muted-foreground">إجمالي النقرات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{tool.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">التقييم</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{tool.reviewCount}</p>
                <p className="text-xs text-muted-foreground">المراجعات</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المشاهدات</CardTitle>
              </CardHeader>
              <CardContent>
                {tool.analytics?.viewsData?.length > 0 ? (
                  <Chart type="line" data={tool.analytics.viewsData} xKey="date" yKey="views" height={250} />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">لا توجد بيانات بعد</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">النقرات</CardTitle>
              </CardHeader>
              <CardContent>
                {tool.analytics?.clicksData?.length > 0 ? (
                  <Chart type="line" data={tool.analytics.clicksData} xKey="date" yKey="clicks" height={250} />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">لا توجد بيانات بعد</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="article" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">معلومات المقال</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">الشارة (Badge)</label>
                  <Input defaultValue={form.badge !== undefined ? form.badge : tool.badge || ''} onChange={(e) => setFormField("badge", e.target.value)} placeholder="الرائد الاقتصادي 2026" />
                </div>
                <div>
                  <label className="text-sm font-medium">معلومة سريعة (Highlight)</label>
                  <Input defaultValue={form.highlight !== undefined ? form.highlight : tool.highlight || ''} onChange={(e) => setFormField("highlight", e.target.value)} placeholder="يتفوق على GPT-5.5 في البرمجة" />
                </div>
                <div>
                  <label className="text-sm font-medium">نص البدائل (Alternatives Text)</label>
                  <RichTextEditor value={form.alternativesText !== undefined ? form.alternativesText : tool.alternativesText || ''} onChange={(v) => setFormField("alternativesText", v)} placeholder="فقرة عن بدائل الأداة..." minHeight={150} />
                </div>
                <div>
                  <label className="text-sm font-medium">خطوات البدء (Start Steps JSON)</label>
                  <Textarea defaultValue={form.startSteps !== undefined ? form.startSteps : tool.startSteps || '[]'} rows={3} onChange={(e) => setFormField("startSteps", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">الخلاصة (Conclusion)</label>
                  <Textarea defaultValue={form.conclusion !== undefined ? form.conclusion : tool.conclusion || ''} rows={3} onChange={(e) => setFormField("conclusion", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Slugs البدائل (Alternative Slugs JSON)</label>
                  <Textarea defaultValue={form.alternativeSlugs !== undefined ? form.alternativeSlugs : tool.alternativeSlugs || '[]'} rows={2} onChange={(e) => setFormField("alternativeSlugs", e.target.value)} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">بيانات JSON</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">الإحصائيات (Stats JSON)</label>
                  <Textarea defaultValue={form.stats !== undefined ? form.stats : tool.stats || '{}'} rows={2} onChange={(e) => setFormField("stats", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">النماذج (Models JSON)</label>
                  <Textarea defaultValue={form.models !== undefined ? form.models : tool.models || '[]'} rows={3} onChange={(e) => setFormField("models", e.target.value)} />
                </div>
                <div>
                  <GalleryUpload label="صور المعرض" value={form.gallery !== undefined ? form.gallery : tool.gallery || '[]'} onChange={(v) => setFormField("gallery", v)} />
                </div>
                <div>
                  <label className="text-sm font-medium">بيانات التسعير (Pricing Details JSON)</label>
                  <Textarea defaultValue={form.pricingDetails !== undefined ? form.pricingDetails : tool.pricingDetails || '{}'} rows={2} onChange={(e) => setFormField("pricingDetails", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}