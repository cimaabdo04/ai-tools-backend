"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import { Select } from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { ErrorState } from "@components/common/error-state";
import { Save, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface WhiteLabelSettings {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  customDomain?: string;
  customCss?: string;
  active: boolean;
}

const FONTS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "opensans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
];

export default function AdminWhiteLabel() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<WhiteLabelSettings>({
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    font: "inter",
    active: false,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "white-label"],
    queryFn: () => api.get<{ settings: WhiteLabelSettings }>("/admin/white-label"),
  });

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: WhiteLabelSettings) =>
      api.put("/admin/white-label", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "white-label"] }),
  });

  if (isLoading) {
    return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.whiteLabel")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.whiteLabelDescription")}</p>
        </div>
        <Button onClick={() => saveMutation.mutate(form)}>
          <Save className="h-4 w-4 mr-2" />
          {t("admin.save")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.branding")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("admin.logo")}</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={() => {}}
                />
                {form.logo && (
                  <img src={form.logo} alt="logo" className="mt-2 h-12 object-contain" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t("admin.favicon")}</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("admin.customDomain")}</label>
                <Input
                  value={form.customDomain || ""}
                  onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                  placeholder="example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.colors")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("admin.primaryColor")}</label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t("admin.secondaryColor")}</label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.typography")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("admin.font")}</label>
                <Select
                  options={FONTS}
                  value={form.font}
                  onChange={(e) => setForm({ ...form, font: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.customCSS")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={form.customCss || ""}
                onChange={(e) => setForm({ ...form, customCss: e.target.value })}
                rows={10}
                className="font-mono text-xs"
                placeholder="/* Custom CSS */"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.preview")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border p-6 text-center"
                style={{
                  backgroundColor: form.secondaryColor + "10",
                  borderColor: form.primaryColor + "40",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                  style={{ backgroundColor: form.primaryColor + "20" }}
                >
                  <span className="text-2xl font-bold" style={{ color: form.primaryColor }}>
                    A
                  </span>
                </div>
                <p className="text-lg font-semibold mb-1">{t("admin.previewTitle")}</p>
                <p className="text-sm text-muted-foreground mb-4">{t("admin.previewDescription")}</p>
                <div className="flex gap-2 justify-center">
                  <Button style={{ backgroundColor: form.primaryColor }}>
                    {t("admin.primary")}
                  </Button>
                  <Button
                    variant="outline"
                    style={{ borderColor: form.primaryColor, color: form.primaryColor }}
                  >
                    {t("admin.secondary")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("admin.activateWhiteLabel")}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.activateWhiteLabelDescription")}</p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
