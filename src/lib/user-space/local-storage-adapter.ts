/**
 * FASE 7.9 — LocalStorageAdapter (+ migração do favoritos v1).
 */

import type { StorageAdapter, UserSpaceSnapshot } from "@/lib/user-space/storage-adapter";
import {
  DEFAULT_LISTS,
  SYSTEM_FAVORITES_LIST_ID,
  type Favorite,
  type SavedList,
} from "@/lib/user-space/types";

const KEY = "limiar.userspace.v1";
const LEGACY_FAV_KEY = "limiar.favorites.v1";
const VERSION = 1;

function emptySnapshot(): UserSpaceSnapshot {
  return {
    favorites: [],
    lists: [...DEFAULT_LISTS],
    alerts: [],
    notificationTargets: [],
    version: VERSION,
  };
}

function ensureLists(lists: SavedList[]): SavedList[] {
  const hasSystem = lists.some((l) => l.id === SYSTEM_FAVORITES_LIST_ID);
  if (hasSystem) return lists;
  return [...DEFAULT_LISTS, ...lists];
}

function migrateLegacyFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((slug) => ({
        slug,
        ean: slug,
        name: slug,
        currentPrice: 0,
        limiarIndex: 0,
        listIds: [SYSTEM_FAVORITES_LIST_ID],
        savedAt: now,
        updatedAt: now,
      }));
  } catch {
    return [];
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  readonly name = "local";

  async load(): Promise<UserSpaceSnapshot> {
    if (typeof window === "undefined") return emptySnapshot();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) {
        const legacy = migrateLegacyFavorites();
        const snap = emptySnapshot();
        if (legacy.length) {
          snap.favorites = legacy;
          await this.save(snap);
          try {
            window.localStorage.removeItem(LEGACY_FAV_KEY);
          } catch {
            /* ignore */
          }
        }
        return snap;
      }
      const parsed = JSON.parse(raw) as Partial<UserSpaceSnapshot>;
      return {
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        lists: ensureLists(Array.isArray(parsed.lists) ? parsed.lists : []),
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
        notificationTargets: Array.isArray(parsed.notificationTargets)
          ? parsed.notificationTargets
          : [],
        version: typeof parsed.version === "number" ? parsed.version : VERSION,
      };
    } catch {
      return emptySnapshot();
    }
  }

  async save(snapshot: UserSpaceSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    const payload: UserSpaceSnapshot = {
      ...snapshot,
      lists: ensureLists(snapshot.lists),
      version: VERSION,
    };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("limiar:userspace-changed"));
  }

  async sync(): Promise<void> {
    /* local — nada a sincronizar */
  }
}
