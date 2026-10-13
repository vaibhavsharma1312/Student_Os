export const API_URL_KEY = 'studentos-api-base-url';
const TOKEN_KEY = 'studentos-token';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function getApiBaseUrl() {
  return (localStorage.getItem(API_URL_KEY) || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
}

export function saveApiBaseUrl(value: string) {
  localStorage.setItem(API_URL_KEY, value.trim().replace(/\/+$/, ''));
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(value: string) {
  sessionStorage.setItem(TOKEN_KEY, value);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the API. Check the backend URL and confirm that the backend allows this frontend origin.');
  }
  const text = await response.text();
  let data: unknown = text;
  try { data = text ? JSON.parse(text) : undefined; } catch { /* plain-text Spring response */ }
  if (!response.ok) {
    const body = data as { message?: string; error?: string } | undefined;
    const message = body?.message || body?.error || (typeof data === 'string' && data) || `Request failed (${response.status})`;
    if (response.status === 401) { clearToken(); window.dispatchEvent(new Event('studentos:auth-expired')); }
    throw new ApiError(message, response.status);
  }
  return data as T;
}

export async function apiForm<T>(path: string, values: Record<string, string>, method = 'POST') {
  return api<T>(`${path}?${new URLSearchParams(values)}`, { method });
}
