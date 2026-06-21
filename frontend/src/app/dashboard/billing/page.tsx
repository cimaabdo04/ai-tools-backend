"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { EmptyState } from "@components/common/empty-state";
import { DataTable, type Column } from "@components/ui/data-table";
import { formatRelativeDate, formatCurrency } from "@lib/utils";
import { Download, CreditCard, Receipt, Plus } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  description: string;
  date: string;
  pdfUrl: string;
}

const mockInvoices: Invoice[] = [
  { id: "inv-1", number: "INV-2024-001", amount: 19, currency: "USD", status: "paid", description: "Professional Plan - Monthly", date: new Date(Date.now() - 86400000 * 5).toISOString(), pdfUrl: "#" },
  { id: "inv-2", number: "INV-2024-002", amount: 19, currency: "USD", status: "paid", description: "Professional Plan - Monthly", date: new Date(Date.now() - 86400000 * 35).toISOString(), pdfUrl: "#" },
  { id: "inv-3", number: "INV-2024-003", amount: 19, currency: "USD", status: "paid", description: "Professional Plan - Monthly", date: new Date(Date.now() - 86400000 * 65).toISOString(), pdfUrl: "#" },
  { id: "inv-4", number: "INV-2024-004", amount: 19, currency: "USD", status: "pending", description: "Professional Plan - Monthly", date: new Date(Date.now() - 86400000 * 1).toISOString(), pdfUrl: "#" },
  { id: "inv-5", number: "INV-2024-005", amount: 19, currency: "USD", status: "failed", description: "Professional Plan - Monthly", date: new Date(Date.now() - 86400000 * 95).toISOString(), pdfUrl: "#" },
];

const statusBadge: Record<string, "success" | "warning" | "destructive" | "default" | "secondary"> = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "default",
};

const paymentMethods = [
  { id: "pm-1", type: "visa", last4: "4242", expiry: "12/28", isDefault: true },
  { id: "pm-2", type: "mastercard", last4: "8888", expiry: "08/26", isDefault: false },
];

const columns: Column<Invoice>[] = [
  { key: "number", header: "Invoice", sortable: true },
  {
    key: "description", header: "Description", sortable: true,
    render: (i) => <span className="text-sm">{i.description}</span>,
  },
  {
    key: "date", header: "Date", sortable: true,
    render: (i) => <span className="text-sm text-muted-foreground">{new Date(i.date).toLocaleDateString()}</span>,
  },
  {
    key: "amount", header: "Amount", sortable: true,
    render: (i) => <span className="font-medium">{formatCurrency(i.amount, i.currency)}</span>,
  },
  {
    key: "status", header: "Status", sortable: true,
    render: (i) => (
      <Badge variant={statusBadge[i.status] ?? "default"} className="capitalize">{i.status}</Badge>
    ),
  },
  {
    key: "actions" as string, header: "", sortable: false,
    render: (i) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href={i.pdfUrl} download><Download className="h-4 w-4" /></a>
        </Button>
      </div>
    ),
  },
];

export default function BillingPage() {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing History</h1>
        <p className="text-muted-foreground mt-1">View your invoices and manage payment methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Invoices</CardTitle>
          <CardDescription>Your recent billing history</CardDescription>
        </CardHeader>
        <CardContent>
          {mockInvoices.length === 0 ? (
            <EmptyState title="No invoices yet" message="Your invoices will appear here once you subscribe to a paid plan" />
          ) : (
            <DataTable
              columns={columns}
              data={mockInvoices}
              keyExtractor={(i) => i.id}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />Add Method
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 rounded-md bg-muted flex items-center justify-center text-xs font-bold uppercase">
                  {pm.type}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {pm.type.charAt(0).toUpperCase() + pm.type.slice(1)} ending in {pm.last4}
                    </p>
                    {pm.isDefault && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Expires {pm.expiry}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!pm.isDefault && <Button variant="ghost" size="sm">Set Default</Button>}
                <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
