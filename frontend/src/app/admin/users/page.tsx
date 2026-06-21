"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { Search } from "lucide-react";
import { getInitials, formatDate } from "@lib/utils";
import { useDebounce } from "@hooks/use-debounce";
import { useTranslations } from "next-intl";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
  toolsCount: number;
  createdAt: string;
}

export default function AdminUsers() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "users", page, debouncedSearch, roleFilter, statusFilter],
    queryFn: () =>
      api.get<{ users: AdminUser[]; total: number; totalPages: number }>("/admin/users", {
        params: {
          page,
          search: debouncedSearch || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
      }),
  });

  const userDetailQuery = useQuery({
    queryKey: ["admin", "user", selectedUser?.id],
    queryFn: () => api.get<{ user: AdminUser }>(`/admin/users/${selectedUser?.id}`),
    enabled: !!selectedUser && detailOpen,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; role?: string }) =>
      api.patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.users")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.usersDescription")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchUsers")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: "", label: t("admin.allRoles") },
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            />
            <Select
              options={[
                { value: "", label: t("admin.allStatus") },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
                { value: "banned", label: "Banned" },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.users.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "user", header: t("admin.user"), render: (item) => (
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={(item.avatar as string) || undefined} />
                        <AvatarFallback>{getInitials(item.name as string)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.name as string}</p>
                        <p className="text-xs text-muted-foreground">{item.email as string}</p>
                      </div>
                    </div>
                  )},
                  { key: "role", header: t("admin.role"), sortable: true, render: (item) => (
                    <Badge variant={item.role === "admin" ? "default" : "secondary"}>
                      {item.role as string}
                    </Badge>
                  )},
                  { key: "status", header: t("admin.status"), sortable: true, render: (item) => {
                    const variant = item.status === "active" ? "success" : item.status === "suspended" ? "warning" : "destructive";
                    return <Badge variant={variant as "success" | "warning" | "destructive"}>{item.status as string}</Badge>;
                  }},
                  { key: "toolsCount", header: t("admin.tools"), sortable: true },
                  { key: "createdAt", header: t("admin.joined"), sortable: true, render: (item) => formatDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedUser(item as unknown as AdminUser);
                        setDetailOpen(true);
                      }}>{t("admin.view")}</Button>
                      {item.role !== "admin" && (
                        <>
                          {(item.status as string) === "active" ? (
                            <Button size="sm" variant="ghost" onClick={() => updateUserMutation.mutate({ id: (item as AdminUser).id, status: "suspended" })}>
                              {t("admin.suspend")}
                            </Button>
                          ) : (item.status as string) === "suspended" ? (
                            <Button size="sm" variant="ghost" onClick={() => updateUserMutation.mutate({ id: (item as AdminUser).id, status: "active" })}>
                              {t("admin.activate")}
                            </Button>
                          ) : null}
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateUserMutation.mutate({ id: (item as AdminUser).id, status: "banned" })}>
                            {t("admin.ban")}
                          </Button>
                        </>
                      )}
                    </div>
                  )},
                ]}
                data={data.users}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent title={t("admin.userDetails")} className="max-w-2xl">
          {userDetailQuery.data?.user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage src={userDetailQuery.data.user.avatar} />
                  <AvatarFallback>{getInitials(userDetailQuery.data.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{userDetailQuery.data.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{userDetailQuery.data.user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t("admin.role")}</p>
                  <Select
                    options={[
                      { value: "user", label: "User" },
                      { value: "admin", label: "Admin" },
                    ]}
                    value={userDetailQuery.data.user.role}
                    onChange={(e) => updateUserMutation.mutate({ id: userDetailQuery.data.user.id, role: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("admin.status")}</p>
                  <Select
                    options={[
                      { value: "active", label: "Active" },
                      { value: "suspended", label: "Suspended" },
                      { value: "banned", label: "Banned" },
                    ]}
                    value={userDetailQuery.data.user.status}
                    onChange={(e) => updateUserMutation.mutate({ id: userDetailQuery.data.user.id, status: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("admin.joined")}: {formatDate(userDetailQuery.data.user.createdAt)}
              </p>
            </div>
          ) : (
            <Skeleton className="h-48" />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t("admin.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
