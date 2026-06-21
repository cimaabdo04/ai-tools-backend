const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

function buildUrl(path: string, params?: ApiOptions["params"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }
  return data as T;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);
  const headers = getHeaders();

  const response = await fetch(url, {
    ...fetchOptions,
    headers: { ...headers, ...(fetchOptions.headers as Record<string, string>) },
  });

  return handleResponse<T>(response);
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export async function deleteUpload(url: string): Promise<void> {
  const filename = url.split("/").pop();
  if (!filename) throw new Error("Invalid URL");
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(buildUrl(`/upload/${filename}`), {
    method: "DELETE",
    headers,
  });
  await handleResponse(response);
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(buildUrl("/upload"), {
    method: "POST",
    headers,
    body: formData,
  });
  const wrapper = await handleResponse<{ url: string }>(response);
  const url = (wrapper as any)?.data?.url || (wrapper as any)?.url;
  if (!url) throw new Error("Upload failed: no URL returned");
  return url;
}

export { ApiError };
export type { ApiOptions };
