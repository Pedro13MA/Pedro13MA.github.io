/**
 * FASE 7.19 — WatchService (adapter injectável).
 */

import { LocalWatchAdapter } from "@/lib/watchlists/local-watch-adapter";
import type { WatchStorageAdapter } from "@/lib/watchlists/storage-adapter";
import {
  diffBaselines,
  eventsFromProductHistory,
  eventsFromProjectPriceHistory,
  makeEvent,
  mergeUniqueEvents,
} from "@/lib/watchlists/timeline_service";
import type {
  TimelineEvent,
  WatchBaseline,
  WatchItem,
  WatchKind,
  WatchlistsSnapshot,
  WatchStats,
  WatchTarget,
} from "@/lib/watchlists/types";
import { SMART_CART_WATCH_KEY } from "@/lib/watchlists/types";

let adapter: WatchStorageAdapter = new LocalWatchAdapter();

export function setWatchAdapter(next: WatchStorageAdapter): void {
  adapter = next;
}

export function getWatchAdapter(): WatchStorageAdapter {
  return adapter;
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emit(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lymiar:watchlists-changed"));
  }
}

export function subscribeWatchlists(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("lymiar:watchlists-changed", cb);
  return () => window.removeEventListener("lymiar:watchlists-changed", cb);
}

async function mutate(
  fn: (snap: WatchlistsSnapshot) => WatchlistsSnapshot,
): Promise<WatchlistsSnapshot> {
  const snap = await adapter.load();
  const next = fn(snap);
  await adapter.save(next);
  emit();
  return next;
}

export async function loadWatchlists(): Promise<WatchlistsSnapshot> {
  return adapter.load();
}

export async function listWatches(enabledOnly = false): Promise<WatchItem[]> {
  const snap = await adapter.load();
  return snap.watches.filter((w) => (enabledOnly ? w.enabled : true));
}

export async function listEvents(): Promise<TimelineEvent[]> {
  const snap = await adapter.load();
  return [...snap.events].sort((a, b) => b.at - a.at);
}

export async function findWatch(
  kind: WatchKind,
  key: string,
): Promise<WatchItem | null> {
  const snap = await adapter.load();
  return (
    snap.watches.find((w) => w.kind === kind && w.target.key === key) || null
  );
}

export async function isWatching(kind: WatchKind, key: string): Promise<boolean> {
  const w = await findWatch(kind, key);
  return Boolean(w?.enabled);
}

export async function follow(opts: {
  kind: WatchKind;
  target: WatchTarget;
  baseline?: WatchBaseline | null;
  notes?: string;
}): Promise<WatchItem> {
  const now = Date.now();
  let created!: WatchItem;
  await mutate((snap) => {
    const existing = snap.watches.find(
      (w) => w.kind === opts.kind && w.target.key === opts.target.key,
    );
    if (existing) {
      created = {
        ...existing,
        target: opts.target,
        enabled: true,
        lastSeen: now,
        notes: opts.notes ?? existing.notes,
        baseline: opts.baseline ?? existing.baseline,
      };
      const watches = snap.watches.map((w) =>
        w.id === existing.id ? created : w,
      );
      return { ...snap, watches };
    }
    created = {
      id: uid("watch"),
      kind: opts.kind,
      target: opts.target,
      created: now,
      lastSeen: now,
      notes: opts.notes || "",
      enabled: true,
      baseline: opts.baseline ?? null,
    };
    const followed = makeEvent({
      watchId: created.id,
      kind: opts.kind,
      eventKind: "FOLLOWED",
      title: "A seguir",
      summary: `Começou a seguir ${opts.target.label}`,
      href: opts.target.href,
      targetLabel: opts.target.label,
      at: now,
    });
    return {
      ...snap,
      watches: [created, ...snap.watches],
      events: mergeUniqueEvents(snap.events, [followed]),
    };
  });
  return created;
}

export async function unfollow(kind: WatchKind, key: string): Promise<void> {
  await mutate((snap) => ({
    ...snap,
    watches: snap.watches.map((w) =>
      w.kind === kind && w.target.key === key
        ? { ...w, enabled: false, lastSeen: Date.now() }
        : w,
    ),
  }));
}

export async function toggleWatch(opts: {
  kind: WatchKind;
  target: WatchTarget;
  baseline?: WatchBaseline | null;
}): Promise<{ watching: boolean; watch: WatchItem | null }> {
  const existing = await findWatch(opts.kind, opts.target.key);
  if (existing?.enabled) {
    await unfollow(opts.kind, opts.target.key);
    return { watching: false, watch: existing };
  }
  const watch = await follow(opts);
  return { watching: true, watch };
}

export async function setWatchNotes(
  watchId: string,
  notes: string,
): Promise<void> {
  await mutate((snap) => ({
    ...snap,
    watches: snap.watches.map((w) =>
      w.id === watchId ? { ...w, notes: notes.trim() } : w,
    ),
  }));
}

export async function removeWatch(watchId: string): Promise<void> {
  await mutate((snap) => ({
    ...snap,
    watches: snap.watches.filter((w) => w.id !== watchId),
  }));
}

export async function appendEvents(events: TimelineEvent[]): Promise<void> {
  if (!events.length) return;
  await mutate((snap) => ({
    ...snap,
    events: mergeUniqueEvents(snap.events, events),
  }));
}

export async function applyObservation(opts: {
  watchId: string;
  baseline: WatchBaseline;
  extraEvents?: TimelineEvent[];
}): Promise<TimelineEvent[]> {
  let emitted: TimelineEvent[] = [];
  await mutate((snap) => {
    const watch = snap.watches.find((w) => w.id === opts.watchId);
    if (!watch || !watch.enabled) return snap;
    const diffs = diffBaselines(watch, opts.baseline);
    emitted = [...diffs, ...(opts.extraEvents || [])];
    const watches = snap.watches.map((w) =>
      w.id === opts.watchId
        ? {
            ...w,
            baseline: opts.baseline,
            lastSeen: opts.baseline.updatedAt || Date.now(),
          }
        : w,
    );
    return {
      ...snap,
      watches,
      events: mergeUniqueEvents(snap.events, emitted),
    };
  });
  return emitted;
}

export async function getWatchStats(): Promise<WatchStats> {
  const snap = await adapter.load();
  const active = snap.watches.filter((w) => w.enabled);
  const weekAgo = Date.now() - 7 * 86_400_000;
  let followedValueEur = 0;
  for (const w of active) {
    const b = w.baseline;
    if (!b) continue;
    if (typeof b.price === "number" && b.price > 0) followedValueEur += b.price;
    else if (typeof b.total === "number" && b.total > 0)
      followedValueEur += b.total;
  }
  return {
    products: active.filter((w) => w.kind === "PRODUCT").length,
    categories: active.filter((w) => w.kind === "CATEGORY").length,
    brands: active.filter((w) => w.kind === "BRAND").length,
    stores: active.filter((w) => w.kind === "STORE").length,
    projects: active.filter((w) => w.kind === "PROJECT").length,
    smartCarts: active.filter((w) => w.kind === "SMART_CART").length,
    total: active.length,
    eventsThisWeek: snap.events.filter((e) => e.at >= weekAgo).length,
    followedValueEur: Math.round(followedValueEur * 100) / 100,
  };
}

/** Helpers para construir baselines a partir de fontes existentes. */
export function baselineFromProduct(product: {
  currentPrice: number;
  historicalMin?: number;
  offers?: Array<{ store?: string; slug?: string; price: number }>;
  inStock?: boolean | null;
  storeCouponsAvailable?: boolean;
}): WatchBaseline {
  const stores = (product.offers || [])
    .filter((o) => o.price > 0)
    .map((o) => (o.slug || o.store || "").toLowerCase())
    .filter(Boolean)
    .sort();
  return {
    price: product.currentPrice,
    historicalMin: product.historicalMin ?? null,
    storeCount: stores.length,
    offerStores: [...new Set(stores)],
    inStock: product.inStock ?? null,
    couponCount: product.storeCouponsAvailable ? 1 : 0,
    updatedAt: Date.now(),
  };
}

export function baselineFromCategoryStats(stats: {
  products: number;
  brands: number;
  stores: number;
  avgPrice?: number | null;
}): WatchBaseline {
  return {
    productCount: stats.products,
    brandCount: stats.brands,
    storeCount: stats.stores,
    avgPrice: stats.avgPrice ?? null,
    updatedAt: Date.now(),
  };
}

export function baselineFromBrand(detail: {
  products: number;
  avgPrice?: number | null;
}): WatchBaseline {
  return {
    productCount: detail.products,
    avgPrice: detail.avgPrice ?? null,
    updatedAt: Date.now(),
  };
}

export function baselineFromStore(detail: {
  products: number;
  avgPrice?: number | null;
  promotions?: number;
}): WatchBaseline {
  return {
    productCount: detail.products,
    avgPrice: detail.avgPrice ?? null,
    promotionCount: detail.promotions ?? 0,
    updatedAt: Date.now(),
  };
}

export function baselineFromTotal(total: number): WatchBaseline {
  return { total, updatedAt: Date.now() };
}

export async function seedProductHistoryEvents(
  product: Parameters<typeof eventsFromProductHistory>[0],
  watchId: string | null,
): Promise<TimelineEvent[]> {
  const events = eventsFromProductHistory(product, {
    watchId,
    limit: 12,
  });
  await appendEvents(events);
  return events;
}

export async function seedProjectHistoryEvents(
  projectId: string,
  name: string,
  history: Array<{ date: string; total: number }>,
  watchId: string | null,
): Promise<TimelineEvent[]> {
  const events = eventsFromProjectPriceHistory(
    projectId,
    name,
    history,
    watchId,
  );
  await appendEvents(events);
  return events;
}

export { SMART_CART_WATCH_KEY };
