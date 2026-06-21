"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Plus, Pencil, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  placement: string;
  active: boolean;
  clicks: number;
  impressions: number;
  createdAt: string;
}

export default function AdminBanners() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    placement: "homepage_top",
    active: true,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: () => api.get<{ banners: Banner[] }>("/admin/banners"),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      body.id
        ? api.put(`/admin/banners/${body.id}`, body)
        : api.post("/admin/banners", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/admin/banners/${id}`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.banners")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.bannersDescription")}</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ title: "", imageUrl: "", linkUrl: "", placement: "homepage_top", active: true }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addBanner")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.banners.length ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.banners.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium truncate">{banner.title}</h3>
                        <Badge variant="outline" className="mt-1">{banner.placement}</Badge>
                      </div>
                      <Switch
                        checked={banner.active}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: banner.id, active: checked })
                        }
                      />
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span>{t("admin.clicks")}: {banner.clicks}</span>
                      <span>{t("admin.impressions")}: {banner.impressions}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditing(banner);
                        setForm({
                          title: banner.title,
                          imageUrl: banner.imageUrl,
                          linkUrl: banner.linkUrl || "",
                          placement: banner.placement,
                          active: banner.active,
                        });
                        setDialogOpen(true);
                      }}>
                        <Pencil className="h-4 w-4 mr-1" />
                        {t("admin.edit")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editing ? t("admin.editBanner") : t("admin.createBanner")} className="max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("admin.title")}</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.imageUrl")}</label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.linkUrl")}</label>
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.placement")}</label>
              <Select
                options={[
                  { value: "homepage_top", label: "Homepage Top" },
                  { value: "homepage_middle", label: "Homepage Middle" },
                  { value: "sidebar", label: "Sidebar" },
                  { value: "tool_detail", label: "Tool Detail" },
                  { value: "category_page", label: "Category Page" },
                ]}
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value })}
              />
            </div>
            {form.imageUrl && (
              <div className="rounded-md overflow-hidden border">
                <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover" />
              </div>
            )}
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
