"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { api } from "@lib/api";

interface ToolFeedbackProps {
  toolId: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
}

export function ToolFeedback({ toolId, helpfulCount = 0, notHelpfulCount = 0 }: ToolFeedbackProps) {
  const [counts, setCounts] = useState({ helpful: helpfulCount, notHelpful: notHelpfulCount });
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`voted_tool_${toolId}`);
    if (stored) setVoted(stored);
  }, [toolId]);

  const handleVote = async (type: "helpful" | "notHelpful") => {
    if (voted) return;
    try {
      await api.post(`/tools/${toolId}/feedback`, { type });
      setCounts((prev) => ({
        ...prev,
        [type === "helpful" ? "helpful" : "notHelpful"]: prev[type === "helpful" ? "helpful" : "notHelpful"] + 1,
      }));
      setVoted(type);
      localStorage.setItem(`voted_tool_${toolId}`, type);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center gap-6">
      <span className="text-sm text-muted-foreground">هل كان هذا المحتوى مفيداً؟</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleVote("helpful")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
            voted === "helpful"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600"
          } ${voted && voted !== "helpful" ? "opacity-50" : ""}`}
          disabled={!!voted}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{counts.helpful}</span>
        </button>
        <button
          onClick={() => handleVote("notHelpful")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
            voted === "notHelpful"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-muted hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500"
          } ${voted && voted !== "notHelpful" ? "opacity-50" : ""}`}
          disabled={!!voted}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{counts.notHelpful}</span>
        </button>
      </div>
    </div>
  );
}
