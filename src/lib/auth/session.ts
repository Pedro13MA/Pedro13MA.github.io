/** Cliente de sessão — JWT em sessionStorage + cookie cross-origin no Hub. */

import { getApiBaseUrl } from "@/lib/api";
import type { LimiarSession, LimiarUser } from "@/lib/auth/types";
import type { AuthProviderId } from "@/auth.config";

const TOKEN_KEY = "limiar_session_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore quota */
  }
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSession(): Promise<LimiarSession> {
  const url = `${getApiBaseUrl()}/api/v1/session`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...authHeaders() },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    return { authenticated: false, user: null };
  }
  return (await res.json()) as LimiarSession;
}

export async function fetchMe(): Promise<LimiarUser | null> {
  const url = `${getApiBaseUrl()}/api/v1/me`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...authHeaders() },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as LimiarUser;
}

export async function logoutRemote(): Promise<void> {
  const url = `${getApiBaseUrl()}/api/v1/logout`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", ...authHeaders() },
      credentials: "include",
      cache: "no-store",
    });
  } finally {
    setStoredToken(null);
  }
}

export function startOAuthLogin(
  provider: AuthProviderId,
  callbackPath = "/entrar/callback/",
): void {
  if (typeof window === "undefined") return;
  const origin = window.location.origin;
  const callbackUrl = encodeURIComponent(`${origin}${callbackPath}`);
  window.location.href = `${getApiBaseUrl()}/api/v1/auth/${provider}?callbackUrl=${callbackUrl}`;
}
