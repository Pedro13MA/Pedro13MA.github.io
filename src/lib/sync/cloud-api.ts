/** FASE 8.1 — cliente HTTP autenticado para /api/v1/user/*. */

import { apiClient, apiFetchRaw } from "@/lib/api-client";
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
  const path = `/api/v1/user/${collection}`;
  const res = await apiFetchRaw(path, {
    headers: authHeaders(
      etag ? { "If-None-Match": `"${etag}"` } : undefined,
    ),
    credentials: "include",
    label: "CLOUD_GET",
  });
  if (res.status === 304) {
    return { status: 304, data: null };
  }
  if (!res.ok) {
    throw new Error(`cloud_get_${res.status}`);
  }
  return {
    status: res.status,
    data: (await res.json()) as CloudCollectionResponse<T>,
  };
}

export async function cloudPut<T>(
  collection: string,
  body: unknown,
): Promise<CloudCollectionResponse<T>> {
  return apiClient.post<CloudCollectionResponse<T>>(
    `/api/v1/user/${collection}`,
    body,
    {
      headers: authHeaders(),
      credentials: "include",
      label: "CLOUD_PUT",
    },
  );
}

export async function cloudDelete(
  collection: string,
  itemId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/v1/user/${collection}/${encodeURIComponent(itemId)}`,
    {
      headers: authHeaders(),
      credentials: "include",
      label: "CLOUD_DELETE",
    },
  );
}

export async function cloudSyncStatus(): Promise<{
  lastSyncAt: string | null;
  devices: Array<{ id: string; label: string; lastSeen: string }>;
  etags: Record<string, string>;
  cloudEmpty: boolean;
}> {
  return apiClient.get("/api/v1/user/sync/status", {
    headers: authHeaders(),
    credentials: "include",
    label: "SYNC_STATUS",
  });
}

export async function cloudRegisterDevice(
  deviceId: string,
  label?: string,
): Promise<void> {
  await apiClient.post(
    "/api/v1/user/sync/device",
    { deviceId, label },
    {
      headers: authHeaders(),
      credentials: "include",
      label: "SYNC_DEVICE",
    },
  );
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
