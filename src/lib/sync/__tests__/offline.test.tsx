/**
 * FASE 8.1 — offline queue.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { OperationQueue } from "@/lib/sync/operation-queue";
import { SyncStatus } from "@/lib/sync/sync-status";

beforeEach(() => {
  sessionStorage.clear();
});

describe("offline", () => {
  it("operações ficam em fila", () => {
    const q = new OperationQueue();
    q.enqueue("projects", "PUT", "projects", { items: { projects: [] } });
    q.enqueue("smart_cart", "PUT", "smart_cart", { items: {} });
    expect(q.list()).toHaveLength(2);
    SyncStatus.setState("offline", "network");
    expect(SyncStatus.get().state).toBe("offline");
    expect(SyncStatus.get().pendingOps).toBe(2);
    q.remove(q.list()[0]!.id);
    expect(q.length).toBe(1);
  });
});
