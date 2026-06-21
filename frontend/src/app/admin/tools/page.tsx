"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { Pagination } from "@components/ui/pagination";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate } from "@lib/utils";
import { Search, Plus, Pencil, Trash2, X, ImageOff, ChevronUp } from "lucide-react";
import { useDebounce } from "@hooks/use-debounce";
import Link from "next/link";

interface AdminTool {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: { name: string };
  featured: boolean;
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  logo?: string;
}

interface ToolCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

const statusBadge: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  approved: { label: "مقبول", variant: "success" },
  pending: { label: "معلق", variant: "warning" },
  rejected: { label: "مرفوض", variant: "destructive" },
  draft: { label: "مسودة", variant: "secondary" },
};

const filterTabs = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "معلق" },
  { key: "approved", label: "مقبول" },
  { key: "rejected", label: "مرفوض" },
  { key: "draft", label: "مسودة" },
];

export default function AdminTools() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const queryFilter = tabFilter === "all" ? "" : tabFilter;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "tools", page, debouncedSearch, queryFilter, categoryFilter],
    queryFn: () =>
      api.get<{ data: { tools: AdminTool[]; total: number; totalPages: number } }>("/admin/tools", {
        params: {
          take: 15,
          skip: (page - 1) * 15,
          search: debouncedSearch || undefined,
          status: queryFilter || undefined,
          ...(categoryFilter ? { categoryId: categoryFilter } : {}),
        },
      }),
  });

  const { data: countsData } = useQuery({
    queryKey: ["admin", "tools", "counts"],
    queryFn: async () => {
      const res = await api.get<{ data: { tools: AdminTool[]; total: number } }>("/admin/tools", { params: { take: 1 } });
      const total = res.data?.total || 0;
      return { all: total, pending: 0, approved: 0, rejected: 0, draft: 0 };
    },
    staleTime: 30000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get<{ data: { categories: { id: string; name: string }[] } }>("/admin/categories"),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: string }) =>
      api.post("/admin/tools/bulk", { ids, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
      setSelected([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tools/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
      setDeleteId(null);
    },
  });

  const listData = data?.data;
  const tools = listData?.tools || [];
  const counts = countsData || { all: 0, pending: 0, approved: 0, rejected: 0, draft: 0 };
  const categories = categoriesData?.data?.categories || [];

  const handleSelectAll = () => {
    if (selected.length === tools.length) setSelected([]);
    else setSelected(tools.map((t) => t.id));
  };

  const handleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const selectedCount = selected.length;

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">الرئيسية</Link>
        <span>/</span>
        <span className="text-foreground font-medium">الأدوات</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">الأدوات</h1>
          <Button asChild size="sm" className="h-7 text-xs">
            <Link href="/admin/tools/new">
              <Plus className="h-3.5 w-3.5 ml-1" />
              إضافة جديد
            </Link>
          </Button>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-8 w-48 pr-9 text-sm"
            />
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setTabFilter(tab.key); setPage(1); setSelected([]); }}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              tabFilter === tab.key
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {tab.label}
            <span className={`mr-1.5 text-xs ${
              tabFilter === tab.key ? "text-primary-foreground/70" : "text-muted-foreground/60"
            }`}>
              ({counts[tab.key as keyof ToolCounts]})
            </span>
          </button>
        ))}
        <div className="mr-auto flex items-center gap-2">
          <Select
            options={[
              { value: "", label: "التصنيف" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {search || queryFilter || categoryFilter ? "لا توجد أدوات تطابق البحث" : "لا توجد أدوات بعد"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-center" style={{width:36}}>
                      <input type="checkbox" checked={tools.length > 0 && selected.length === tools.length} onChange={handleSelectAll} className="rounded" />
                    </th>
                    <th style={{width:44}}></th>
                    <th className="p-3 text-right font-medium">الاسم</th>
                    <th className="p-3 text-right font-medium hidden md:table-cell">التصنيف</th>
                    <th className="p-3 text-center font-medium hidden lg:table-cell">الحالة</th>
                    <th className="p-3 text-center font-medium hidden sm:table-cell">التقييم</th>
                    <th className="p-3 text-center font-medium hidden sm:table-cell">التاريخ</th>
                    <th className="p-3 text-center font-medium" style={{width:100}}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr key={tool.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={selected.includes(tool.id)} onChange={() => handleSelect(tool.id)} className="rounded" />
                      </td>
                      <td className="p-1">
                        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {(tool as any).logo ? (
                            <img src={(tool as any).logo} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                          ) : (
                            <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link href={`/admin/tools/${tool.id}`} className="font-medium hover:text-primary transition-colors">
                          {tool.name}
                        </Link>
                        <div className="flex items-center gap-1 mt-0.5">
                          {tool.featured && <Badge variant="default" className="text-[9px] px-1 py-0 h-3.5">مميز</Badge>}
                          {tool.verified && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">موثق</Badge>}
                          <span className="text-[10px] text-muted-foreground">/{tool.slug}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">
                        {tool.category?.name || "—"}
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell">
                        <Badge variant={statusBadge[tool.status]?.variant || "secondary"} className="text-[10px] px-1.5">
                          {statusBadge[tool.status]?.label || tool.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-xs text-muted-foreground hidden sm:table-cell">
                        {tool.rating > 0 ? `${tool.rating.toFixed(1)} (${tool.reviewCount})` : "—"}
                      </td>
                      <td className="p-3 text-center text-xs text-muted-foreground hidden sm:table-cell">
                        {formatDate(tool.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="default" className="h-7 px-2 text-xs" asChild>
                            <Link href={`/admin/tools/${tool.id}`}>
                              <Pencil className="h-3 w-3 ml-1" />
                              تعديل
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(tool.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Pagination */}
      {listData && listData.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={listData.totalPages} onPageChange={setPage} />
      )}

      {/* Bottom Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background shadow-lg">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{selectedCount}</strong> أداة محددة
              </span>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                <X className="h-4 w-4 ml-1" />
                إلغاء التحديد
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ ids: selected, action: "approve" })}>
                موافقة
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ ids: selected, action: "reject" })}>
                رفض
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ ids: selected, action: "feature" })}>
                تمييز
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent title="تأكيد الحذف" description="هل أنت متأكد من حذف هذه الأداة؟ لا يمكن التراجع عن هذا الإجراء.">
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
