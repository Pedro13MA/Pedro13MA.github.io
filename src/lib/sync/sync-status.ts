/** FASE 8.1 — estado observável de sincronização. */

import type { SyncState, SyncStatusSnapshot } from "@/lib/sync/types";
import { operationQueue } from "@/lib/sync/operation-queue";

type Listener = (s: SyncStatusSnapshot) => void;

let snapshot: SyncStatusSnapshot = {
  state: "idle",
  lastSyncAt: null,
  error: null,
  cloudEmpty: true,
  devices: [],
  pendingOps: 0,
};

const listeners = new Set<Listener>();

function emit(): void {
  snapshot = { ...snapshot, pendingOps: operationQueue.length };
  for (const l of listeners) l(snapshot);
}

export const SyncStatus = {
  get(): SyncStatusSnapshot {
    return { ...snapshot, pendingOps: operationQueue.length };
  },
  setState(state: SyncState, error: string | null = null): void {
    snapshot = { ...snapshot, state, error };
    emit();
  },
  setLastSync(ts: number | null): void {
    snapshot = { ...snapshot, lastSyncAt: ts };
    emit();
  },
  setCloudEmpty(v: boolean): void {
    snapshot = { ...snapshot, cloudEmpty: v };
    emit();
  },
  setDevices(
    devices: Array<{ id: string; label: string; lastSeen: string }>,
  ): void {
    snapshot = { ...snapshot, devices };
    emit();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(SyncStatus.get());
    return () => listeners.delete(listener);
  },
};
