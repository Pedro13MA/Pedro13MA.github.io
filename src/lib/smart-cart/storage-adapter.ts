/**
 * FASE 7.12 — StorageAdapter Smart Cart (local + stub cloud).
 */

import type { SmartCartSnapshot } from "@/lib/smart-cart/types";

export interface SmartCartStorageAdapter {
  readonly name: string;
  load(): Promise<SmartCartSnapshot>;
  save(snapshot: SmartCartSnapshot): Promise<void>;
  /** FASE 8 */
  sync?(): Promise<void>;
}

export function emptySmartCartSnapshot(): SmartCartSnapshot {
  const id = `cfg_${Date.now().toString(36)}`;
  const now = Date.now();
  return {
    version: 1,
    activeConfigId: id,
    configs: [
      {
        id,
        name: "Carrinho",
        kind: "generic",
        items: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    alerts: [],
  };
}
