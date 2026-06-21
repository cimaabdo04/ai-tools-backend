"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";

interface FaqManagerProps {
  toolId: string;
}

export function FaqManager({ toolId }: FaqManagerProps) {
  const queryClient = useQueryClient();
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const { data: faqResponse, isLoading } = useQuery({
    queryKey: ["admin", "faqs", toolId],
    queryFn: () => api.get<{ data: any[] }>(`/admin/tools/${toolId}/faqs`),
    enabled: !!toolId,
  });

  const faqs = faqResponse?.data ?? [];

  const createFaq = useMutation({
    mutationFn: (body: { question: string; answer: string }) =>
      api.post(`/admin/tools/${toolId}/faqs`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faqs", toolId] });
      setNewQuestion("");
      setNewAnswer("");
    },
  });

  const deleteFaq = useMutation({
    mutationFn: (faqId: string) => api.delete(`/admin/tools/${toolId}/faqs/${faqId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "faqs", toolId] }),
  });

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    createFaq.mutate({ question: newQuestion.trim(), answer: newAnswer.trim() });
  };

  return (
    <div className="space-y-4">
      {faqs.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground text-center py-4">لا توجد أسئلة شائعة بعد</p>
      )}
      {faqs.map((faq: any) => (
        <div key={faq.id} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{faq.question}</p>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{faq.answer}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 shrink-0"
            onClick={() => deleteFaq.mutate(faq.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2 border-t pt-4">
        <h4 className="text-sm font-medium">إضافة سؤال جديد</h4>
        <Input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="السؤال"
        />
        <Textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="الإجابة"
          rows={3}
        />
        <Button size="sm" onClick={handleAdd} disabled={!newQuestion.trim() || !newAnswer.trim() || createFaq.isPending}>
          <Plus className="h-4 w-4 ml-1" />
          {createFaq.isPending ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </div>
    </div>
  );
}
