/** FASE 8.1 — fila offline de operações cloud. */

import type { QueuedOp, SyncCollection } from "@/lib/sync/types";

const QUEUE_KEY = "limiar.sync.queue.v1";

function read(): QueuedOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

function write(ops: QueuedOp[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
  } catch {
    /* ignore */
  }
}

export class OperationQueue {
  enqueue(
    collection: SyncCollection,
    method: "PUT" | "DELETE",
    path: string,
    body?: unknown,
  ): QueuedOp {
    const op: QueuedOp = {
      id: `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      collection,
      method,
      path,
      body,
      createdAt: Date.now(),
    };
    const next = [...read(), op];
    write(next);
    return op;
  }

  list(): QueuedOp[] {
    return read();
  }

  clear(): void {
    write([]);
  }

  remove(id: string): void {
    write(read().filter((o) => o.id !== id));
  }

  get length(): number {
    return read().length;
  }
}

export const operationQueue = new OperationQueue();
