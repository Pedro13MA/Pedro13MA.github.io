/** Cliente de sessão — JWT em sessionStorage + cookie cross-origin no Hub. */

import { apiClient } from "@/lib/api-client";
import type { LymiarSession, LymiarUser } from "@/lib/auth/types";
import type { AuthProviderId } from "@/auth.config";
import { getApiBaseUrl } from "@/lib/api-base-url";

const TOKEN_KEY = "lymiar_session_token";

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

export async function fetchSession(): Promise<LymiarSession> {
  try {
    return await apiClient.get<LymiarSession>("/api/v1/session", {
      headers: authHeaders(),
      credentials: "include",
      label: "SESSION",
    });
  } catch {
    return { authenticated: false, user: null };
  }
}

export async function fetchMe(): Promise<LymiarUser | null> {
  try {
    return await apiClient.get<LymiarUser>("/api/v1/me", {
      headers: authHeaders(),
      credentials: "include",
      label: "ME",
    });
  } catch {
    return null;
  }
}

export async function logoutRemote(): Promise<void> {
  try {
    await apiClient.post(
      "/api/v1/logout",
      undefined,
      {
        headers: authHeaders(),
        credentials: "include",
        label: "LOGOUT",
      },
    );
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
