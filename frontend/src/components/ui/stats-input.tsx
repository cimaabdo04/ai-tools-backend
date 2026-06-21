"use client";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { X, Plus } from "lucide-react";

interface StatsInputProps {
  value: string;
  onChange: (json: string) => void;
}

export function StatsInput({ value, onChange }: StatsInputProps) {
  const entries: [string, string][] = (() => {
    try {
      const obj = JSON.parse(value || '{}');
      if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj) as [string, string][];
      }
    } catch { /* ignore */ }
    return [];
  })();

  const sync = (updated: [string, string][]) => {
    const obj = Object.fromEntries(updated.filter(([k]) => k.trim()));
    onChange(JSON.stringify(obj));
  };

  const addEntry = () => {
    sync([...entries, ["", ""]]);
  };

  const removeEntry = (idx: number) => {
    sync(entries.filter((_, i) => i !== idx));
  };

  const updateKey = (idx: number, val: string) => {
    sync(entries.map((e, i) => i === idx ? [val, e[1]] : e));
  };

  const updateVal = (idx: number, val: string) => {
    sync(entries.map((e, i) => i === idx ? [e[0], val] : e));
  };

  return (
    <div className="space-y-2">
      {entries.map(([key, val], idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input value={key} onChange={(e) => updateKey(idx, e.target.value)} placeholder="المفتاح" className="flex-1" />
          <Input value={val} onChange={(e) => updateVal(idx, e.target.value)} placeholder="القيمة" className="flex-1" />
          <button type="button" onClick={() => removeEntry(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addEntry}>
        <Plus className="h-4 w-4 ml-1" /> أضف إحصائية
      </Button>
    </div>
  );
}
