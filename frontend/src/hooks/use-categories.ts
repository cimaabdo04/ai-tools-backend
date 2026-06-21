"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  iconUrl?: string;
  parentId?: string | null;
  children?: Category[];
  toolCount: number;
  tags?: { id: string; name: string; slug: string }[];
  createdAt: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<{ data: Category[] }>(API_ENDPOINTS.CATEGORIES.LIST);
      return { categories: res.data };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const res = await api.get<{ data: Category }>(API_ENDPOINTS.CATEGORIES.DETAIL(slug));
      return { category: res.data };
    },
    enabled: !!slug,
  });
}

export type { Category };
