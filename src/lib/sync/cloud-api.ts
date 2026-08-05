/** FASE 8.1 — cliente HTTP autenticado para /api/v1/user/*. */

import { getApiBaseUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth/session";

export type CloudCollectionResponse<T = unknown> = {
  items: T;
  updatedAt: string | null;
  etag: string;
};

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getStoredToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  };
}

export async function cloudGet<T>(
  collection: string,
  etag?: string | null,
): Promise<{ status: number; data: CloudCollectionResponse<T> | null }> {
  const url = `${getApiBaseUrl()}/api/v1/user/${collection}`;
  const headers = authHeaders(
    etag ? { "If-None-Match": `"${etag}"` } : undefined,
  );
  const res = await fetch(url, {
    headers,
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 304) {
    return { status: 304, data: null };
  }
  if (!res.ok) {
    throw new Error(`cloud_get_${res.status}`);
  }
  return { status: res.status, data: (await res.json()) as CloudCollectionResponse<T> };
}

export async function cloudPut<T>(
  collection: string,
  body: unknown,
): Promise<CloudCollectionResponse<T>> {
  const url = `${getApiBaseUrl()}/api/v1/user/${collection}`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`cloud_put_${res.status}`);
  }
  return (await res.json()) as CloudCollectionResponse<T>;
}

export async function cloudDelete(
  collection: string,
  itemId: string,
): Promise<void> {
  const url = `${getApiBaseUrl()}/api/v1/user/${collection}/${encodeURIComponent(itemId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`cloud_delete_${res.status}`);
  }
}

export async function cloudSyncStatus(): Promise<{
  lastSyncAt: string | null;
  devices: Array<{ id: string; label: string; lastSeen: string }>;
  etags: Record<string, string>;
  cloudEmpty: boolean;
}> {
  const url = `${getApiBaseUrl()}/api/v1/user/sync/status`;
  const res = await fetch(url, {
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`sync_status_${res.status}`);
  return res.json();
}

export async function cloudRegisterDevice(
  deviceId: string,
  label?: string,
): Promise<void> {
  const url = `${getApiBaseUrl()}/api/v1/user/sync/device`;
  await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ deviceId, label }),
  });
}

const ETAG_KEY = "lymiar.sync.etags.v1";

export function getCachedEtag(collection: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ETAG_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[collection] || null;
  } catch {
    return null;
  }
}

export function setCachedEtag(collection: string, etag: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ETAG_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[collection] = etag;
    localStorage.setItem(ETAG_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
