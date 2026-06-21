"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Select } from "@components/ui/select";
import { EmptyState } from "@components/common/empty-state";
import { ErrorState } from "@components/common/error-state";
import { LoadingSpinner } from "@components/common/loading-spinner";
import { ROUTES } from "@lib/constants";
import { formatRelativeDate, formatDate, truncate } from "@lib/utils";
import {
  FileText, PlusCircle, ExternalLink, Eye, Edit3, Clock, CheckCircle2, XCircle, AlertCircle, ArrowUpRight,
} from "lucide-react";

type SubmissionStatus = "draft" | "pending" | "approved" | "rejected";

interface Submission {
  id: string;
  name: string;
  slug: string;
  status: SubmissionStatus;
  category: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

const mockSubmissions: Submission[] = [
  { id: "s1", name: "AI Writer Pro", slug: "ai-writer-pro", status: "approved", category: "Writing", submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(), reviewedAt: new Date(Date.now() - 86400000).toISOString(), reviewNote: null },
  { id: "s2", name: "ImageGenius", slug: "imagegenius", status: "pending", category: "Image", submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(), reviewedAt: null, reviewNote: null },
  { id: "s3", name: "CodeHelper AI", slug: "codehelper-ai", status: "rejected", category: "Development", submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(), reviewedAt: new Date(Date.now() - 86400000 * 7).toISOString(), reviewNote: "Duplicate submission. This tool already exists in our directory." },
  { id: "s4", name: "VideoMagic", slug: "videomagic", status: "draft", category: "Video", submittedAt: new Date(Date.now() - 86400000 * 20).toISOString(), reviewedAt: null, reviewNote: null },
];

const statusConfig: Record<SubmissionStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "default" | "info" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending Review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function SubmissionsPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<string>("all");
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  if (isLoading) return <LoadingSpinner className="py-20" />;
  if (isError) return <ErrorState onRetry={() => setIsError(false)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground mt-1">Tools you have submitted to the directory</p>
        </div>
        <Button asChild>
          <Link href={ROUTES.DASHBOARD_SUBMIT}>
            <PlusCircle className="h-4 w-4 mr-2" />Submit New Tool
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {["all", "draft", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === status ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {status === "all" ? "All" : statusConfig[status as SubmissionStatus]?.label ?? status}
            {status !== "all" && (
              <span className="ml-1.5 opacity-70">({submissions.filter((s) => s.status === status).length})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No submissions found"
          message={filter !== "all" ? `No tools with status "${filter}"` : "You haven't submitted any tools yet"}
          action={{ label: "Submit Your First Tool", onClick: () => window.location.href = ROUTES.DASHBOARD_SUBMIT }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                      {sub.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{sub.name}</h3>
                        <Badge variant={statusConfig[sub.status].variant as "success" | "warning" | "destructive" | "secondary" | "default"}>
                          {statusConfig[sub.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />Submitted {formatRelativeDate(sub.submittedAt)}
                        </span>
                        <span>{sub.category}</span>
                        {sub.reviewedAt && (
                          <span>Reviewed {formatRelativeDate(sub.reviewedAt)}</span>
                        )}
                      </div>
                      {sub.reviewNote && (
                        <div className="mt-2 p-2 rounded-md bg-destructive/10 text-sm text-destructive">
                          <span className="font-medium">Note: </span>{sub.reviewNote}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {sub.status === "approved" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={ROUTES.TOOL_DETAIL(sub.slug)}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    )}
                    {(sub.status === "draft" || sub.status === "rejected") && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={ROUTES.DASHBOARD_SUBMIT}><Edit3 className="h-4 w-4" /></Link>
                      </Button>
                    )}
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
