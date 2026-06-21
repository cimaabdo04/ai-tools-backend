"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { EmptyState } from "@components/common/empty-state";
import { LoadingSpinner } from "@components/common/loading-spinner";
import { ErrorState } from "@components/common/error-state";
import { Tooltip } from "@components/ui/tooltip";
import { Rating } from "@components/ui/rating";
import { SearchInput } from "@components/ui/search-input";
import { PaginationWrapper } from "@components/common/pagination";
import { ROUTES } from "@lib/constants";
import { formatRelativeDate, truncate } from "@lib/utils";
import { BookmarkCheck, ExternalLink, Search, StickyNote, Trash2, ArrowUpDown } from "lucide-react";
import Link from "next/link";

const mockBookmarks = Array.from({ length: 12 }, (_, i) => ({
  id: `bm-${i}`,
  toolId: `tool-${i}`,
  toolName: `AI Tool ${i + 1}`,
  toolSlug: `ai-tool-${i + 1}`,
  toolDescription: "A powerful AI tool that helps you automate and streamline your workflow with intelligent features.",
  toolLogo: null as string | null,
  category: "Productivity",
  pricingModel: ["free", "freemium", "paid"][i % 3],
  rating: 3.5 + (i % 3) * 0.5,
  reviewCount: Math.floor(Math.random() * 50),
  note: i === 0 ? "Great tool for content creation" : null,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export default function BookmarksPage() {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [bookmarks, setBookmarks] = useState(mockBookmarks);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const filtered = bookmarks.filter((b) =>
    (b.toolName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveNote = (id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, note: noteText } : b))
    );
    setEditingNote(null);
    setNoteText("");
  };

  if (isLoading) return <LoadingSpinner className="py-20" />;
  if (isError) return <ErrorState onRetry={() => setIsError(false)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.bookmarks")}</h1>
        <p className="text-muted-foreground mt-1">Tools you have bookmarked for later</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onSearch={(v) => { setSearch(v); setPage(1); }}
          />
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "rating", label: "Highest Rated" },
            { value: "name_asc", label: "Name (A-Z)" },
          ]}
          className="w-36"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookmarks found"
          message={search ? "Try a different search term" : "Start bookmarking tools you like"}
          action={search ? undefined : { label: "Browse Tools", onClick: () => window.location.href = "/tools" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bm) => (
            <Card key={bm.id} className="group relative">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                      {bm.toolName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <Link href={ROUTES.TOOL_DETAIL(bm.toolSlug)} className="font-semibold hover:text-primary transition-colors truncate block">
                        {bm.toolName}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Rating value={bm.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">({bm.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  <Tooltip content="Remove bookmark">
                    <button
                      onClick={() => handleRemove(bm.id)}
                      className="shrink-0 rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {truncate(bm.toolDescription, 100)}
                </p>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{bm.category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{bm.pricingModel}</span>
                </div>

                {editingNote === bm.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Add a note..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveNote(bm.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {bm.note ? (
                      <p className="text-xs text-muted-foreground italic truncate flex-1">"{bm.note}"</p>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-1">
                      <Tooltip content="Add note">
                        <button
                          onClick={() => { setEditingNote(bm.id); setNoteText(bm.note ?? ""); }}
                          className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <StickyNote className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Visit tool">
                        <a href={`https://example.com/${bm.toolSlug}`} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Bookmarked {formatRelativeDate(bm.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <PaginationWrapper currentPage={page} totalPages={3} total={filtered.length} onPageChange={setPage} />
      )}
    </div>
  );
}
