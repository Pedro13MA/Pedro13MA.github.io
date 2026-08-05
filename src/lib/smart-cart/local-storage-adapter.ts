/**
 * FASE 7.12 — LocalStorageAdapter Smart Cart.
 */

import {
  emptySmartCartSnapshot,
  type SmartCartStorageAdapter,
} from "@/lib/smart-cart/storage-adapter";
import type { SmartCartSnapshot } from "@/lib/smart-cart/types";

const KEY = "lymiar.smartcart.v1";

export class LocalSmartCartAdapter implements SmartCartStorageAdapter {
  readonly name = "local";

  async load(): Promise<SmartCartSnapshot> {
    if (typeof window === "undefined") return emptySmartCartSnapshot();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return emptySmartCartSnapshot();
      const parsed = JSON.parse(raw) as SmartCartSnapshot;
      if (!parsed?.configs?.length) return emptySmartCartSnapshot();
      return parsed;
    } catch {
      return emptySmartCartSnapshot();
    }
  }

  async save(snapshot: SmartCartSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(snapshot));
      window.dispatchEvent(new CustomEvent("lymiar:smartcart-changed"));
    } catch {
      /* quota */
    }
  }
}
