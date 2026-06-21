"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";
import { useAuthStore } from "@stores/auth-store";

interface ReviewUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  pros: string[];
  cons: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

interface CreateReviewInput {
  toolId: string;
  title: string;
  content: string;
  rating: number;
  pros?: string[];
  cons?: string[];
}

export function useReviews(toolId: string) {
  return useQuery({
    queryKey: ["reviews", toolId],
    queryFn: () =>
      api.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST(toolId)),
    enabled: !!toolId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      api.post<{ data: { id: string; toolId: string } }>(API_ENDPOINTS.REVIEWS.CREATE, input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", res.data.toolId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      api.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
