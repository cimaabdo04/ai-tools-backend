"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { Select } from "@components/ui/select";
import { EmptyState } from "@components/common/empty-state";
import { Tooltip } from "@components/ui/tooltip";
import { formatRelativeDate, formatDate } from "@lib/utils";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle, CheckCheck, BarChart3 } from "lucide-react";

const keySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  permissions: z.enum(["read", "read_write", "full"]),
});

type KeyForm = z.infer<typeof keySchema>;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  permissions: string;
  createdAt: string;
  lastUsed: string | null;
  usage: number;
}

const mockKeys: ApiKey[] = [
  { id: "k1", name: "Production", key: "aitd_p1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0", maskedKey: "aitd_p1a2...r9s0", permissions: "read_write", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastUsed: new Date(Date.now() - 3600000).toISOString(), usage: 15420 },
  { id: "k2", name: "Development", key: "aitd_d9e8f7g6h5i4j3k2l1m0n9o8p7q6r5s4t3u2v1", maskedKey: "aitd_d9e8...u2v1", permissions: "full", createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), lastUsed: new Date(Date.now() - 86400000).toISOString(), usage: 3200 },
  { id: "k3", name: "Staging", key: "aitd_s0z9y8x7w6v5u4t3s2r1q0p9o8i7u6y5t4r3e2", maskedKey: "aitd_s0z9...r3e2", permissions: "read", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), lastUsed: null, usage: 540 },
];

const permissionLabels: Record<string, string> = {
  read: "Read Only",
  read_write: "Read & Write",
  full: "Full Access",
};

export default function ApiKeysPage() {
  const t = useTranslations();
  const [keys, setKeys] = useState<ApiKey[]>(mockKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const form = useForm<KeyForm>({
    resolver: zodResolver(keySchema),
    defaultValues: { name: "", permissions: "read_write" },
  });

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const onSubmit = (data: KeyForm) => {
    const generatedKey = `aitd_${Array.from({ length: 40 }, () => Math.random().toString(36)[2]).join("")}`;
    const masked = generatedKey.slice(0, 9) + "..." + generatedKey.slice(-4);
    const newKey: ApiKey = {
      id: String(Date.now()),
      name: data.name,
      key: generatedKey,
      maskedKey: masked,
      permissions: data.permissions,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usage: 0,
    };
    setKeys((prev) => [newKey, ...prev]);
    setNewKeyValue(generatedKey);
    setShowKey(newKey.id);
    form.reset();
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewKeyValue(null);
    setShowKey(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage your API keys for programmatic access</p>
        </div>
        <Button onClick={() => { setDialogOpen(true); setNewKeyValue(null); }}>
          <Plus className="h-4 w-4 mr-2" />Create API Key
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent
          title={newKeyValue ? "API Key Created" : "Create API Key"}
          description={newKeyValue ? "Copy this key now. You won't be able to see it again." : "Give your key a name and choose permissions"}
        >
          {newKeyValue ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>This key will only be shown once. Copy it now and store it securely.</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 rounded-md bg-muted text-sm font-mono break-all">{newKeyValue}</code>
                <Tooltip content={copiedId === "new" ? "Copied!" : "Copy"}>
                  <Button variant="outline" size="icon" onClick={() => handleCopy(newKeyValue, "new")}>
                    {copiedId === "new" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </Tooltip>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCloseDialog}>Done</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Key Name</label>
                <Input {...form.register("name")} placeholder="e.g., Production, Development" error={form.formState.errors.name?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Permissions</label>
                <Select {...form.register("permissions")}
                  options={[
                    { value: "read", label: "Read Only" },
                    { value: "read_write", label: "Read & Write" },
                    { value: "full", label: "Full Access" },
                  ]}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit">Create Key</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {keys.length === 0 ? (
        <EmptyState
          title="No API keys"
          message="Create an API key to get started with programmatic access"
          action={{ label: "Create API Key", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <Badge variant="secondary" className="text-xs">{permissionLabels[apiKey.permissions] ?? apiKey.permissions}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {showKey === apiKey.id ? apiKey.key : apiKey.maskedKey}
                        </code>
                        <Tooltip content="Toggle visibility">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}>
                            {showKey === apiKey.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        </Tooltip>
                        <Tooltip content={copiedId === apiKey.id ? "Copied!" : "Copy"}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(apiKey.key, apiKey.id)}>
                            {copiedId === apiKey.id ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Created {formatRelativeDate(apiKey.createdAt)}</span>
                        {apiKey.lastUsed ? (
                          <span>Last used {formatRelativeDate(apiKey.lastUsed)}</span>
                        ) : (
                          <span>Never used</span>
                        )}
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />{apiKey.usage.toLocaleString()} requests
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleRevoke(apiKey.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold">{keys.reduce((sum, k) => sum + k.usage, 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold">{keys.length}</p>
              <p className="text-sm text-muted-foreground">Active Keys</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold">100,000</p>
              <p className="text-sm text-muted-foreground">Monthly Limit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
