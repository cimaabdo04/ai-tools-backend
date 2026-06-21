"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { API_ENDPOINTS } from "@lib/constants";
import { useAuthStore } from "@stores/auth-store";

interface Bookmark {
  id: string;
  toolId: string;
  createdAt: string;
}

export function useBookmarks() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: () =>
      api.get<{ bookmarks: Bookmark[] }>(API_ENDPOINTS.BOOKMARKS.LIST),
    enabled: !!token,
    retry: false,
  });
}

export function useCheckBookmark(toolId: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["bookmarks", "check", toolId],
    queryFn: () =>
      api.get<{ bookmarked: boolean; bookmarkId?: string }>(
        API_ENDPOINTS.BOOKMARKS.CHECK(toolId)
      ),
    enabled: !!toolId && !!token,
    retry: false,
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toolId: string) =>
      api.post<Bookmark>(API_ENDPOINTS.BOOKMARKS.ADD, { toolId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(API_ENDPOINTS.BOOKMARKS.REMOVE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
