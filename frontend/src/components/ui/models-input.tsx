"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { X, Plus, Bot, Zap } from "lucide-react";

interface ModelData {
  name: string;
  audience: string[];
  specs: string;
  useCases: string[];
}

interface ModelsInputProps {
  value: string;
  onChange: (json: string) => void;
}

export function ModelsInput({ value, onChange }: ModelsInputProps) {
  const models: ModelData[] = (() => {
    try { const p = JSON.parse(value || '[]'); return Array.isArray(p) ? p : []; }
    catch { return []; }
  })();

  const [adding, setAdding] = useState<{ idx: number; field: "audience" | "useCases" } | null>(null);
  const [inputVal, setInputVal] = useState("");

  const sync = (updated: ModelData[]) => {
    onChange(JSON.stringify(updated, null, 2));
  };

  const addModel = () => {
    const label = models.length === 0 ? "Pro" : models.length === 1 ? "Flash" : `نموذج ${models.length + 1}`;
    sync([...models, { name: label, audience: [], specs: "", useCases: [] }]);
  };

  const removeModel = (idx: number) => {
    sync(models.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, field: keyof ModelData, val: any) => {
    sync(models.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  const confirmAdd = () => {
    if (!adding || !inputVal.trim()) return;
    const { idx, field } = adding;
    sync(models.map((m, i) => i === idx ? { ...m, [field]: [...m[field], inputVal.trim()] } : m));
    setAdding(null);
    setInputVal("");
  };

  const removeListItem = (idx: number, field: "audience" | "useCases", itemIdx: number) => {
    sync(models.map((m, i) => i === idx ? { ...m, [field]: m[field].filter((_, fi) => fi !== itemIdx) } : m));
  };

  return (
    <div className="space-y-4">
      {models.map((model, idx) => (
        <div key={idx} className="rounded-xl border border-cyan-400/20 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[#00d4ff]">
              {idx === 0 ? <Bot className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
              <span>{model.name || `نموذج ${idx + 1}`}</span>
            </div>
            <button type="button" onClick={() => removeModel(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#a0a8e0] mb-1 block">الاسم</label>
              <Input value={model.name} onChange={(e) => updateField(idx, "name", e.target.value)} placeholder={idx === 0 ? "Pro" : "Flash"} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#a0a8e0] mb-1 block">المواصفات</label>
              <Input value={model.specs} onChange={(e) => updateField(idx, "specs", e.target.value)} placeholder="مثال: أعلى أداء" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#a0a8e0] mb-1 block">الجمهور المستهدف</label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {model.audience.map((item, fi) => (
                <span key={fi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-xs text-[#00d4ff]">
                  {item}
                  <button type="button" onClick={() => removeListItem(idx, "audience", fi)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {adding?.idx === idx && adding?.field === "audience" ? (
              <div className="flex gap-2">
                <Input value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmAdd(); }} placeholder="أدخل فئة جمهور..." autoFocus />
                <Button type="button" size="sm" onClick={confirmAdd}>إضافة</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setAdding(null); setInputVal(""); }}>إلغاء</Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => { setAdding({ idx, field: "audience" }); setInputVal(""); }} className="text-xs">
                <Plus className="h-3 w-3 ml-1" /> أضف فئة
              </Button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-[#a0a8e0] mb-1 block">حالات الاستخدام</label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {model.useCases.map((item, fi) => (
                <span key={fi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-xs text-purple-400">
                  {item}
                  <button type="button" onClick={() => removeListItem(idx, "useCases", fi)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {adding?.idx === idx && adding?.field === "useCases" ? (
              <div className="flex gap-2">
                <Input value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmAdd(); }} placeholder="أدخل حالة استخدام..." autoFocus />
                <Button type="button" size="sm" onClick={confirmAdd}>إضافة</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setAdding(null); setInputVal(""); }}>إلغاء</Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => { setAdding({ idx, field: "useCases" }); setInputVal(""); }} className="text-xs">
                <Plus className="h-3 w-3 ml-1" /> أضف استخدام
              </Button>
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addModel}>
        <Plus className="h-4 w-4 ml-1" /> أضف نموذج
      </Button>
    </div>
  );
}
