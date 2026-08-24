import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody, ApiResponse } from '@/types/api';
import type { AuthResult } from '@/types/models';
import { tokenStorage } from './storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 20000,
});

let accessToken: string | null = null;
let onSessionRenewed: ((result: AuthResult) => void) | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Wired by the auth store so the api layer never imports app state. */
export function registerAuthHandlers(handlers: {
  onSessionRenewed: (result: AuthResult) => void;
  onSessionExpired: () => void;
}): void {
  onSessionRenewed = handlers.onSessionRenewed;
  onSessionExpired = handlers.onSessionExpired;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<AuthResult | null> | null = null;

async function refreshSession(): Promise<AuthResult | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await axios.post<ApiResponse<AuthResult>>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refreshToken },
      { timeout: 15000 }
    );
    return response.data.data;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const isAuthRoute = original?.url?.startsWith('/auth/') ?? false;

    if (error.response?.status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      // Single-flight: concurrent 401s share one refresh call.
      refreshPromise = refreshPromise ?? refreshSession();
      const renewed = await refreshPromise;
      refreshPromise = null;

      if (renewed) {
        setAccessToken(renewed.accessToken);
        await tokenStorage.setTokens(renewed.accessToken, renewed.refreshToken);
        onSessionRenewed?.(renewed);
        original.headers.Authorization = `Bearer ${renewed.accessToken}`;
        return api.request(original);
      }
      onSessionExpired?.();
    }
    return Promise.reject(error);
  }
);

/** Human-readable message from any thrown API error. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Check your connection.';
    if (!error.response) return 'Cannot reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
}

export function apiFieldErrors(error: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    for (const fieldError of error.response?.data?.errors ?? []) {
      if (fieldError.field && !map[fieldError.field]) {
        map[fieldError.field] = fieldError.message;
      }
    }
  }
  return map;
}
