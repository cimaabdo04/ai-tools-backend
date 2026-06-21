"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { useAuthStore } from "@stores/auth-store";
import { API_ENDPOINTS } from "@lib/constants";
import type { LoginInput, RegisterInput } from "@lib/validation";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  statusCode: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
}

interface LoginData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const { setUser, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
        setUser(res.data);
        return res.data;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await api.post<ApiResponse<LoginData>>(
        API_ENDPOINTS.AUTH.LOGIN,
        input
      );
      const { user, accessToken } = res.data;
      return { user, token: accessToken };
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { name, email, password, ref, clickId, token } = input;
      await api.post<ApiResponse<User>>(API_ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
        ...(ref ? { ref } : {}),
        ...(clickId ? { clickId } : {}),
        ...(token ? { token } : {}),
      });
      const loginRes = await api.post<ApiResponse<LoginData>>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );
      const { user, accessToken } = loginRes.data;
      return { user, token: accessToken };
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
