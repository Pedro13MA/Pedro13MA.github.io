/** FASE 8.1 — Sync Engine exports. */

export { SyncService } from "@/lib/sync/sync-service";
export { SyncStatus } from "@/lib/sync/sync-status";
export { OperationQueue, operationQueue } from "@/lib/sync/operation-queue";
export { ConflictResolver } from "@/lib/sync/conflict-resolver";
export type {
  SyncState,
  SyncStatusSnapshot,
  MergeChoice,
  UserPreferences,
  SyncCollection,
} from "@/lib/sync/types";
