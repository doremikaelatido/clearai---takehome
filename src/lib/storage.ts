/* Storage helpers for auth tokens and small client-side values */

const AUTH_KEY = 'app_auth';

export type AuthPayload = {
  token: string;
  [k: string]: unknown;
};

export function saveAuth(payload: AuthPayload) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getAuth(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  try {
    return getAuth()?.token ?? null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}

export function setToken(token: string) {
  try {
    const existing = getAuth() || {};
    const next = { ...existing, token } as AuthPayload;
    saveAuth(next);
  } catch {
    // ignore
  }
}

export default { saveAuth, getAuth, getToken, clearAuth, setToken };
