"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { api } from "@lib/api";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { X, Search } from "lucide-react";

interface ToolResult {
  name: string;
  slug: string;
  logoUrl: string | null;
  tagline: string;
}

interface ToolSearchSelectProps {
  value: string;
  onChange: (json: string) => void;
}

export function ToolSearchSelect({ value, onChange }: ToolSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToolResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const slugs = useMemo(() => {
    try { return JSON.parse(value || "[]") as string[]; }
    catch { return []; }
  }, [value]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<{ data: ToolResult[] }>(`/tools/search/suggestions?q=${encodeURIComponent(query)}&limit=8`);
        const filtered = (res.data || []).filter((t) => !slugs.includes(t.slug));
        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, slugs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addSlug = (slug: string) => {
    if (!slugs.includes(slug)) {
      onChange(JSON.stringify([...slugs, slug]));
    }
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeSlug = (slug: string) => {
    onChange(JSON.stringify(slugs.filter((s) => s !== slug)));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن أداة..."
          className="pr-10"
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
        {loading && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {open && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full mt-1 w-full rounded-lg border border-input bg-popover shadow-lg max-h-60 overflow-auto"
          >
            {results.map((tool) => (
              <button
                key={tool.slug}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-right hover:bg-accent transition-colors text-sm"
                onClick={() => addSlug(tool.slug)}
              >
                {tool.logoUrl ? (
                  <img src={tool.logoUrl} alt="" className="h-7 w-7 rounded object-contain bg-white" />
                ) : (
                  <div className="h-7 w-7 rounded bg-muted flex items-center justify-center text-xs font-bold">
                    {tool.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{tool.tagline}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {slugs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {slugs.map((slug) => (
            <Badge key={slug} variant="secondary" className="gap-1 text-sm">
              {slug}
              <button type="button" onClick={() => removeSlug(slug)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
