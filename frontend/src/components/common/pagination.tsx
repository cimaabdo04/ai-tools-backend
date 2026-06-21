"use client";

import { Pagination as UIPagination } from "@components/ui/pagination";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  total,
  onPageChange,
}: PaginationWrapperProps) {
  return (
    <div className="flex flex-col items-center gap-2 pt-4">
      {total !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages} ({total} total results)
        </p>
      )}
      <UIPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
