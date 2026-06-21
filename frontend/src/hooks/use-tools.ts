"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";
import type { ToolSubmissionInput } from "@lib/validation";

interface ToolCategory {
  category: { id: string; name: string; slug: string; icon?: string; color?: string };
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl?: string;
  logoUrl?: string;
  screenshotUrl?: string;
  pricingTypes?: string;
  pricingMin?: number;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
  toolCategories?: ToolCategory[];
  categories?: { id: string; name: string; slug: string }[];
  tags?: { tag: { id: string; name: string; slug: string } }[];
  features: string[];
  useCases?: string[];
  platforms: string[];
  status: string;
  createdAt: string;
  pros?: string[];
  cons?: string[];
  targetAudience?: string[];
  ratingDistribution?: Record<string, number>;
  tagline?: string;
  videoUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  faqs?: { id: string; question: string; answer: string; sortOrder: number }[];
  arabicSupport?: string;
  badge?: string;
  highlight?: string;
  stats?: string;
  models?: string;
  gallery?: string;
  country?: string;
  version?: string;
  releases?: string;
  alternativesText?: string;
  pricingDetails?: string;
  alternativeSlugs?: string;
  startSteps?: string;
  conclusion?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

interface ToolsQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  tags?: string;
  pricing?: string;
  sort?: string;
  minRating?: number;
}

const sortMap: Record<string, string> = {
  newest: "newest",
  oldest: "oldest",
  rating: "rating",
  popular: "review_count",
  name_asc: "name",
  name_desc: "name",
  price_asc: "rank_score",
  price_desc: "rank_score",
};

function parseJsonArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
}

export function normalizeTool(tool: Tool): Tool {
  return {
    ...tool,
    categories: tool.toolCategories?.map((tc) => tc.category) || [],
    pricingTypes: tool.pricingTypes || '[]',
    pros: parseJsonArray(tool.pros),
    cons: parseJsonArray(tool.cons),
    useCases: parseJsonArray(tool.useCases),
    stats: tool.stats || '{}',
    models: tool.models || '[]',
    gallery: tool.gallery || '[]',
    country: tool.country,
    version: tool.version,
    releases: tool.releases || '[]',
    pricingDetails: tool.pricingDetails || '{}',
    alternativeSlugs: tool.alternativeSlugs || '[]',
    startSteps: tool.startSteps || '[]',
    conclusion: tool.conclusion || '',
  };
}

function normalizeToolsResponse(data: PaginatedResponse<Tool>): PaginatedResponse<Tool> {
  return {
    ...data,
    data: data.data?.map(normalizeTool) || [],
  };
}

export function useTools(params: ToolsQueryParams = {}) {
  return useQuery({
    queryKey: ["tools", params],
    queryFn: () => {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (params.search) query.search = params.search;
      if (params.categoryId) query.category = params.categoryId;
      if (params.tags) query.tags = params.tags;
      if (params.pricing) query.pricingType = params.pricing;
      if (params.sort) query.sortBy = sortMap[params.sort] || "newest";
      if (params.minRating) query.minRating = params.minRating;
      const perPage = params.perPage || 12;
      query.take = perPage;
      if (params.page && params.page > 1) {
        query.skip = (params.page - 1) * perPage;
      }
      return api.get<PaginatedResponse<Tool>>(API_ENDPOINTS.TOOLS.LIST, {
        params: query,
      }).then(normalizeToolsResponse);
    },
  });
}

export function useTool(slug: string) {
  return useQuery({
    queryKey: ["tool", slug],
    queryFn: async () => {
      const res = await api.get<{ data: Tool }>(API_ENDPOINTS.TOOLS.DETAIL(slug));
      return { data: normalizeTool(res.data) };
    },
    enabled: !!slug,
  });
}

export function useFeaturedTools() {
  return useQuery({
    queryKey: ["tools", "featured"],
    queryFn: async () => {
      const res = await api.get<{ data: Tool[] }>(API_ENDPOINTS.TOOLS.FEATURED);
      return { tools: (res.data || []).map(normalizeTool) };
    },
  });
}

export function useSearchTools(query: string, enabled = true) {
  return useQuery({
    queryKey: ["tools", "search", query],
    queryFn: async () => {
      const res = await api.get<{ data: Tool[] }>(API_ENDPOINTS.TOOLS.SEARCH, {
        params: { q: query, take: 10 },
      });
      return { tools: (res as any)?.data || [] };
    },
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyTools() {
  return useQuery({
    queryKey: ["tools", "mine"],
    queryFn: () =>
      api.get<{ tools: Tool[] }>(API_ENDPOINTS.TOOLS.MY_TOOLS),
  });
}

export function useSubmitTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ToolSubmissionInput) =>
      api.post<Tool>(API_ENDPOINTS.TOOLS.SUBMIT, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: ToolSubmissionInput & { id: string }) =>
      api.put<Tool>(API_ENDPOINTS.TOOLS.UPDATE(id), input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(API_ENDPOINTS.TOOLS.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

export type { Tool, PaginatedResponse, ToolsQueryParams };
