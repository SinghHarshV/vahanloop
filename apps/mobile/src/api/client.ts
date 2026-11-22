import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const TOKEN_KEY = 'vahanloop_mobile_token';

// Fallback in-memory token for environments where SecureStore isn't native
let inMemoryToken: string | null = null;

export async function getStoredToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token || inMemoryToken;
  } catch {
    return inMemoryToken;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  inMemoryToken = token;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // Keep inMemoryToken
  }
}

export async function removeStoredToken(): Promise<void> {
  inMemoryToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Keep inMemoryToken null
  }
}

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  const extraUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (extraUrl) {
    return extraUrl.replace(/\/$/, '');
  }
  return 'https://vahanloop.vercel.app';
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, retries = 1, params, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${getApiBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const token = await getStoredToken();
  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('x-client-platform', 'react-native');

  let attempts = 0;
  while (attempts <= retries) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
        throw new ApiError(errorMsg, response.status, data?.details);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        if (attempts <= retries && fetchOptions.method === 'GET') continue;
        throw new ApiError('Request timed out. Please check your network connection.', 408);
      }

      if (err instanceof ApiError) {
        throw err;
      }

      // Network failures
      if (attempts <= retries && (!fetchOptions.method || fetchOptions.method === 'GET')) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      throw new ApiError(err?.message || 'Network connection failed. Please try again.', 0);
    }
  }

  throw new ApiError('Request failed after retries', 500);
}
