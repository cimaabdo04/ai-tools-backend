"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorId: string;
  authorName: string;
  published: boolean;
  publishedAt: string;
  tags: string[];
  viewCount: number;
  locale: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

export function useBlogPosts(params?: {
  cursor?: string;
  take?: number;
  locale?: string;
  tag?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["blog", "list", params],
    queryFn: () =>
      api.get<PaginatedResponse<BlogPost>>(API_ENDPOINTS.BLOG.LIST, {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () =>
      api.get<{ data: BlogPost }>(API_ENDPOINTS.BLOG.DETAIL(slug)),
    enabled: !!slug,
  });
}
