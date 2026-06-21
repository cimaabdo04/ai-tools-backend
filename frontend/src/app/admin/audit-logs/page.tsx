"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatRelativeDate } from "@lib/utils";
import { Search, Download, ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  user: { id: string; name: string };
  details?: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

export default function AdminAuditLogs() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "audit-logs", page, search, actionFilter, entityFilter, dateFrom, dateTo],
    queryFn: () =>
      api.get<{ logs: AuditLog[]; total: number; totalPages: number }>("/admin/audit-logs", {
        params: {
          page,
          search: search || undefined,
          action: actionFilter || undefined,
          entity: entityFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.auditLogs")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.auditLogsDescription")}</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("admin.exportCSV")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchLogs")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: "", label: t("admin.allActions") },
                { value: "create", label: "Create" },
                { value: "update", label: "Update" },
                { value: "delete", label: "Delete" },
                { value: "login", label: "Login" },
                { value: "logout", label: "Logout" },
              ]}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
            <Select
              options={[
                { value: "", label: t("admin.allEntities") },
                { value: "tool", label: "Tool" },
                { value: "user", label: "User" },
                { value: "category", label: "Category" },
                { value: "review", label: "Review" },
              ]}
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-auto" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-auto" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.logs.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "expand", header: "", render: (item) => (
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(expanded === (item.id as string) ? null : item.id as string); }}>
                      {expanded === item.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )},
                  { key: "action", header: t("admin.action"), sortable: true, render: (item) => (
                    <Badge variant={item.action === "delete" ? "destructive" : item.action === "create" ? "success" : "info"}>
                      {item.action as string}
                    </Badge>
                  )},
                  { key: "entity", header: t("admin.entity"), sortable: true },
                  { key: "user", header: t("admin.user"), render: (item) => (item.user as { name: string })?.name },
                  { key: "ip", header: "IP" },
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatRelativeDate(item.createdAt as string) },
                ]}
                data={data.logs}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {expanded && data.logs.find((l) => l.id === expanded) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("admin.details")}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-48">
                  {JSON.stringify(data.logs.find((l) => l.id === expanded)?.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
