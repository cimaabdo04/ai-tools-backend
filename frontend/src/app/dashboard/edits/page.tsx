"use client";

import { useState } from "react";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { Pagination } from "@components/ui/pagination";
import { Skeleton } from "@components/ui/skeleton";
import { useDebounce } from "@hooks/use-debounce";
import { useTools } from "@hooks/use-tools";
import { useCategories } from "@hooks/use-categories";
import { ITEMS_PER_PAGE } from "@lib/constants";
import { Search, Plus, Pencil, ExternalLink, ImageOff } from "lucide-react";
import Link from "next/link";

export default function EditsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useTools({
    page,
    perPage: 25,
    search: debouncedSearch || undefined,
    categoryId: categoryFilter || undefined,
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories ?? [];

  const tools = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">قائمة الأدوات</h1>
        <Button asChild size="sm">
          <Link href="/submit-tool">
            <Plus className="h-4 w-4 ml-1" />
            إضافة جديد
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            options={[
              { value: "", label: "كل التصنيفات" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="h-8 text-sm w-36"
          />
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-8 w-full pr-9 text-sm"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {search || categoryFilter ? "لا توجد أدوات تطابق البحث" : "لا توجد أدوات بعد"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th style={{width:44}}></th>
                    <th className="p-3 text-right font-medium">الاسم</th>
                    <th className="p-3 text-right font-medium hidden md:table-cell">التصنيف</th>
                    <th className="p-3 text-center font-medium hidden sm:table-cell">التقييم</th>
                    <th className="p-3 text-center font-medium hidden sm:table-cell">التاريخ</th>
                    <th className="p-3 text-center font-medium" style={{width:100}}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr key={tool.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-1">
                        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                          ) : (
                            <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link href={`/tools/${tool.slug}`} className="font-medium hover:text-primary transition-colors">
                          {tool.name}
                        </Link>
                        <div className="text-[10px] text-muted-foreground">/{tool.slug}</div>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">
                        {tool.categories?.map((c: { name: string }) => c.name).join("، ") || "—"}
                      </td>
                      <td className="p-3 text-center text-xs text-muted-foreground hidden sm:table-cell">
                        {tool.averageRating && tool.averageRating > 0
                          ? `${tool.averageRating.toFixed(1)} (${tool.reviewCount ?? 0})`
                          : "—"}
                      </td>
                      <td className="p-3 text-center text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(tool.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <a href={`/tools/${tool.slug}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="عرض">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          {tool.id && (
                            <a href={`/dashboard/edits/${tool.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="تعديل">
                              <Pencil className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
