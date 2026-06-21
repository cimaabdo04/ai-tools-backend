"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { DataTable } from "@components/ui/data-table";
import { Pagination } from "@components/ui/pagination";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Skeleton } from "@components/ui/skeleton";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { formatDate, formatCurrency } from "@lib/utils";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface Payment {
  id: string;
  user: { id: string; name: string; email: string };
  amount: number;
  currency: string;
  status: string;
  provider: string;
  invoiceUrl?: string;
  createdAt: string;
}

export default function AdminPayments() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "payments", page, providerFilter, statusFilter, dateFilter],
    queryFn: () =>
      api.get<{ payments: Payment[]; total: number; totalPages: number }>("/admin/payments", {
        params: {
          page,
          provider: providerFilter || undefined,
          status: statusFilter || undefined,
          date: dateFilter || undefined,
        },
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.payments")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.paymentsDescription")}</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("admin.exportCSV")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select
              options={[
                { value: "", label: t("admin.allProviders") },
                { value: "stripe", label: "Stripe" },
                { value: "paypal", label: "PayPal" },
                { value: "razorpay", label: "Razorpay" },
              ]}
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
            />
            <Select
              options={[
                { value: "", label: t("admin.allStatus") },
                { value: "succeeded", label: "Succeeded" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}</CardContent></Card>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.payments.length ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: "id", header: t("admin.id"), render: (item) => <code className="text-xs">{(item.id as string).slice(0, 8)}...</code> },
                  { key: "user", header: t("admin.user"), render: (item) => (item.user as { name: string })?.name },
                  { key: "amount", header: t("admin.amount"), sortable: true, render: (item) => formatCurrency(Number(item.amount), item.currency as string) },
                  { key: "status", header: t("admin.status"), sortable: true, render: (item) => {
                    const v: Record<string, "success" | "warning" | "destructive" | "info"> = {
                      succeeded: "success", pending: "warning", failed: "destructive", refunded: "info",
                    };
                    return <Badge variant={v[item.status as string] || "secondary"}>{item.status as string}</Badge>;
                  }},
                  { key: "provider", header: t("admin.provider"), sortable: true },
                  { key: "createdAt", header: t("admin.date"), sortable: true, render: (item) => formatDate(item.createdAt as string) },
                  { key: "actions", header: "", render: (item) => (
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedPayment(item as unknown as Payment); setDetailOpen(true); }}>
                      {t("admin.view")}
                    </Button>
                  )},
                ]}
                data={data.payments}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
          {data.totalPages > 1 && <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent title={t("admin.paymentDetails")}>
          {selectedPayment && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("admin.amount")}</p>
                  <p className="font-medium">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("admin.status")}</p>
                  <Badge>{selectedPayment.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("admin.provider")}</p>
                  <p className="font-medium">{selectedPayment.provider}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("admin.date")}</p>
                  <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">{t("admin.customer")}</p>
                  <p className="font-medium">{(selectedPayment.user as { name: string })?.name} ({(selectedPayment.user as { email: string })?.email})</p>
                </div>
              </div>
              {selectedPayment.invoiceUrl && (
                <Button variant="outline" asChild className="w-full">
                  <a href={selectedPayment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    {t("admin.viewInvoice")}
                  </a>
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t("admin.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
