"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { X, Plus } from "lucide-react";

interface StepData {
  title: string;
  desc: string;
}

interface StartStepsInputProps {
  value: string;
  onChange: (json: string) => void;
}

export function StartStepsInput({ value, onChange }: StartStepsInputProps) {
  const steps: StepData[] = (() => {
    try { const p = JSON.parse(value || '[]'); return Array.isArray(p) ? p : []; }
    catch { return []; }
  })();

  const sync = (updated: StepData[]) => {
    onChange(JSON.stringify(updated, null, 2));
  };

  const addStep = () => {
    sync([...steps, { title: "", desc: "" }]);
  };

  const removeStep = (idx: number) => {
    sync(steps.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: "title" | "desc", val: string) => {
    sync(steps.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => (
        <div key={idx} className="rounded-xl border border-cyan-400/20 bg-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#00d4ff]">الخطوة {idx + 1}</span>
            <button type="button" onClick={() => removeStep(idx)} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Input value={step.title} onChange={(e) => update(idx, "title", e.target.value)} placeholder="عنوان الخطوة..." />
          <Textarea value={step.desc} onChange={(e) => update(idx, "desc", e.target.value)} rows={2} placeholder="وصف الخطوة..." />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addStep}>
        <Plus className="h-4 w-4 ml-1" /> أضف خطوة
      </Button>
    </div>
  );
}
