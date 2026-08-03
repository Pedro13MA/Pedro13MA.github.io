/**
 * FASE 8.1 — SyncService: cloud-first autenticado, local-first anónimo.
 */

import {
  cloudGet,
  cloudPut,
  cloudRegisterDevice,
  cloudSyncStatus,
  setCachedEtag,
} from "@/lib/sync/cloud-api";
import { operationQueue } from "@/lib/sync/operation-queue";
import { SyncStatus } from "@/lib/sync/sync-status";
import {
  localHasData,
  mergeCart,
  mergeCompare,
  mergePreferences,
  mergeProjects,
  mergeUserspace,
  mergeWatches,
} from "@/lib/sync/merge";
import type { MergeChoice, UserPreferences } from "@/lib/sync/types";
import { DEFAULT_PREFERENCES } from "@/lib/sync/types";
import { LocalStorageAdapter } from "@/lib/user-space/local-storage-adapter";
import { CloudAdapter } from "@/lib/user-space/cloud-adapter";
import { setUserSpaceAdapter } from "@/lib/user-space";
import type { UserSpaceSnapshot } from "@/lib/user-space/storage-adapter";
import { LocalProjectAdapter } from "@/lib/projects/local-project-adapter";
import { CloudProjectAdapter } from "@/lib/projects/cloud-project-adapter";
import { setProjectAdapter } from "@/lib/projects";
import type { ProjectsSnapshot } from "@/lib/projects/types";
import { emptyProjectsSnapshot } from "@/lib/projects/storage-adapter";
import { LocalSmartCartAdapter } from "@/lib/smart-cart/local-storage-adapter";
import { CloudSmartCartAdapter } from "@/lib/smart-cart/cloud-adapter";
import { setSmartCartAdapter } from "@/lib/smart-cart";
import type { SmartCartSnapshot } from "@/lib/smart-cart/types";
import { emptySmartCartSnapshot } from "@/lib/smart-cart/storage-adapter";
import { LocalWatchAdapter } from "@/lib/watchlists/local-watch-adapter";
import { CloudWatchAdapter } from "@/lib/watchlists/cloud-watch-adapter";
import { setWatchAdapter } from "@/lib/watchlists";
import type { WatchlistsSnapshot } from "@/lib/watchlists/types";
import { emptyWatchlistsSnapshot } from "@/lib/watchlists/storage-adapter";
import {
  readCompareList,
  writeCompareList,
  type CompareItem,
} from "@/lib/compare";
import {
  loadPreferencesLocal,
  savePreferencesLocal,
} from "@/lib/sync/preferences";

const DEVICE_KEY = "limiar.device.id";
const MERGE_DONE_KEY = "limiar.sync.merge.done";
const SYNCED_FLAG = "limiar.sync.cloudFirst";

type MergeListener = (needed: boolean) => void;
const mergeListeners = new Set<MergeListener>();

function deviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function emptyUserspace(): UserSpaceSnapshot {
  return {
    favorites: [],
    lists: [],
    alerts: [],
    notificationTargets: [],
    version: 1,
  };
}

async function flushQueue(): Promise<void> {
  const ops = operationQueue.list();
  for (const op of ops) {
    try {
      if (op.method === "PUT") {
        await cloudPut(op.path, op.body);
      }
      operationQueue.remove(op.id);
    } catch {
      SyncStatus.setState("offline", "Fila pendente — sem ligação");
      return;
    }
  }
}

export const SyncService = {
  onMergeNeeded(listener: MergeListener): () => void {
    mergeListeners.add(listener);
    return () => mergeListeners.delete(listener);
  },

  isCloudFirst(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SYNCED_FLAG) === "1";
  },

  async activateCloudAdapters(): Promise<void> {
    setUserSpaceAdapter(new CloudAdapter());
    setProjectAdapter(new CloudProjectAdapter());
    setSmartCartAdapter(new CloudSmartCartAdapter());
    setWatchAdapter(new CloudWatchAdapter());
    localStorage.setItem(SYNCED_FLAG, "1");
  },

  async deactivateToLocal(): Promise<void> {
    setUserSpaceAdapter(new LocalStorageAdapter());
    setProjectAdapter(new LocalProjectAdapter());
    setSmartCartAdapter(new LocalSmartCartAdapter());
    setWatchAdapter(new LocalWatchAdapter());
    localStorage.removeItem(SYNCED_FLAG);
    SyncStatus.setState("idle");
  },

  async startAfterLogin(): Promise<void> {
    SyncStatus.setState("syncing");
    try {
      const status = await cloudSyncStatus();
      SyncStatus.setCloudEmpty(status.cloudEmpty);
      SyncStatus.setDevices(status.devices || []);
      await cloudRegisterDevice(deviceId(), "Browser");

      const localUs = await new LocalStorageAdapter().load();
      const localPr = await new LocalProjectAdapter().load();
      const localCart = await new LocalSmartCartAdapter().load();
      const localWatch = await new LocalWatchAdapter().load();
      const localCompare = readCompareList();
      const hasLocal = localHasData({
        userspace: localUs,
        projects: localPr,
        cart: localCart,
        watches: localWatch,
        compare: localCompare,
      });

      const mergeDone =
        typeof window !== "undefined" &&
        localStorage.getItem(`${MERGE_DONE_KEY}.${deviceId()}`) === "1";

      if (hasLocal && status.cloudEmpty && !mergeDone) {
        SyncStatus.setState("pending_merge");
        for (const l of mergeListeners) l(true);
        return;
      }

      if (hasLocal && !status.cloudEmpty && !mergeDone) {
        // Ambos têm dados — pedir merge
        SyncStatus.setState("pending_merge");
        for (const l of mergeListeners) l(true);
        return;
      }

      await this.applyMerge("keep_both");
    } catch (e) {
      SyncStatus.setState(
        "offline",
        e instanceof Error ? e.message : "sync_failed",
      );
      // Continuar com cache local se já cloud-first
      if (this.isCloudFirst()) {
        await this.activateCloudAdapters();
      }
    }
  },

  async applyMerge(choice: MergeChoice): Promise<void> {
    SyncStatus.setState("syncing");
    try {
      const localUs = await new LocalStorageAdapter().load();
      const localPr = await new LocalProjectAdapter().load();
      const localCart = await new LocalSmartCartAdapter().load();
      const localWatch = await new LocalWatchAdapter().load();
      const localCompare = readCompareList();
      const localPrefs = loadPreferencesLocal();

      let cloudUs: UserSpaceSnapshot = emptyUserspace();
      let cloudPr: ProjectsSnapshot = emptyProjectsSnapshot();
      let cloudCart: SmartCartSnapshot = emptySmartCartSnapshot();
      let cloudWatch: WatchlistsSnapshot = emptyWatchlistsSnapshot();
      let cloudCompare: CompareItem[] = [];
      let cloudPrefs: UserPreferences = { ...DEFAULT_PREFERENCES };

      try {
        const us = await cloudGet<UserSpaceSnapshot>("userspace");
        if (us.data?.items) cloudUs = us.data.items;
        const pr = await cloudGet<ProjectsSnapshot>("projects");
        if (pr.data?.items) cloudPr = pr.data.items;
        const cart = await cloudGet<SmartCartSnapshot>("smart_cart");
        if (cart.data?.items) cloudCart = cart.data.items;
        const w = await cloudGet<WatchlistsSnapshot>("watchlists");
        if (w.data?.items) cloudWatch = w.data.items;
        const cmp = await cloudGet<CompareItem[]>("compare");
        if (cmp.data?.items) cloudCompare = cmp.data.items as CompareItem[];
        const pref = await cloudGet<UserPreferences>("preferences");
        if (pref.data?.items && typeof pref.data.items === "object") {
          cloudPrefs = pref.data.items as UserPreferences;
        }
      } catch {
        /* cloud vazio / offline parcial */
      }

      const mergedUs = mergeUserspace(localUs, cloudUs, choice);
      const mergedPr = mergeProjects(localPr, cloudPr, choice);
      const mergedCart = mergeCart(localCart, cloudCart, choice);
      const mergedWatch = mergeWatches(localWatch, cloudWatch, choice);
      const mergedCompare = mergeCompare(localCompare, cloudCompare, choice);
      const mergedPrefs = mergePreferences(localPrefs, cloudPrefs, choice);

      // Upload
      const putUs = await cloudPut<UserSpaceSnapshot>("userspace", {
        items: mergedUs,
      });
      setCachedEtag("userspace", putUs.etag);
      const putPr = await cloudPut<ProjectsSnapshot>("projects", {
        items: mergedPr,
      });
      setCachedEtag("projects", putPr.etag);
      const putCart = await cloudPut<SmartCartSnapshot>("smart_cart", {
        items: mergedCart,
      });
      setCachedEtag("smart_cart", putCart.etag);
      const putW = await cloudPut<WatchlistsSnapshot>("watchlists", {
        items: mergedWatch,
      });
      setCachedEtag("watchlists", putW.etag);
      const putC = await cloudPut<CompareItem[]>("compare", {
        items: mergedCompare,
      });
      setCachedEtag("compare", putC.etag);
      const putP = await cloudPut<UserPreferences>("preferences", {
        items: { ...mergedPrefs, updatedAt: Date.now() },
      });
      setCachedEtag("preferences", putP.etag);

      // Espelho local
      await new LocalStorageAdapter().save(mergedUs);
      await new LocalProjectAdapter().save(mergedPr);
      await new LocalSmartCartAdapter().save(mergedCart);
      await new LocalWatchAdapter().save(mergedWatch);
      writeCompareList(mergedCompare);
      savePreferencesLocal(mergedPrefs);

      localStorage.setItem(`${MERGE_DONE_KEY}.${deviceId()}`, "1");
      await this.activateCloudAdapters();
      await flushQueue();
      SyncStatus.setLastSync(Date.now());
      SyncStatus.setCloudEmpty(false);
      SyncStatus.setState("synced");
      for (const l of mergeListeners) l(false);
    } catch (e) {
      SyncStatus.setState(
        "error",
        e instanceof Error ? e.message : "merge_failed",
      );
      throw e;
    }
  },

  async syncNow(): Promise<void> {
    SyncStatus.setState("syncing");
    try {
      await flushQueue();
      // Pull+push leve: re-save via cloud adapters
      const us = await new CloudAdapter().load();
      await new CloudAdapter().save(us);
      const pr = await new CloudProjectAdapter().load();
      await new CloudProjectAdapter().save(pr);
      const cart = await new CloudSmartCartAdapter().load();
      await new CloudSmartCartAdapter().save(cart);
      const w = await new CloudWatchAdapter().load();
      await new CloudWatchAdapter().save(w);
      SyncStatus.setLastSync(Date.now());
      SyncStatus.setState("synced");
    } catch (e) {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      SyncStatus.setState(
        offline ? "offline" : "error",
        e instanceof Error ? e.message : "sync_failed",
      );
    }
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (SyncService.isCloudFirst()) {
      void SyncService.syncNow();
    }
  });
}
