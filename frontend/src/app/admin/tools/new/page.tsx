"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, uploadFile, deleteUpload } from "@lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Skeleton } from "@components/ui/skeleton";
import { RichTextEditor } from "@components/ui/rich-text-editor";
import { ToolSearchSelect } from "@components/ui/tool-search-select";
import { Save, ArrowLeft, X, Plus, Upload, Hash, CheckSquare, Image } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const pricingOptions = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "contact", label: "Contact" },
];

const platformOptions = ["Web", "iOS", "Android", "Mac", "Windows", "Linux", "Chrome", "API", "CLI", "Desktop"];

function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
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
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL أو استخدم زر الرفع" dir="ltr" />
        </div>
        <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
      {value && (
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

export default function AdminNewTool() {
  const t = useTranslations();
  const router = useRouter();

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get<{ categories: { id: string; name: string }[] }>("/admin/categories"),
  });

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get<{ data: { id: string; name: string }[] }>("/tags?includeInactive=true"),
  });

  const [form, setForm] = useState<Record<string, any>>({
    name: "",
    description: "",
    tagline: "",
    website: "",
    pricingModel: "free",
    pricingStartingAt: 0,
    features: [],
    platforms: [],
    openSource: false,
    status: "pending",
    featured: false,
    verified: false,
    logo: "",
    screenshot: "",
    videoUrl: "",
    category: { id: "" },
    tags: [],
    githubUrl: "",
    twitterUrl: "",
    discordUrl: "",
    seoTitle: "",
    seoDescription: "",
    badge: "",
    highlight: "",
    stats: "",
    models: "",
    gallery: "",
    alternativesText: "",
    pricingDetails: "",
    startSteps: "",
    conclusion: "",
    alternativeSlugs: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<{ tool: { id: string } }>("/admin/tools", body),
    onSuccess: (data) => {
      router.push(`/admin/tools/${data.tool.id}`);
    },
  });

  const setFormField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const tagsList = tagsQuery.data?.data || [];
  const categoriesList = categoriesQuery.data?.categories || [];

  const addTag = (tagId: string) => {
    const tag = tagsList.find((t: any) => t.id === tagId);
    if (!tag || form.tags.some((ct: any) => ct.id === tagId)) return;
    setFormField("tags", [...form.tags, { id: tag.id, name: tag.name }]);
  };

  const removeTag = (tagId: string) => {
    setFormField("tags", form.tags.filter((t: any) => t.id !== tagId));
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val || form.features.length >= 20) return;
    setFormField("features", [...form.features, val]);
    setFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    setFormField("features", form.features.filter((_: any, i: number) => i !== idx));
  };

  const togglePlatform = (p: string) => {
    const updated = form.platforms.includes(p)
      ? form.platforms.filter((x: string) => x !== p)
      : [...form.platforms, p];
    setFormField("platforms", updated);
  };

  const handleSubmit = () => {
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إضافة أداة جديدة</h1>
            <p className="text-sm text-muted-foreground">أضف أداة جديدة إلى الدليل</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          <Save className="h-4 w-4 ml-2" />
          {createMutation.isPending ? "جاري الإنشاء..." : "إضافة"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">الاسم *</label>
              <Input value={form.name} onChange={(e) => setFormField("name", e.target.value)} placeholder="اسم الأداة" />
            </div>
            <div>
              <label className="text-sm font-medium">الشعار (Tagline)</label>
              <Input value={form.tagline} onChange={(e) => setFormField("tagline", e.target.value)} placeholder="شعار قصير" />
            </div>
            <div>
              <label className="text-sm font-medium">الوصف *</label>
              <RichTextEditor value={form.description} onChange={(v) => setFormField("description", v)} placeholder="اكتب محتوى المقال هنا..." />
            </div>
            <div>
              <label className="text-sm font-medium">الموقع الإلكتروني *</label>
              <Input value={form.website} onChange={(e) => setFormField("website", e.target.value)} placeholder="https://..." dir="ltr" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">الوسائط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload label="الشعار" value={form.logo} onChange={(url) => setFormField("logo", url)} />
            <ImageUpload label="لقطة الشاشة" value={form.screenshot} onChange={(url) => setFormField("screenshot", url)} />
            <div>
              <label className="text-sm font-medium">رابط فيديو</label>
              <Input value={form.videoUrl} onChange={(e) => setFormField("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." dir="ltr" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">التصنيف والوسوم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">التصنيف</label>
              <Select
                options={[
                  { value: "", label: "اختر تصنيف" },
                  ...categoriesList.map((c: any) => ({ value: c.id, label: c.name })),
                ]}
                value={form.category?.id || ""}
                onChange={(e) => setFormField("category", { id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">الوسوم</label>
              <div className="flex gap-2 mb-2">
                <select
                  className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  value=""
                  onChange={(e) => { if (e.target.value) addTag(e.target.value); }}
                >
                  <option value="">أضف وسماً...</option>
                  {tagsList.filter((tag: any) => !form.tags.some((ct: any) => ct.id === tag.id)).map((tag: any) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag: any) => (
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
                <Select options={pricingOptions} value={form.pricingModel} onChange={(e) => setFormField("pricingModel", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">السعر يبدأ من $</label>
                <Input type="number" min={0} step={0.01} value={form.pricingStartingAt} onChange={(e) => setFormField("pricingStartingAt", Number(e.target.value))} />
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
              <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="أضف ميزة..." className="flex-1" />
              <Button type="button" variant="outline" onClick={addFeature} disabled={form.features.length >= 20}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1.5">
              {form.features.map((f: string, i: number) => (
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
                <button key={p} type="button" onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.platforms.includes(p)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الحالة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">الحالة</label>
              <Select
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "draft", label: "Draft" },
                ]}
                value={form.status}
                onChange={(e) => setFormField("status", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">مميز</p></div>
              <Switch checked={form.featured} onCheckedChange={(c) => setFormField("featured", c)} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">موثّق</p></div>
              <Switch checked={form.verified} onCheckedChange={(c) => setFormField("verified", c)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.openSource} onCheckedChange={(c) => setFormField("openSource", c)} />
              <span className="text-sm">مفتوح المصدر</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">العنوان (SEO) {form.seoTitle?.length ?? 0}/70</label>
              <Input value={form.seoTitle} onChange={(e) => setFormField("seoTitle", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">الوصف (SEO) {form.seoDescription?.length ?? 0}/160</label>
              <Textarea value={form.seoDescription} rows={3} onChange={(e) => setFormField("seoDescription", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">محتوى المقال (Article)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">الشارة (Badge)</label>
              <Input value={form.badge} onChange={(e) => setFormField("badge", e.target.value)} placeholder="مثال: الرائد الاقتصادي 2026" />
            </div>
            <div>
              <label className="text-sm font-medium">معلومة سريعة (Highlight)</label>
              <Input value={form.highlight} onChange={(e) => setFormField("highlight", e.target.value)} placeholder="مثال: يتفوق على GPT-5.5 في البرمجة" />
            </div>
            <div>
              <label className="text-sm font-medium">الإحصائيات (JSON)</label>
              <Textarea value={form.stats} rows={2} onChange={(e) => setFormField("stats", e.target.value)} placeholder='{"المعلمات":"1.6T","السياق":"1M","السعر":"30x أرخص"}' />
            </div>
            <div>
              <label className="text-sm font-medium">النماذج (JSON)</label>
              <Textarea value={form.models} rows={3} onChange={(e) => setFormField("models", e.target.value)} placeholder='[{"name":"Pro","specs":"1.6T معلمة","audience":["شركات"],"useCases":["برمجة"]}]' />
            </div>
            <div>
              <GalleryUpload label="صور المعرض" value={form.gallery} onChange={(v) => setFormField("gallery", v)} />
            </div>
            <div>
              <label className="text-sm font-medium">نص البدائل (Alternatives)</label>
              <RichTextEditor value={form.alternativesText} onChange={(v) => setFormField("alternativesText", v)} placeholder="اكتب فقرة عن بدائل الأداة..." minHeight={150} />
            </div>
            <div>
              <label className="text-sm font-medium">بيانات التسعير (JSON)</label>
              <Textarea value={form.pricingDetails} rows={3} onChange={(e) => setFormField("pricingDetails", e.target.value)} placeholder='{"flashInputMiss":"$0.14","proInputMiss":"$1.74"}' />
            </div>
            <div>
              <label className="text-sm font-medium">خطوات البدء (JSON)</label>
              <Textarea value={form.startSteps} rows={3} onChange={(e) => setFormField("startSteps", e.target.value)} placeholder='[{"title":"الخطوة الأولى","description":"...راق"}]' />
            </div>
            <div>
              <label className="text-sm font-medium">الخلاصة (Conclusion)</label>
              <Textarea value={form.conclusion} rows={3} onChange={(e) => setFormField("conclusion", e.target.value)} placeholder="نص الخلاصة في نهاية المقال..." />
            </div>
            <div>
              <label className="text-sm font-medium">الأدوات البديلة</label>
              <ToolSearchSelect value={form.alternativeSlugs} onChange={(v) => setFormField("alternativeSlugs", v)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}