"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Rating } from "@components/ui/rating";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { LoadingSpinner } from "@components/common/loading-spinner";
import { Select } from "@components/ui/select";
import { ROUTES } from "@lib/constants";
import { formatRelativeDate, truncate } from "@lib/utils";
import { Star, Edit3, Trash2, ExternalLink, ThumbsUp, Clock, SortDesc } from "lucide-react";

const reviewSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000),
  rating: z.number().int().min(1).max(5),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface Review {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  rating: number;
  title: string;
  content: string;
  pros: string | null;
  cons: string | null;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

const mockReviews: Review[] = [
  { id: "r1", toolId: "t1", toolName: "ChatGPT", toolSlug: "chatgpt", rating: 5, title: "Best AI assistant", content: "This tool has completely transformed my workflow. The ability to generate content, debug code, and brainstorm ideas in one place is incredible.", pros: "Very intuitive interface, great response quality, wide range of use cases", cons: "Can be slow during peak hours, sometimes gives incorrect information", helpfulCount: 24, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "r2", toolId: "t2", toolName: "Midjourney", toolSlug: "midjourney", rating: 4, title: "Great image generation", content: "Midjourney produces stunning images. The artistic quality is unmatched by other AI image generators.", pros: "Excellent image quality, unique artistic style", cons: "Steep learning curve, pricing could be better", helpfulCount: 18, createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: "r3", toolId: "t3", toolName: "GitHub Copilot", toolSlug: "github-copilot", rating: 5, title: "Indispensable for developers", content: "Copilot has become an essential part of my development workflow. It catches errors before I make them and suggests elegant solutions.", pros: "Great code completion, supports many languages, context-aware suggestions", cons: "Occasional irrelevant suggestions, requires good internet connection", helpfulCount: 42, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

export default function ReviewsPage() {
  const t = useTranslations();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { title: "", content: "", rating: 5, pros: "", cons: "" },
  });

  const openEdit = (r: Review) => {
    setEditReview(r);
    form.reset({ title: r.title, content: r.content, rating: r.rating, pros: r.pros ?? "", cons: r.cons ?? "" });
    setDialogOpen(true);
  };

  const onSubmit = (data: ReviewForm) => {
    if (editReview) {
      setReviews((prev) =>
        prev.map((r) => r.id === editReview.id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)
      );
    }
    setDialogOpen(false);
    setEditReview(null);
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirmId(null);
  };

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "helpful") return b.helpfulCount - a.helpfulCount;
    return 0;
  });

  if (isLoading) return <LoadingSpinner className="py-20" />;
  if (isError) return <ErrorState onRetry={() => setIsError(false)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.reviews")}</h1>
          <p className="text-muted-foreground mt-1">Reviews you have written</p>
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "rating", label: "Highest Rated" },
            { value: "helpful", label: "Most Helpful" },
          ]}
          className="w-36"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title="Edit Review">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("review.rating")}</label>
              <Rating
                value={form.watch("rating")}
                onChange={(v) => form.setValue("rating", v)}
                size="lg"
              />
              {form.formState.errors.rating && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.rating.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("review.reviewTitle")}</label>
              <Input {...form.register("title")} error={form.formState.errors.title?.message} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("review.content")}</label>
              <Textarea {...form.register("content")} rows={4} error={form.formState.errors.content?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("review.pros")}</label>
                <Textarea {...form.register("pros")} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("review.cons")}</label>
                <Textarea {...form.register("cons")} rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit">{t("common.update")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {sorted.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          message="Reviews you write will appear here"
          action={{ label: "Browse Tools", onClick: () => window.location.href = "/tools" }}
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={ROUTES.TOOL_DETAIL(review.toolSlug)} className="font-semibold hover:text-primary transition-colors">
                        {review.toolName}
                      </Link>
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <Rating value={review.rating} size="sm" showValue />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{formatRelativeDate(review.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />{review.helpfulCount}
                      </span>
                    </div>

                    <h3 className="font-medium mb-1">{review.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{truncate(review.content, 200)}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {review.pros && (
                        <div>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">Pros:</span>
                          <p className="text-muted-foreground mt-0.5">{truncate(review.pros, 100)}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div>
                          <span className="font-medium text-red-600 dark:text-red-400">Cons:</span>
                          <p className="text-muted-foreground mt-0.5">{truncate(review.cons, 100)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(review)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {deleteConfirmId === review.id ? (
                      <div className="flex flex-col gap-1">
                        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDelete(review.id)}>Confirm</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirmId(review.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
