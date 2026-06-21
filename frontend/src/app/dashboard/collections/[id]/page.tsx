"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@lib/api";
import Link from "next/link";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Rating } from "@components/ui/rating";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { EmptyState } from "@components/common/empty-state";
import { formatRelativeDate, truncate } from "@lib/utils";
import { ArrowLeft, Search, Trash2, ExternalLink, Lock, Globe, FolderKanban, Edit3 } from "lucide-react";

interface CollectionToolItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string | null;
  pricingTypes: string;
  pricingMin: number | null;
  averageRating: number;
  reviewCount: number;
  categories: { id: string; name: string; slug: string; icon: string | null }[];
}

interface CollectionDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  coverUrl: string | null;
  user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  _count: { tools: number };
  tools: {
    toolId: string;
    addedAt: string;
    tool: CollectionToolItem;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.id as string;
  const [search, setSearch] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => api.get<{ data: CollectionDetail }>(`/collections/${slug}`),
    enabled: !!slug,
  });

  const removeToolMutation = useMutation({
    mutationFn: (toolId: string) => api.delete(`/collections/${data?.data?.id}/tools/${toolId}`),
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.data) return null;

  const collection = data.data;

  const tools = collection.tools?.map((ct) => ({
    ...ct.tool,
    toolId: ct.toolId,
    addedAt: ct.addedAt,
  })) || [];

  const filtered = tools.filter((t) =>
    (t.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryName = (tool: CollectionToolItem) => {
    return tool.categories?.[0]?.name || "";
  };

  const getPricingLabel = (pricingTypes: string) => {
    try {
      const arr = JSON.parse(pricingTypes);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : "free";
    } catch { return "free"; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={`${collection.coverUrl ? "h-12 w-12 rounded-lg overflow-hidden shrink-0" : "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"}`}>
            {collection.coverUrl ? (
              <img src={collection.coverUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <FolderKanban className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{collection._count?.tools ?? 0} أدوات</span>
              {collection.isPublic ? (
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" />عامة</span>
              ) : (
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" />خاصة</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {collection.description && (
        <p className="text-muted-foreground">{collection.description}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث في هذه المجموعة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "لا توجد أدوات مطابقة" : "المجموعة فارغة"}
          message={search ? "جرب بحثاً مختلفاً" : "أضف أدوات إلى هذه المجموعة"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <Card key={tool.id} className="group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 overflow-hidden">
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        tool.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/tools/${tool.slug}`} className="font-semibold hover:text-primary transition-colors truncate block">
                        {tool.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Rating value={tool.averageRating} size="sm" />
                        <span className="text-xs text-muted-foreground">({tool.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => removeToolMutation.mutate(tool.id)}
                    disabled={removeToolMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {tool.tagline && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {truncate(tool.tagline, 100)}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {getCategoryName(tool) && <Badge variant="secondary" className="text-xs">{getCategoryName(tool)}</Badge>}
                  <Badge variant="outline" className="text-xs capitalize">{getPricingLabel(tool.pricingTypes)}</Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>أضيفت {formatRelativeDate((tool as any).addedAt)}</span>
                  <Link href={`/tools/${tool.slug}`} className="flex items-center gap-1 text-primary hover:underline">
                    عرض <ExternalLink className="h-3 w-3" />
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
