/*
 * Lightweight API client wrapper
 * - centralizes base URL
 * - injects auth token from storage
 * - normalizes JSON parsing and FastAPI error shapes
 */
import { getToken } from './storage';

export class ApiError extends Error {
  status?: number;
  details?: string[] | undefined;

  constructor(message: string, status?: number, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export type ApiOptions = RequestInit & { skipAuth?: boolean };

const getBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function safeParseJson(text: string) {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function request<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const base = getBaseUrl() || 'http://localhost:8000';
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers((opts.headers as HeadersInit) || {});

  // default to JSON when body is present and not FormData
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (opts.body && !(opts.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // inject auth
  try {
    if (!opts.skipAuth) {
      const token = getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // ignore storage errors; token simply won't be sent
  }

  const res = await fetch(url, { ...opts, headers, credentials: 'same-origin' });
  const text = await res.text();
  const body = await safeParseJson(text as string);

  if (!res.ok) {
    // Normalize FastAPI error shapes: { detail: { errors: [...] } } or detail: [...]
    let messages: string[] | undefined;
    if (body && typeof body === 'object') {
      // @ts-ignore
      const detail = (body as any).detail ?? (body as any).errors ?? undefined;
      if (Array.isArray(detail)) messages = detail.map(String);
      else if (typeof detail === 'string') messages = [detail];
      else messages = undefined;
    }

    throw new ApiError(
      messages?.join('; ') || res.statusText || 'Request failed',
      res.status,
      messages,
    );
  }

  return body as T;
}

// Convenience helpers
export const api = {
  get: <T = unknown>(path: string, opts?: ApiOptions) => request<T>(path, { method: 'GET', ...(opts || {}) }),
  post: <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...(opts || {}) }),
  put: <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body), ...(opts || {}) }),
  del: <T = unknown>(path: string, opts?: ApiOptions) => request<T>(path, { method: 'DELETE', ...(opts || {}) }),
};

export default request;
