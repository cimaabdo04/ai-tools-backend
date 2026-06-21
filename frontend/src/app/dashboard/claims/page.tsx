"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { EmptyState } from "@components/common/empty-state";
import { LoadingSpinner } from "@components/common/loading-spinner";
import { formatRelativeDate, truncate } from "@lib/utils";
import {
  Shield, Plus, Upload, FileText, ExternalLink, CheckCircle2, XCircle, Clock, AlertCircle,
} from "lucide-react";

const claimSchema = z.object({
  toolName: z.string().min(2, "Tool name is required"),
  toolUrl: z.string().url("Must be a valid URL"),
  evidenceNotes: z.string().min(10, "Please provide more details about your claim").max(2000),
  evidenceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ClaimForm = z.infer<typeof claimSchema>;

type ClaimStatus = "pending" | "approved" | "rejected";

interface ClaimRequest {
  id: string;
  toolName: string;
  toolUrl: string;
  status: ClaimStatus;
  submittedAt: string;
  reviewedAt: string | null;
  notes: string | null;
}

const mockClaims: ClaimRequest[] = [
  { id: "c1", toolName: "AI Writer Pro", toolUrl: "https://aiwriterpro.com", status: "approved", submittedAt: new Date(Date.now() - 86400000 * 30).toISOString(), reviewedAt: new Date(Date.now() - 86400000 * 25).toISOString(), notes: null },
  { id: "c2", toolName: "ImageGenius", toolUrl: "https://imagegenius.io", status: "pending", submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(), reviewedAt: null, notes: null },
  { id: "c3", toolName: "DataViz AI", toolUrl: "https://dataviz.ai", status: "rejected", submittedAt: new Date(Date.now() - 86400000 * 60).toISOString(), reviewedAt: new Date(Date.now() - 86400000 * 55).toISOString(), notes: "Insufficient evidence of ownership. Please provide documentation." },
];

const statusBadge: Record<ClaimStatus, { label: string; variant: "success" | "warning" | "destructive" | "default" | "secondary" }> = {
  pending: { label: "Pending Review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function ClaimsPage() {
  const t = useTranslations();
  const [claims, setClaims] = useState<ClaimRequest[]>(mockClaims);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
    defaultValues: { toolName: "", toolUrl: "", evidenceNotes: "", evidenceUrl: "" },
  });

  const onSubmit = (data: ClaimForm) => {
    const newClaim: ClaimRequest = {
      id: String(Date.now()),
      toolName: data.toolName,
      toolUrl: data.toolUrl,
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      notes: null,
    };
    setClaims((prev) => [newClaim, ...prev]);
    setDialogOpen(false);
    form.reset();
  };

  if (isLoading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claim Ownership</h1>
          <p className="text-muted-foreground mt-1">Claim ownership of tools in our directory</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New Claim
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title="Submit Ownership Claim" description="Provide evidence that you own or represent this tool">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tool Name</label>
              <Input {...form.register("toolName")} placeholder="e.g., My AI Tool" error={form.formState.errors.toolName?.message} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tool Website URL</label>
              <Input {...form.register("toolUrl")} placeholder="https://myaitool.com" error={form.formState.errors.toolUrl?.message} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Evidence / Notes</label>
              <Textarea {...form.register("evidenceNotes")} rows={4}
                placeholder="Explain your relationship to this tool and provide evidence of ownership (e.g., domain verification, role at company, etc.)"
                error={form.formState.errors.evidenceNotes?.message}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Supporting Document URL (optional)</label>
              <Input {...form.register("evidenceUrl")} placeholder="https://example.com/verification.pdf" error={form.formState.errors.evidenceUrl?.message} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Claim</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {claims.length === 0 ? (
        <EmptyState
          title="No claims yet"
          message="Submit a claim to verify ownership of a tool"
          action={{ label: "Submit Claim", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{claim.toolName}</h3>
                        <Badge variant={statusBadge[claim.status].variant as "success" | "warning" | "destructive" | "secondary" | "default"}>
                          {statusBadge[claim.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <a href={claim.toolUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                          {claim.toolUrl} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Submitted {formatRelativeDate(claim.submittedAt)}</span>
                      </div>
                      {claim.notes && (
                        <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md">{claim.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
