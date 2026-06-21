export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
  statusCode: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}
