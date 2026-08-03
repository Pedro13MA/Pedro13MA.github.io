/**
 * FASE 8.1 — CloudAdapter activo (userspace: favorites + lists + alerts).
 */

import type { StorageAdapter, UserSpaceSnapshot } from "@/lib/user-space/storage-adapter";
import { LocalStorageAdapter } from "@/lib/user-space/local-storage-adapter";
import {
  cloudGet,
  cloudPut,
  getCachedEtag,
  setCachedEtag,
} from "@/lib/sync/cloud-api";
import { operationQueue } from "@/lib/sync/operation-queue";

const local = new LocalStorageAdapter();

export class CloudAdapter implements StorageAdapter {
  readonly name = "cloud";

  async load(): Promise<UserSpaceSnapshot> {
    try {
      const etag = getCachedEtag("userspace");
      const res = await cloudGet<UserSpaceSnapshot>("userspace", etag);
      if (res.status === 304) {
        return local.load();
      }
      if (res.data?.items) {
        setCachedEtag("userspace", res.data.etag);
        await local.save(res.data.items);
        return res.data.items;
      }
      return local.load();
    } catch {
      return local.load();
    }
  }

  async save(snapshot: UserSpaceSnapshot): Promise<void> {
    await local.save(snapshot);
    try {
      const res = await cloudPut<UserSpaceSnapshot>("userspace", {
        items: snapshot,
      });
      setCachedEtag("userspace", res.etag);
    } catch {
      operationQueue.enqueue("userspace", "PUT", "userspace", {
        items: snapshot,
      });
    }
  }

  async sync(): Promise<void> {
    const snap = await this.load();
    await this.save(snap);
  }
}

/** Alias pedido na FASE 8.1. */
export class CloudFavoriteAdapter extends CloudAdapter {}
export class CloudAlertAdapter extends CloudAdapter {}
export class CloudListsAdapter extends CloudAdapter {}
