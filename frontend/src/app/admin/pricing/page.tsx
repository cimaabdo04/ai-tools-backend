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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Plus, Pencil, GripVertical, Star } from "lucide-react";
import { formatCurrency } from "@lib/utils";
import { useTranslations } from "next-intl";

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features: string[];
  active: boolean;
  popular: boolean;
  sortOrder: number;
}

export default function AdminPricing() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    interval: "month",
    features: "",
    active: true,
    popular: false,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () => api.get<{ plans: Plan[] }>("/admin/pricing"),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      body.id
        ? api.put(`/admin/pricing/${body.id}`, body)
        : api.post("/admin/pricing", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, field }: { id: string; field: string }) =>
      api.patch(`/admin/pricing/${id}/toggle`, { field }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: 0, interval: "month", features: "", active: true, popular: false });
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      interval: plan.interval,
      features: plan.features.join("\n"),
      active: plan.active,
      popular: plan.popular,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.pricingPlans")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.pricingDescription")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addPlan")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-48" /></CardContent></Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.plans.length ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.plans.map((plan) => (
            <Card key={plan.id} className={plan.popular ? "border-primary relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {t("admin.popular")}
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("admin.active")}</span>
                    <Switch
                      checked={plan.active}
                      onCheckedChange={() => toggleMutation.mutate({ id: plan.id, field: "active" })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("admin.popular")}</span>
                    <Switch
                      checked={plan.popular}
                      onCheckedChange={() => toggleMutation.mutate({ id: plan.id, field: "popular" })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editing ? t("admin.editPlan") : t("admin.createPlan")} className="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("admin.name")}</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t("admin.price")}</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.description")}</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.features")} ({t("admin.onePerLine")})</label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={5} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.cancel")}</Button>
            <Button onClick={() =>
              saveMutation.mutate({
                ...(editing ? { id: editing.id } : {}),
                ...form,
                features: form.features.split("\n").filter(Boolean),
              })
            }>
              {editing ? t("admin.save") : t("admin.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
