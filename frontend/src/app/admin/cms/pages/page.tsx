"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import { DataTable } from "@components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@lib/utils";
import { useTranslations } from "next-intl";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export default function AdminCMSPages() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CMSPage | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", published: false });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "cms-pages"],
    queryFn: () => api.get<{ pages: CMSPage[] }>("/admin/cms/pages"),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      body.id
        ? api.put(`/admin/cms/pages/${body.id}`, body)
        : api.post("/admin/cms/pages", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms-pages"] });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/admin/cms/pages/${id}`, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "cms-pages"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.cmsPages")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.cmsPagesDescription")}</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ title: "", slug: "", content: "", published: false }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addPage")}
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.pages.length ? (
        <EmptyState />
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: "title", header: t("admin.title"), sortable: true },
                { key: "slug", header: t("admin.slug"), sortable: true },
                { key: "published", header: t("admin.status"), render: (item) => item.published
                  ? <Badge variant="success">{t("admin.published")}</Badge>
                  : <Badge variant="secondary">{t("admin.draft")}</Badge>
                },
                { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatDate(item.createdAt as string) },
                { key: "actions", header: "", render: (item) => (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => {
                      const page = item as unknown as CMSPage;
                      setEditing(page);
                      setForm({ title: page.title, slug: page.slug, content: page.content, published: page.published });
                      setDialogOpen(true);
                    }}>
                      <Pencil className="h-4 w-4 mr-1" />
                      {t("admin.edit")}
                    </Button>
                    <Switch
                      checked={item.published as boolean}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: (item as CMSPage).id, published: checked })}
                    />
                  </div>
                )},
              ]}
              data={data.pages}
              keyExtractor={(item) => item.id}
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editing ? t("admin.editPage") : t("admin.createPage")} className="max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("admin.title")}</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.slug")}</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.content")}</label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.cancel")}</Button>
            <Button onClick={() => saveMutation.mutate(editing ? { ...form, id: editing.id } : form)}>
              {editing ? t("admin.save") : t("admin.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
