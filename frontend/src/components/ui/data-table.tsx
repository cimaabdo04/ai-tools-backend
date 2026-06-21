"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortable?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortable = true,
  emptyMessage = "No data found",
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal == null || bVal == null) return 0;
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                  col.sortable && sortable && "cursor-pointer select-none hover:text-foreground",
                  col.className
                )}
                onClick={() => {
                  if (col.sortable && sortable) handleSort(col.key);
                }}
              >
                <div className="flex items-center">
                  {col.header}
                  {col.sortable && sortable && <SortIcon columnKey={col.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("p-4 align-middle", col.className)}
                  >
                    {col.render
                      ? col.render(item)
                      : ((item as Record<string, unknown>)[col.key] as ReactNode) ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
