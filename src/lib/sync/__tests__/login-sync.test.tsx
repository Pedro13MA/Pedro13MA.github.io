/**
 * FASE 8.1 — login → sync bootstrap.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SyncService } from "@/lib/sync/sync-service";
import { SyncStatus } from "@/lib/sync/sync-status";
import { setSmartCartAdapter } from "@/lib/smart-cart";
import { LocalSmartCartAdapter } from "@/lib/smart-cart/local-storage-adapter";
import { setUserSpaceAdapter } from "@/lib/user-space";
import { LocalStorageAdapter } from "@/lib/user-space/local-storage-adapter";
import { setProjectAdapter } from "@/lib/projects";
import { LocalProjectAdapter } from "@/lib/projects/local-project-adapter";
import { setWatchAdapter } from "@/lib/watchlists";
import { LocalWatchAdapter } from "@/lib/watchlists/local-watch-adapter";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await SyncService.deactivateToLocal();
  setUserSpaceAdapter(new LocalStorageAdapter());
  setProjectAdapter(new LocalProjectAdapter());
  setSmartCartAdapter(new LocalSmartCartAdapter());
  setWatchAdapter(new LocalWatchAdapter());
});

describe("login-sync", () => {
  it("isCloudFirst após activateCloudAdapters", async () => {
    expect(SyncService.isCloudFirst()).toBe(false);
    await SyncService.activateCloudAdapters();
    expect(SyncService.isCloudFirst()).toBe(true);
    await SyncService.deactivateToLocal();
    expect(SyncService.isCloudFirst()).toBe(false);
  });

  it("startAfterLogin com cloud vazia e sem local → estado terminal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string) => {
        const u = String(url);
        if (u.includes("/sync/status")) {
          return {
            ok: true,
            json: async () => ({
              lastSyncAt: null,
              devices: [],
              etags: {},
              cloudEmpty: true,
            }),
          };
        }
        if (u.includes("/sync/device")) {
          return { ok: true, json: async () => ({ devices: [] }) };
        }
        if (u.includes("/api/v1/user/")) {
          return {
            ok: true,
            json: async () => ({
              items: u.includes("userspace")
                ? {
                    favorites: [],
                    lists: [],
                    alerts: [],
                    notificationTargets: [],
                    version: 1,
                  }
                : u.includes("projects")
                  ? { version: 1, projects: [] }
                  : u.includes("smart_cart") || u.includes("cart")
                    ? {
                        version: 1,
                        activeConfigId: "",
                        configs: [],
                        alerts: [],
                      }
                    : u.includes("watchlists")
                      ? { version: 1, watches: [], events: [] }
                      : u.includes("compare")
                        ? []
                        : {},
              updatedAt: null,
              etag: "e1",
            }),
          };
        }
        return { ok: false, status: 404, json: async () => ({}) };
      }),
    );

    await SyncService.startAfterLogin();
    const state = SyncStatus.get().state;
    expect(["synced", "pending_merge", "error", "offline"]).toContain(state);
  });
});
