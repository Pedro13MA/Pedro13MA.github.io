/**
 * FASE 7.12 — Smart Cart + otimização.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToCart,
  clearCart,
  createConfig,
  getActiveConfig,
  productToCartDraft,
  removeFromCart,
  setQuantity,
  setSmartCartAdapter,
  upsertCartAlert,
  getCartAlert,
} from "@/lib/smart-cart";
import { LocalSmartCartAdapter } from "@/lib/smart-cart/local-storage-adapter";
import {
  optimizeAll,
  optimizeMinPrice,
  optimizeMinStores,
  parseShippingCostEur,
} from "@/lib/smart-cart/optimize";
import type { CartItem } from "@/lib/smart-cart/types";
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
  setSmartCartAdapter(new LocalSmartCartAdapter());
}

function fakeProduct(over: Partial<Product> & { slug: string; offers: Product["offers"] }): Product {
  return {
    ean: over.ean || over.slug,
    name: over.name || over.slug,
    brand: "ASUS",
    category: "hardware",
    currentPrice: over.currentPrice ?? over.offers[0]?.price ?? 100,
    avg30d: 120,
    historicalMin: 90,
    historicalMax: 150,
    history: [{ date: "2026-01-01", price: 100 }],
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
      cheapestStore: over.offers[0]?.store,
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
    ...over,
  } as Product;
}

beforeEach(() => {
  stubStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("smart-cart persistence", () => {
  it("adds, changes qty, removes", async () => {
    const p = fakeProduct({
      slug: "gpu-1",
      offers: [
        {
          store: "globaldata",
          storeName: "Globaldata",
          url: "https://a",
          price: 600,
        },
        {
          store: "pcdiga",
          storeName: "PCDIGA",
          url: "https://b",
          price: 620,
        },
      ],
    });
    await addToCart(productToCartDraft(p));
    let cfg = await getActiveConfig();
    expect(cfg.items).toHaveLength(1);
    expect(cfg.items[0].priceAtAdd).toBe(600);

    await setQuantity(cfg.items[0].id, 3);
    cfg = await getActiveConfig();
    expect(cfg.items[0].quantity).toBe(3);

    await removeFromCart(cfg.items[0].id);
    cfg = await getActiveConfig();
    expect(cfg.items).toHaveLength(0);
  });

  it("creates named configs", async () => {
    await createConfig("Gaming", "bundle_gaming");
    const cfg = await getActiveConfig();
    expect(cfg.name).toBe("Gaming");
    expect(cfg.kind).toBe("bundle_gaming");
  });

  it("cart alert baseline", async () => {
    await upsertCartAlert(100, 1248);
    const a = await getCartAlert();
    expect(a?.dropByEur).toBe(100);
    expect(a?.baselineTotal).toBe(1248);
    expect(a?.active).toBe(true);
  });
});

describe("smart-cart optimize", () => {
  function item(
    id: string,
    offers: CartItem["offers"],
    qty = 1,
  ): CartItem {
    return {
      id,
      slug: id,
      ean: id,
      name: id,
      quantity: qty,
      priceAtAdd: offers[0].price,
      addedAt: 1,
      updatedAt: 1,
      offers,
      status: "todo",
    };
  }

  it("min price picks cheapest per item", () => {
    const items = [
      item("cpu", [
        { store: "gd", storeName: "GD", price: 200, url: "#" },
        { store: "pc", storeName: "PC", price: 220, url: "#" },
      ]),
      item("gpu", [
        { store: "gd", storeName: "GD", price: 700, url: "#" },
        { store: "pc", storeName: "PC", price: 650, url: "#" },
      ]),
    ];
    const opt = optimizeMinPrice(items)!;
    expect(opt.assignments.find((a) => a.itemId === "cpu")?.store).toBe("gd");
    expect(opt.assignments.find((a) => a.itemId === "gpu")?.store).toBe("pc");
    expect(opt.productTotal).toBe(850);
    expect(opt.storeCount).toBe(2);
  });

  it("min stores prefers single store when possible", () => {
    const items = [
      item("cpu", [
        { store: "gd", storeName: "GD", price: 210, url: "#" },
        { store: "pc", storeName: "PC", price: 200, url: "#" },
      ]),
      item("gpu", [
        { store: "gd", storeName: "GD", price: 700, url: "#" },
        { store: "pc", storeName: "PC", price: 690, url: "#" },
      ]),
    ];
    const opt = optimizeMinStores(items)!;
    expect(opt.storeCount).toBe(1);
    expect(opt.stores).toEqual(["pc"]);
    expect(opt.productTotal).toBe(890);
  });

  it("optimizeAll returns strategies and never invents shipping", () => {
    const items = [
      item("a", [
        {
          store: "gd",
          storeName: "GD",
          price: 100,
          url: "#",
          shippingCostEur: null,
        },
      ]),
      item("b", [
        {
          store: "gd",
          storeName: "GD",
          price: 50,
          url: "#",
          shippingCostEur: 5,
        },
      ]),
    ];
    const opts = optimizeAll(items);
    expect(opts.length).toBeGreaterThanOrEqual(1);
    expect(opts[0].shippingUnknown).toBe(true);
    expect(opts[0].shippingTotal).toBeNull();
  });

  it("parseShippingCostEur", () => {
    expect(parseShippingCostEur("3,99 €")).toBe(3.99);
    expect(parseShippingCostEur("grátis")).toBe(0);
    expect(parseShippingCostEur("varies")).toBeNull();
    expect(parseShippingCostEur(null)).toBeNull();
  });

  it("clear cart", async () => {
    const p = fakeProduct({
      slug: "x",
      offers: [{ store: "gd", storeName: "GD", url: "#", price: 10 }],
    });
    await addToCart(productToCartDraft(p));
    await clearCart();
    expect((await getActiveConfig()).items).toHaveLength(0);
  });
});
