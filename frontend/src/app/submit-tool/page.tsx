"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Plus, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select } from "@components/ui/select";
import { useSubmitTool } from "@hooks/use-tools";
import { useCategories } from "@hooks/use-categories";
import { ROUTES, PRICING_MODELS, PLATFORMS } from "@lib/constants";
import { useAuthStore } from "@stores/auth-store";
import { cn } from "@lib/utils";

export default function SubmitToolPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";
  const { isAuthenticated } = useAuthStore();
  const submitMutation = useSubmitTool();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricingModel, setPricingModel] = useState("free");
  const [pricingStartingAt, setPricingStartingAt] = useState("");
  const [logo, setLogo] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const addFeature = () => {
    const feature = featureInput.trim();
    if (feature) {
      setFeatures([...features, feature]);
      setFeatureInput("");
    }
  };

  const removeFeature = (feature: string) => setFeatures(features.filter((f) => f !== feature));

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !description || !website || !categoryId || tags.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (description.length < 20) {
      setError("Description must be at least 20 characters");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        name, description, website, categoryId,
        pricingModel: pricingModel as typeof PRICING_MODELS[number],
        pricingStartingAt: pricingStartingAt ? Number(pricingStartingAt) : undefined,
        logo: logo || undefined,
        screenshot: screenshot || undefined,
        tags, features,
        platforms: platforms as ("web" | "ios" | "android" | "mac" | "windows" | "linux" | "api" | "chrome")[],
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit tool");
    }
  };

  if (success) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t("submit.success")}</h1>
        <p className="text-muted-foreground mb-6">{t("submit.successMessage")}</p>
        <Button asChild>
          <a href={ROUTES.TOOLS}>Browse Tools</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">{t("submit.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("submit.subtitle")}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium mb-1 block">{t("submit.name")} *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("submit.namePlaceholder")} required />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium mb-1 block">{t("submit.description")} *</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("submit.descriptionPlaceholder")} rows={4} required />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium mb-1 block">{t("submit.website")} *</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t("submit.websitePlaceholder")} type="url" required />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t("submit.category")} *</label>
            <Select
              options={[
                { value: "", label: t("submit.selectCategory") },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t("submit.pricingModel")}</label>
            <Select
              options={PRICING_MODELS.map((m) => ({ value: m, label: t(`pricing.${m}`) }))}
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value)}
            />
          </div>

          {pricingModel === "paid" && (
            <div>
              <label className="text-sm font-medium mb-1 block">Starting Price ($)</label>
              <Input type="number" min="0" step="0.01" value={pricingStartingAt} onChange={(e) => setPricingStartingAt(e.target.value)} />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">{t("submit.logo")}</label>
            <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder={t("submit.logoPlaceholder")} type="url" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t("submit.screenshot")}</label>
            <Input value={screenshot} onChange={(e) => setScreenshot(e.target.value)} placeholder={t("submit.screenshotPlaceholder")} type="url" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{t("submit.tags")} *</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={t("submit.tagsPlaceholder")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{t("submit.features")}</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder={t("submit.addFeature")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
            />
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span>{feature}</span>
                <button type="button" onClick={() => removeFeature(feature)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">{t("submit.platforms")}</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  platforms.includes(platform)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-accent"
                )}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {t("submit.submit")}
        </Button>
      </form>
    </div>
  );
}
