export interface PaginatedResult<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
    totalPages?: number;
    page?: number;
    perPage?: number;
  };
}

export interface PaginationOptions {
  cursor?: string;
  take?: number;
  skip?: number;
}
