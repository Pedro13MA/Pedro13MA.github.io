/** FASE 8.1 — tipos do Sync Engine. */

export type SyncState =
  | "idle"
  | "synced"
  | "syncing"
  | "offline"
  | "error"
  | "pending_merge";

export type SyncCollection =
  | "userspace"
  | "projects"
  | "smart_cart"
  | "watchlists"
  | "compare"
  | "preferences";

export type MergeChoice = "keep_both" | "replace_cloud" | "ignore_local";

export type QueuedOp = {
  id: string;
  collection: SyncCollection;
  method: "PUT" | "DELETE";
  path: string;
  body?: unknown;
  createdAt: number;
};

export type SyncStatusSnapshot = {
  state: SyncState;
  lastSyncAt: number | null;
  error: string | null;
  cloudEmpty: boolean;
  devices: Array<{ id: string; label: string; lastSeen: string }>;
  pendingOps: number;
};

export type UserPreferences = {
  theme?: "light" | "dark" | "system";
  locale?: string;
  layout?: string;
  homepage?: Record<string, unknown>;
  categoryOrder?: string[];
  compare?: Record<string, unknown>;
  projectTemplates?: Record<string, unknown>;
  watchSettings?: Record<string, unknown>;
  updatedAt?: number;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  locale: "pt-PT",
  updatedAt: 0,
};
