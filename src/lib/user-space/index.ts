/**
 * FASE 7.9 — serviço Minha Área (usa StorageAdapter injectável).
 */

import { LocalStorageAdapter } from "@/lib/user-space/local-storage-adapter";
import type { StorageAdapter } from "@/lib/user-space/storage-adapter";
import {
  SYSTEM_FAVORITES_LIST_ID,
  type AlertRule,
  type Favorite,
  type ProductSnapshot,
  type SavedList,
} from "@/lib/user-space/types";

let adapter: StorageAdapter = new LocalStorageAdapter();

export function setUserSpaceAdapter(next: StorageAdapter): void {
  adapter = next;
}

export function getUserSpaceAdapter(): StorageAdapter {
  return adapter;
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadUserSpace() {
  return adapter.load();
}

export function snapshotFromProduct(product: {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  currentPrice: number;
  decision: { lymiarIndex: { value: number }; cheapestStore?: string | null };
  condition?: string | null;
  category?: string;
}): ProductSnapshot {
  return {
    slug: product.slug,
    ean: product.ean,
    name: product.name,
    brand: product.brand,
    imageUrl: product.imageUrl,
    currentPrice: product.currentPrice,
    lymiarIndex: product.decision.lymiarIndex.value,
    cheapestStore: product.decision.cheapestStore,
    condition: product.condition,
    category: product.category,
  };
}

export async function getFavorites(): Promise<Favorite[]> {
  const snap = await adapter.load();
  return snap.favorites;
}

export async function isFavorite(slug: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some(
    (f) =>
      f.slug === slug && f.listIds.includes(SYSTEM_FAVORITES_LIST_ID),
  );
}

export async function getListsForProduct(slug: string): Promise<SavedList[]> {
  const snap = await adapter.load();
  const fav = snap.favorites.find((f) => f.slug === slug);
  if (!fav) return [];
  return snap.lists.filter((l) => fav.listIds.includes(l.id));
}

export async function upsertFavoriteInLists(
  product: ProductSnapshot,
  listIds: string[],
): Promise<Favorite> {
  const snap = await adapter.load();
  const now = Date.now();
  const uniqueLists = Array.from(new Set(listIds));
  const idx = snap.favorites.findIndex((f) => f.slug === product.slug);
  let fav: Favorite;
  if (idx >= 0) {
    fav = {
      ...snap.favorites[idx],
      ...product,
      listIds: uniqueLists,
      updatedAt: now,
      lastPriceAtSave: product.currentPrice,
    };
    snap.favorites[idx] = fav;
  } else {
    fav = {
      ...product,
      listIds: uniqueLists,
      savedAt: now,
      updatedAt: now,
      lastPriceAtSave: product.currentPrice,
    };
    snap.favorites.push(fav);
  }
  // Remove se ficou sem listas
  if (!fav.listIds.length) {
    snap.favorites = snap.favorites.filter((f) => f.slug !== product.slug);
  }
  await adapter.save(snap);
  return fav;
}

export async function removeFavorite(slug: string): Promise<void> {
  const snap = await adapter.load();
  snap.favorites = snap.favorites.filter((f) => f.slug !== slug);
  snap.alerts = snap.alerts.filter((a) => a.slug !== slug);
  await adapter.save(snap);
}

export async function removeFromList(
  slug: string,
  listId: string,
): Promise<void> {
  const snap = await adapter.load();
  const fav = snap.favorites.find((f) => f.slug === slug);
  if (!fav) return;
  fav.listIds = fav.listIds.filter((id) => id !== listId);
  fav.updatedAt = Date.now();
  if (!fav.listIds.length) {
    snap.favorites = snap.favorites.filter((f) => f.slug !== slug);
  }
  await adapter.save(snap);
}

export async function getLists(): Promise<SavedList[]> {
  const snap = await adapter.load();
  return snap.lists;
}

export async function createList(name: string): Promise<SavedList> {
  const snap = await adapter.load();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nome da lista obrigatório");
  const now = Date.now();
  const list: SavedList = {
    id: uid("list"),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
  };
  snap.lists.push(list);
  await adapter.save(snap);
  return list;
}

export async function renameList(id: string, name: string): Promise<void> {
  const snap = await adapter.load();
  const list = snap.lists.find((l) => l.id === id);
  if (!list || list.system) return;
  list.name = name.trim() || list.name;
  list.updatedAt = Date.now();
  await adapter.save(snap);
}

export async function deleteList(id: string): Promise<void> {
  if (id === SYSTEM_FAVORITES_LIST_ID) return;
  const snap = await adapter.load();
  snap.lists = snap.lists.filter((l) => l.id !== id);
  for (const fav of snap.favorites) {
    fav.listIds = fav.listIds.filter((lid) => lid !== id);
  }
  snap.favorites = snap.favorites.filter((f) => f.listIds.length > 0);
  await adapter.save(snap);
}

export async function getAlerts(): Promise<AlertRule[]> {
  const snap = await adapter.load();
  return snap.alerts;
}

export async function getAlertForProduct(
  slug: string,
): Promise<AlertRule | null> {
  const alerts = await getAlerts();
  return alerts.find((a) => a.slug === slug && a.active) || null;
}

export async function upsertAlert(rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
}): Promise<AlertRule> {
  const snap = await adapter.load();
  const now = Date.now();
  const existingIdx = rule.id
    ? snap.alerts.findIndex((a) => a.id === rule.id)
    : snap.alerts.findIndex((a) => a.slug === rule.slug);

  let saved: AlertRule;
  if (existingIdx >= 0) {
    saved = {
      ...snap.alerts[existingIdx],
      ...rule,
      id: snap.alerts[existingIdx].id,
      createdAt: snap.alerts[existingIdx].createdAt,
      updatedAt: now,
    };
    snap.alerts[existingIdx] = saved;
  } else {
    saved = {
      ...rule,
      id: rule.id || uid("alert"),
      createdAt: now,
      updatedAt: now,
    };
    snap.alerts.push(saved);
  }
  await adapter.save(snap);
  return saved;
}

export async function deleteAlert(id: string): Promise<void> {
  const snap = await adapter.load();
  snap.alerts = snap.alerts.filter((a) => a.id !== id);
  await adapter.save(snap);
}

export async function setAlertActive(
  id: string,
  active: boolean,
): Promise<void> {
  const snap = await adapter.load();
  const alert = snap.alerts.find((a) => a.id === id);
  if (!alert) return;
  alert.active = active;
  alert.updatedAt = Date.now();
  await adapter.save(snap);
}

export function subscribeUserSpace(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("lymiar:userspace-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("lymiar:userspace-changed", handler);
    window.removeEventListener("storage", handler);
  };
}
