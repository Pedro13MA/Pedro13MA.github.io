/**
 * FASE 8.1 — CloudCompareAdapter.
 */

import {
  readCompareList,
  writeCompareList,
  type CompareItem,
} from "@/lib/compare";
import {
  cloudGet,
  cloudPut,
  getCachedEtag,
  setCachedEtag,
} from "@/lib/sync/cloud-api";
import { operationQueue } from "@/lib/sync/operation-queue";

export class CloudCompareAdapter {
  readonly name = "cloud";

  async load(): Promise<CompareItem[]> {
    try {
      const etag = getCachedEtag("compare");
      const res = await cloudGet<CompareItem[]>("compare", etag);
      if (res.status === 304) return readCompareList();
      if (res.data?.items && Array.isArray(res.data.items)) {
        setCachedEtag("compare", res.data.etag);
        writeCompareList(res.data.items);
        return res.data.items;
      }
      return readCompareList();
    } catch {
      return readCompareList();
    }
  }

  async save(items: CompareItem[]): Promise<void> {
    writeCompareList(items);
    try {
      const res = await cloudPut<CompareItem[]>("compare", { items });
      setCachedEtag("compare", res.etag);
    } catch {
      operationQueue.enqueue("compare", "PUT", "compare", { items });
    }
  }

  async sync(): Promise<void> {
    const items = await this.load();
    await this.save(items);
  }
}
