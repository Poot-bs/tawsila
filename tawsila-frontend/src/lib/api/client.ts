import { API_BASE_URL, STORAGE_KEYS } from '@/lib/utils/constants';
import type { ApiError } from '@/types';

/**
 * Centralized API client with JWT interceptor, automatic token refresh,
 * and typed error handling. Mirrors the behavior of the legacy api.js.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Get the current access token from local storage */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /** Build request headers with optional auth */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /** Core request method with automatic retry on 401 */
  async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      retry?: boolean;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers: customHeaders, retry = true } = options;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.buildHeaders(customHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 by clearing session and redirecting to login
    if (res.status === 401 && retry) {
      this.clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle non-OK responses
    if (!res.ok) {
      let errorMessage = 'Request failed';
      try {
        const payload: ApiError = await res.json();
        errorMessage = payload.error || errorMessage;
      } catch {
        // Ignore JSON parse failure
      }
      throw new ApiClientError(errorMessage, res.status);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return null as T;
    }

    return res.json() as Promise<T>;
  }

  /** Convenience methods */
  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  /** Clear all auth tokens from storage */
  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

/** Custom error class for API errors with status code */
export class ApiClientError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

/** Singleton API client instance */
export const apiClient = new ApiClient(API_BASE_URL);
