/**
 * FASE 7.19 — WatchStorageAdapter.
 */

import type { WatchlistsSnapshot } from "@/lib/watchlists/types";

export interface WatchStorageAdapter {
  readonly name: string;
  load(): Promise<WatchlistsSnapshot>;
  save(snapshot: WatchlistsSnapshot): Promise<void>;
  /** FASE 8 — sync cloud. */
  sync?(): Promise<void>;
}

export function emptyWatchlistsSnapshot(): WatchlistsSnapshot {
  return { version: 1, watches: [], events: [] };
}
