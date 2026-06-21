"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { DataTable } from "@components/ui/data-table";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { Search, Download, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

const LOCALES = ["en", "ar", "es", "zh", "hi"];

interface Translation {
  key: string;
  translations: Record<string, string>;
}

export default function AdminTranslations() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState("en");
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "translations"],
    queryFn: () => api.get<{ translations: Translation[] }>("/admin/cms/translations"),
  });

  const saveMutation = useMutation({
    mutationFn: ({ key, value, locale }: { key: string; value: string; locale: string }) =>
      api.put(`/admin/cms/translations/${key}`, { [locale]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "translations"] });
      setEditingKey(null);
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/admin/cms/translations/import", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });

  const filtered = (data?.translations ?? []).filter(
    (tr) => !search || (tr.key ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.translations")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.translationsDescription")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("admin.export")}
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t("admin.import")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchKeys")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={locale} onValueChange={setLocale}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l} className="capitalize">{l}</TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((l) => (
          <TabsContent key={l} value={l}>
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)}</CardContent></Card>
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      { key: "key", header: t("admin.key"), sortable: true, className: "font-mono text-xs" },
                      { key: "value", header: t("admin.value"), render: (item) => {
                        const tr = item as unknown as Translation;
                        const val = tr.translations[l] || "";
                        if (editingKey === tr.key) {
                          return (
                            <div className="flex gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => saveMutation.mutate({ key: tr.key, value: editValue, locale: l })}>
                                {t("admin.save")}
                              </Button>
                            </div>
                          );
                        }
                        return (
                          <span
                            className="cursor-pointer hover:text-primary"
                            onClick={() => { setEditingKey(tr.key); setEditValue(val); }}
                          >
                            {val || <span className="text-muted-foreground italic">{t("admin.empty")}</span>}
                          </span>
                        );
                      }},
                    ]}
                    data={filtered}
                    keyExtractor={(item) => item.key}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
