/**
 * FASE 7.19 — LocalWatchAdapter (localStorage).
 */

import {
  emptyWatchlistsSnapshot,
  type WatchStorageAdapter,
} from "@/lib/watchlists/storage-adapter";
import type { WatchlistsSnapshot } from "@/lib/watchlists/types";

export const WATCHLISTS_STORAGE_KEY = "lymiar.watchlists.v1";

export class LocalWatchAdapter implements WatchStorageAdapter {
  readonly name = "local";

  async load(): Promise<WatchlistsSnapshot> {
    if (typeof window === "undefined") return emptyWatchlistsSnapshot();
    try {
      const raw = window.localStorage.getItem(WATCHLISTS_STORAGE_KEY);
      if (!raw) return emptyWatchlistsSnapshot();
      const parsed = JSON.parse(raw) as WatchlistsSnapshot;
      return {
        version: 1,
        watches: Array.isArray(parsed.watches) ? parsed.watches : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    } catch {
      return emptyWatchlistsSnapshot();
    }
  }

  async save(snapshot: WatchlistsSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        WATCHLISTS_STORAGE_KEY,
        JSON.stringify(snapshot),
      );
      window.dispatchEvent(new CustomEvent("lymiar:watchlists-changed"));
    } catch {
      /* quota */
    }
  }
}
