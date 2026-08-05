/**
 * FASE 8.1 — sync engine unit tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ConflictResolver } from "@/lib/sync/conflict-resolver";
import {
  localHasData,
  mergeUserspace,
  mergeProjects,
  mergeCompare,
  mergePreferences,
} from "@/lib/sync/merge";
import { OperationQueue } from "@/lib/sync/operation-queue";
import { SyncStatus } from "@/lib/sync/sync-status";
import { DEFAULT_LISTS } from "@/lib/user-space/types";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("conflict resolver", () => {
  it("lastModifiedWins", () => {
    const out = ConflictResolver.lastModifiedWins(
      [{ id: "a", updatedAt: 10, v: "L" }],
      [
        { id: "a", updatedAt: 5, v: "C" },
        { id: "b", updatedAt: 1, v: "C" },
      ],
    );
    const map = Object.fromEntries(out.map((x) => [x.id, x]));
    expect(map.a.v).toBe("L");
    expect(map.b.v).toBe("C");
  });

  it("mergeProjectsByItem never loses slots", () => {
    const out = ConflictResolver.mergeProjectsByItem(
      [
        {
          id: "p1",
          updatedAt: 10,
          slots: [
            { slotId: "cpu", product: { slug: "cpu1" }, selected: true },
            { slotId: "gpu", product: null, selected: true },
          ],
        },
      ],
      [
        {
          id: "p1",
          updatedAt: 5,
          slots: [
            { slotId: "gpu", product: { slug: "gpu1" }, selected: true },
            { slotId: "ram", product: { slug: "ram1" }, selected: true },
          ],
        },
      ],
    );
    expect(out).toHaveLength(1);
    const slots = Object.fromEntries(
      (out[0].slots || []).map((s) => [s.slotId, s]),
    );
    expect((slots.cpu.product as { slug: string }).slug).toBe("cpu1");
    expect((slots.gpu.product as { slug: string }).slug).toBe("gpu1");
    expect((slots.ram.product as { slug: string }).slug).toBe("ram1");
  });
});

describe("merge", () => {
  it("keep_both userspace", () => {
    const merged = mergeUserspace(
      {
        version: 1,
        favorites: [
          {
            slug: "l",
            ean: "1",
            name: "L",
            currentPrice: 1,
            lymiarIndex: 1,
            listIds: ["favorites"],
            savedAt: 1,
            updatedAt: 9,
          },
        ],
        lists: DEFAULT_LISTS,
        alerts: [],
        notificationTargets: [],
      },
      {
        version: 1,
        favorites: [
          {
            slug: "c",
            ean: "2",
            name: "C",
            currentPrice: 2,
            lymiarIndex: 2,
            listIds: ["favorites"],
            savedAt: 1,
            updatedAt: 1,
          },
        ],
        lists: DEFAULT_LISTS,
        alerts: [],
        notificationTargets: [],
      },
      "keep_both",
    );
    expect(merged.favorites.map((f) => f.slug).sort()).toEqual(["c", "l"]);
  });

  it("ignore_local projects", () => {
    const cloud = {
      version: 1 as const,
      projects: [
        {
          id: "p",
          name: "C",
          description: "",
          templateId: "blank" as const,
          slots: [],
          status: "active" as const,
          createdAt: 1,
          updatedAt: 1,
          initialTotal: 0,
          priceHistory: [],
          compatibilityVersion: 0 as const,
        },
      ],
    };
    const local = { version: 1 as const, projects: [] };
    expect(mergeProjects(local, cloud, "ignore_local").projects).toHaveLength(1);
  });

  it("compare capped at 4", () => {
    const local = Array.from({ length: 3 }, (_, i) => ({
      slug: `l${i}`,
      ean: `${i}`,
      name: `L${i}`,
      currentPrice: 1,
      lymiarIndex: 1,
      addedAt: i + 10,
    }));
    const cloud = Array.from({ length: 3 }, (_, i) => ({
      slug: `c${i}`,
      ean: `c${i}`,
      name: `C${i}`,
      currentPrice: 1,
      lymiarIndex: 1,
      addedAt: i,
    }));
    expect(mergeCompare(local, cloud, "keep_both").length).toBeLessThanOrEqual(4);
  });

  it("preferences last write", () => {
    const m = mergePreferences(
      { theme: "dark", updatedAt: 10 },
      { theme: "light", locale: "pt-PT", updatedAt: 5 },
      "keep_both",
    );
    expect(m.theme).toBe("dark");
  });

  it("localHasData", () => {
    expect(
      localHasData({
        userspace: {
          favorites: [],
          lists: DEFAULT_LISTS,
          alerts: [],
          notificationTargets: [],
          version: 1,
        },
        projects: { version: 1, projects: [] },
        cart: { version: 1, activeConfigId: "", configs: [], alerts: [] },
        watches: { version: 1, watches: [], events: [] },
        compare: [],
      }),
    ).toBe(false);
  });
});

describe("operation queue / offline", () => {
  it("enqueue and clear", () => {
    const q = new OperationQueue();
    q.enqueue("userspace", "PUT", "userspace", { items: {} });
    expect(q.length).toBe(1);
    q.clear();
    expect(q.length).toBe(0);
  });
});

describe("sync status", () => {
  it("transitions", () => {
    SyncStatus.setState("syncing");
    expect(SyncStatus.get().state).toBe("syncing");
    SyncStatus.setState("synced");
    SyncStatus.setLastSync(123);
    expect(SyncStatus.get().lastSyncAt).toBe(123);
    SyncStatus.setState("offline", "net");
    expect(SyncStatus.get().error).toBe("net");
  });
});
