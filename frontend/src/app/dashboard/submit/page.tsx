"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import { ROUTES, PRICING_MODELS, PLATFORMS } from "@lib/constants";
import { slugify } from "@lib/utils";
import { X, Plus, Globe, Github, Hash, ExternalLink, Image, Video, Tags, CheckSquare, LayoutGrid, DollarSign, Search } from "lucide-react";

const submitSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  tagline: z.string().max(200).optional(),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  website: z.string().url("Must be a valid URL"),
  logo: z.string().url().optional().or(z.literal("")),
  screenshot: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  pricingModel: z.enum(["free", "freemium", "paid", "contact"]),
  pricingStartingAt: z.coerce.number().min(0).optional(),
  features: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  openSource: z.boolean().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  discordUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

type SubmitForm = z.infer<typeof submitSchema>;

const categories = [
  { id: "cat-1", name: "Writing" },
  { id: "cat-2", name: "Image Generation" },
  { id: "cat-3", name: "Video" },
  { id: "cat-4", name: "Audio" },
  { id: "cat-5", name: "Code & Development" },
  { id: "cat-6", name: "Marketing" },
  { id: "cat-7", name: "Productivity" },
  { id: "cat-8", name: "Data & Analytics" },
  { id: "cat-9", name: "Design" },
  { id: "cat-10", name: "Other" },
];

export default function SubmitToolPage() {
  const t = useTranslations();
  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const form = useForm<SubmitForm>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      name: "", tagline: "", description: "", website: "", logo: "", screenshot: "", videoUrl: "",
      categoryId: "", tags: [], pricingModel: "free", pricingStartingAt: undefined,
      features: [], platforms: [], openSource: false, githubUrl: "", twitterUrl: "",
      linkedinUrl: "", discordUrl: "", seoTitle: "", seoDescription: "",
    },
  });

  const name = useWatch({ control: form.control, name: "name" });
  const features = useWatch({ control: form.control, name: "features" }) ?? [];
  const tags = useWatch({ control: form.control, name: "tags" }) ?? [];
  const platforms = useWatch({ control: form.control, name: "platforms" }) ?? [];
  const openSource = useWatch({ control: form.control, name: "openSource" });

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val) && tags.length < 10) {
      form.setValue("tags", [...tags, val]);
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => form.setValue("tags", tags.filter((t) => t !== tag));

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && features.length < 20) {
      form.setValue("features", [...features, val]);
      setFeatureInput("");
    }
  };
  const removeFeature = (idx: number) => form.setValue("features", features.filter((_, i) => i !== idx));

  const togglePlatform = (p: string) => {
    form.setValue("platforms", platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p]);
  };

  const onSubmit = (data: SubmitForm) => {
  };

  const handleSaveDraft = () => {
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("submit.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("submit.subtitle")}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Basic Information</CardTitle>
            <CardDescription>Provide the essential details about your tool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("submit.name")} *</label>
              <Input {...form.register("name")} placeholder={t("submit.namePlaceholder")} error={form.formState.errors.name?.message} />
              {name && (
                <p className="text-xs text-muted-foreground mt-1">
                  Slug: <code className="text-primary">{slugify(name)}</code>
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tagline</label>
              <Input {...form.register("tagline")} placeholder="Short description (max 200 chars)" error={form.formState.errors.tagline?.message} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("submit.description")} *</label>
              <Textarea {...form.register("description")} rows={5} placeholder={t("submit.descriptionPlaceholder")} error={form.formState.errors.description?.message} />
              <p className="text-xs text-muted-foreground mt-1">{form.watch("description")?.length ?? 0}/2000</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("submit.website")} *</label>
              <Input {...form.register("website")} placeholder={t("submit.websitePlaceholder")} error={form.formState.errors.website?.message} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" />Media</CardTitle>
            <CardDescription>Add visual assets for your tool listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.logo")}</label>
                <Input {...form.register("logo")} placeholder={t("submit.logoPlaceholder")} error={form.formState.errors.logo?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.screenshot")}</label>
                <Input {...form.register("screenshot")} placeholder="https://example.com/screenshot.png" error={form.formState.errors.screenshot?.message} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("submit.videoUrl")}</label>
              <Input {...form.register("videoUrl")} placeholder="https://youtube.com/watch?v=..." error={form.formState.errors.videoUrl?.message} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5" />Categorization</CardTitle>
            <CardDescription>Categorize your tool for better discoverability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("submit.category")} *</label>
              <Select {...form.register("categoryId")}
                placeholder={t("submit.selectCategory")}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                error={form.formState.errors.categoryId?.message}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Tags className="h-3 w-3" />{t("submit.tags")} *</label>
              <div className="flex gap-2 mb-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder={t("submit.tagsPlaceholder")} className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 10}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {form.formState.errors.tags && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.tags.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{tags.length}/10 tags</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing</CardTitle>
            <CardDescription>Set your tool's pricing model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.pricingModel")} *</label>
                <Select {...form.register("pricingModel")}
                  options={PRICING_MODELS.map((m) => ({ value: m, label: t(`pricing.${m}`) }))}
                  error={form.formState.errors.pricingModel?.message}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Starting price ($)</label>
                <Input {...form.register("pricingStartingAt")} type="number" min={0} placeholder="0.00" error={form.formState.errors.pricingStartingAt?.message} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5" />Features & Platforms</CardTitle>
            <CardDescription>List the key features and supported platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("submit.features")}</label>
              <div className="flex gap-2 mb-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  placeholder={t("submit.addFeature")} className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addFeature} disabled={features.length >= 20}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                    <button type="button" onClick={() => removeFeature(i)} className="ml-auto text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("submit.platforms")}</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      platforms.includes(p)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:border-primary/50"
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
            <CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" />Open Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={openSource} onCheckedChange={(v) => form.setValue("openSource", v)} />
              <span className="text-sm">This tool is open source</span>
            </div>
            {openSource && (
              <div>
                <label className="text-sm font-medium mb-1 block">GitHub URL</label>
                <Input {...form.register("githubUrl")} placeholder="https://github.com/username/repo" error={form.formState.errors.githubUrl?.message} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5" />{t("submit.socialLinks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.twitterUrl")}</label>
                <Input {...form.register("twitterUrl")} placeholder="https://twitter.com/yourtool" error={form.formState.errors.twitterUrl?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.githubUrl")}</label>
                <Input {...form.register("githubUrl")} placeholder="https://github.com/yourtool" error={form.formState.errors.githubUrl?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.linkedinUrl")}</label>
                <Input {...form.register("linkedinUrl")} placeholder="https://linkedin.com/company/yourtool" error={form.formState.errors.linkedinUrl?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("submit.discordUrl")}</label>
                <Input {...form.register("discordUrl")} placeholder="https://discord.gg/yourtool" error={form.formState.errors.discordUrl?.message} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />SEO Settings</CardTitle>
            <CardDescription>Optimize how your tool appears in search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">SEO Title ({form.watch("seoTitle")?.length ?? 0}/70)</label>
              <Input {...form.register("seoTitle")} placeholder="Tool Name - AI Tool Directory" error={form.formState.errors.seoTitle?.message} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Description ({form.watch("seoDescription")?.length ?? 0}/160)</label>
              <Textarea {...form.register("seoDescription")} rows={3} placeholder="A brief description for search engine results" error={form.formState.errors.seoDescription?.message} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            {t("submit.saveDraft")}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("common.saving") : t("submit.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
