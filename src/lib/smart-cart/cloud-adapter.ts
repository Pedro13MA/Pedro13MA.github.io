/**
 * FASE 8.1 — CloudSmartCartAdapter activo.
 */

import type { SmartCartStorageAdapter } from "@/lib/smart-cart/storage-adapter";
import type { SmartCartSnapshot } from "@/lib/smart-cart/types";
import { LocalSmartCartAdapter } from "@/lib/smart-cart/local-storage-adapter";
import {
  cloudGet,
  cloudPut,
  getCachedEtag,
  setCachedEtag,
} from "@/lib/sync/cloud-api";
import { operationQueue } from "@/lib/sync/operation-queue";

const local = new LocalSmartCartAdapter();

export class CloudSmartCartAdapter implements SmartCartStorageAdapter {
  readonly name = "cloud";

  async load(): Promise<SmartCartSnapshot> {
    try {
      const etag = getCachedEtag("smart_cart");
      const res = await cloudGet<SmartCartSnapshot>("smart_cart", etag);
      if (res.status === 304) return local.load();
      if (res.data?.items) {
        setCachedEtag("smart_cart", res.data.etag);
        await local.save(res.data.items);
        return res.data.items;
      }
      return local.load();
    } catch {
      return local.load();
    }
  }

  async save(snapshot: SmartCartSnapshot): Promise<void> {
    await local.save(snapshot);
    try {
      const res = await cloudPut<SmartCartSnapshot>("smart_cart", {
        items: snapshot,
      });
      setCachedEtag("smart_cart", res.etag);
    } catch {
      operationQueue.enqueue("smart_cart", "PUT", "smart_cart", {
        items: snapshot,
      });
    }
  }

  async sync(): Promise<void> {
    const snap = await this.load();
    await this.save(snap);
  }
}
