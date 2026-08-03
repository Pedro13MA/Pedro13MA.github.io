/**
 * FASE 7.19 — Watchlists & Timeline tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyObservation,
  baselineFromProduct,
  diffBaselines,
  eventsFromProductHistory,
  filterTimelineEvents,
  follow,
  getWatchStats,
  groupEventsByPeriod,
  isWatching,
  listEvents,
  LocalWatchAdapter,
  setWatchAdapter,
  toggleWatch,
  unfollow,
  type WatchItem,
} from "@/lib/watchlists";
import type { Product } from "@/lib/types";

function stubStorage() {
  const store: Record<string, string> = {};
  const ls = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  vi.stubGlobal("localStorage", ls);
  vi.stubGlobal("window", {
    localStorage: ls,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  setWatchAdapter(new LocalWatchAdapter());
}

function fakeProduct(): Product {
  return {
    slug: "rtx-5070-asus",
    ean: "123",
    name: "RTX 5070 ASUS",
    brand: "ASUS",
    category: "hardware",
    currentPrice: 482,
    avg30d: 500,
    historicalMin: 480,
    historicalMax: 550,
    history: [
      { date: "2026-07-24", price: 520 },
      { date: "2026-07-29", price: 500 },
      { date: "2026-07-31", price: 500 },
      { date: "2026-08-03", price: 482 },
    ],
    offers: [
      {
        store: "pcdiga",
        storeName: "PCDiga",
        slug: "pcdiga",
        price: 482,
        url: "https://example.com",
      },
    ],
    decision: {
      finalScore: 80,
      publish: true,
      tier: "A",
      reason: "ok",
      breakdown: {
        baseQuality: 0,
        priceOpportunity: 0,
        trend: 0,
        rarity: 0,
        categoryOverload: 0,
        storeDominance: 0,
        feedbackAdjustment: 0,
      },
      discountPct: 5,
      dealQuality: "GOOD_DEAL",
      opportunityType: "NEW_LOW",
      isHistoricalMin: false,
      cheapestStore: "pcdiga",
      feedCategory: "hardware",
      bullets: [],
      semaphore: "buy",
      limiarIndex: {
        value: 80,
        summary: "ok",
        factors: {
          vsAvg30d: { score: 0, label: "", detail: "" },
          historicalMin: { score: 0, label: "", detail: "" },
          couponApplied: { score: 0, label: "", detail: "" },
          volatility: { score: 0, label: "", detail: "" },
        },
      },
    },
    seasonality: { timesBelowCurrent12m: 0, note: "", markers: [] },
  } as Product;
}

beforeEach(() => {
  stubStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WatchService", () => {
  it("segue e deixa de seguir produto", async () => {
    const p = fakeProduct();
    const res = await toggleWatch({
      kind: "PRODUCT",
      target: {
        key: p.slug,
        label: p.name,
        href: `/p/${p.slug}/`,
      },
      baseline: baselineFromProduct(p),
    });
    expect(res.watching).toBe(true);
    expect(await isWatching("PRODUCT", p.slug)).toBe(true);
    const events = await listEvents();
    expect(events.some((e) => e.eventKind === "FOLLOWED")).toBe(true);

    await unfollow("PRODUCT", p.slug);
    expect(await isWatching("PRODUCT", p.slug)).toBe(false);
  });

  it("stats reflectem watches activas", async () => {
    await follow({
      kind: "CATEGORY",
      target: {
        key: "gpus",
        label: "GPUs",
        href: "/categoria/gpus/",
      },
    });
    await follow({
      kind: "BRAND",
      target: { key: "asus", label: "ASUS", href: "/mercado/marca/?id=asus" },
    });
    const stats = await getWatchStats();
    expect(stats.categories).toBe(1);
    expect(stats.brands).toBe(1);
    expect(stats.total).toBe(2);
  });
});

describe("TimelineService", () => {
  it("gera eventos factuais do histórico", () => {
    const events = eventsFromProductHistory(fakeProduct());
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.kind === "PRODUCT")).toBe(true);
    expect(events.some((e) => e.eventKind === "PRICE_DROP")).toBe(true);
    // Nunca inventar texto de previsão
    expect(
      events.every(
        (e) =>
          !/vai baixar|previsão|provavelmente/i.test(e.summary + e.title),
      ),
    ).toBe(true);
  });

  it("diffBaselines detecta queda de preço", () => {
    const watch: WatchItem = {
      id: "w1",
      kind: "PRODUCT",
      target: {
        key: "x",
        label: "X",
        href: "/p/x/",
      },
      created: 1,
      lastSeen: 1,
      notes: "",
      enabled: true,
      baseline: {
        price: 500,
        offerStores: ["a"],
        updatedAt: 1,
      },
    };
    const next = {
      price: 482,
      offerStores: ["a", "b"],
      updatedAt: Date.now(),
    };
    const ev = diffBaselines(watch, next);
    expect(ev.some((e) => e.eventKind === "PRICE_DROP")).toBe(true);
    expect(ev.some((e) => e.eventKind === "NEW_STORE")).toBe(true);
  });

  it("filtra por query e dias", () => {
    const now = Date.now();
    const events = [
      {
        id: "1",
        watchId: null,
        kind: "PRODUCT" as const,
        eventKind: "PRICE_DROP" as const,
        title: "Preço baixou",
        summary: "RTX baixou",
        href: "/p/rtx/",
        targetLabel: "RTX 5070",
        at: now,
        searchText: "product rtx 5070 preço baixou rtx baixou",
      },
      {
        id: "2",
        watchId: null,
        kind: "BRAND" as const,
        eventKind: "BRAND_PROMOS_UP" as const,
        title: "Mais promoções",
        summary: "Samsung",
        href: "/mercado/marca/?id=samsung",
        targetLabel: "Samsung",
        at: now - 40 * 86_400_000,
        searchText: "brand samsung mais promoções",
      },
    ];
    const filtered = filterTimelineEvents(events, {
      query: "RTX",
      days: 7,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].targetLabel).toContain("RTX");
  });

  it("agrupa por período", () => {
    const now = Date.now();
    const groups = groupEventsByPeriod([
      {
        id: "1",
        watchId: null,
        kind: "PRODUCT",
        eventKind: "PRICE_DROP",
        title: "t",
        summary: "s",
        href: "/",
        targetLabel: "A",
        at: now,
        searchText: "a",
      },
      {
        id: "2",
        watchId: null,
        kind: "PRODUCT",
        eventKind: "PRICE_DROP",
        title: "t",
        summary: "s",
        href: "/",
        targetLabel: "B",
        at: now - 2 * 86_400_000,
        searchText: "b",
      },
    ]);
    expect(groups[0].period).toBe("today");
    expect(groups.some((g) => g.period === "week")).toBe(true);
  });

  it("applyObservation persiste eventos", async () => {
    const p = fakeProduct();
    const watch = await follow({
      kind: "PRODUCT",
      target: { key: p.slug, label: p.name, href: `/p/${p.slug}/` },
      baseline: baselineFromProduct({ ...p, currentPrice: 500 }),
    });
    const emitted = await applyObservation({
      watchId: watch.id,
      baseline: baselineFromProduct(p),
    });
    expect(emitted.some((e) => e.eventKind === "PRICE_DROP")).toBe(true);
    const all = await listEvents();
    expect(all.length).toBeGreaterThan(1);
  });
});

describe("Cloud adapter FASE 8.1", () => {
  it("CloudWatchAdapter faz fallback local sem API", async () => {
    const { CloudWatchAdapter } = await import(
      "@/lib/watchlists/cloud-watch-adapter"
    );
    const cloud = new CloudWatchAdapter();
    const snap = await cloud.load();
    expect(snap.version).toBe(1);
    expect(Array.isArray(snap.watches)).toBe(true);
  });
});
