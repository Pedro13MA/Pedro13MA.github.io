/**
 * FASE 8.1 — CloudWatchAdapter activo.
 */

import type { WatchStorageAdapter } from "@/lib/watchlists/storage-adapter";
import type { WatchlistsSnapshot } from "@/lib/watchlists/types";
import { LocalWatchAdapter } from "@/lib/watchlists/local-watch-adapter";
import {
  cloudGet,
  cloudPut,
  getCachedEtag,
  setCachedEtag,
} from "@/lib/sync/cloud-api";
import { operationQueue } from "@/lib/sync/operation-queue";

const local = new LocalWatchAdapter();

export class CloudWatchAdapter implements WatchStorageAdapter {
  readonly name = "cloud";

  async load(): Promise<WatchlistsSnapshot> {
    try {
      const etag = getCachedEtag("watchlists");
      const res = await cloudGet<WatchlistsSnapshot>("watchlists", etag);
      if (res.status === 304) return local.load();
      if (res.data?.items) {
        setCachedEtag("watchlists", res.data.etag);
        await local.save(res.data.items);
        return res.data.items;
      }
      return local.load();
    } catch {
      return local.load();
    }
  }

  async save(snapshot: WatchlistsSnapshot): Promise<void> {
    await local.save(snapshot);
    try {
      const res = await cloudPut<WatchlistsSnapshot>("watchlists", {
        items: snapshot,
      });
      setCachedEtag("watchlists", res.etag);
    } catch {
      operationQueue.enqueue("watchlists", "PUT", "watchlists", {
        items: snapshot,
      });
    }
  }

  async sync(): Promise<void> {
    const snap = await this.load();
    await this.save(snap);
  }
}
