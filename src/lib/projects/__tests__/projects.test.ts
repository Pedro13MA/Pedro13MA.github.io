/**
 * FASE 7.13 — Projetos.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addProductToProject,
  clearSlot,
  computeProjectSummary,
  createProject,
  deleteProject,
  duplicateProject,
  getProject,
  listProjects,
  PROJECT_TEMPLATES,
  setProjectAdapter,
  setSlotProduct,
} from "@/lib/projects";
import { LocalProjectAdapter } from "@/lib/projects/local-project-adapter";
import { addToCart, clearCart, productToCartDraft, setSmartCartAdapter } from "@/lib/smart-cart";
import { LocalSmartCartAdapter } from "@/lib/smart-cart/local-storage-adapter";
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
  setProjectAdapter(new LocalProjectAdapter());
  setSmartCartAdapter(new LocalSmartCartAdapter());
}

function fakeProduct(slug: string, price: number): Product {
  return {
    slug,
    ean: slug,
    name: `Product ${slug}`,
    brand: "ASUS",
    category: "hardware",
    currentPrice: price,
    avg30d: price + 20,
    historicalMin: price - 10,
    historicalMax: price + 50,
    history: [{ date: "2026-01-01", price }],
    offers: [
      {
        store: "globaldata",
        storeName: "Globaldata",
        url: "https://example.com",
        price,
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
      cheapestStore: "globaldata",
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

describe("projects", () => {
  it("has reusable templates with slots", () => {
    expect(PROJECT_TEMPLATES.length).toBeGreaterThanOrEqual(7);
    const gaming = PROJECT_TEMPLATES.find((t) => t.id === "pc_gaming")!;
    expect(gaming.slots.some((s) => s.id === "cpu")).toBe(true);
    expect(gaming.slots.some((s) => s.id === "gpu")).toBe(true);
  });

  it("creates project from template", async () => {
    const p = await createProject({
      name: "Meu Gaming",
      templateId: "pc_gaming",
      description: "Build 2026",
    });
    expect(p.name).toBe("Meu Gaming");
    expect(p.slots.length).toBeGreaterThan(5);
    expect(p.slots.every((s) => s.product === null)).toBe(true);
    expect(p.compatibilityVersion).toBe(0);
  });

  it("adds and removes product in slot", async () => {
    const p = await createProject({ name: "T", templateId: "pc_gaming" });
    const prod = fakeProduct("rtx", 649);
    const res = await addProductToProject(p.id, prod, "gpu");
    expect(res.ok).toBe(true);
    let got = await getProject(p.id);
    expect(got?.slots.find((s) => s.slotId === "gpu")?.product?.slug).toBe(
      "rtx",
    );
    expect(computeProjectSummary(got!).total).toBe(649);

    await clearSlot(p.id, "gpu");
    got = await getProject(p.id);
    expect(got?.slots.find((s) => s.slotId === "gpu")?.product).toBeNull();
  });

  it("duplicates project", async () => {
    const p = await createProject({ name: "Original", templateId: "blank" });
    await setSlotProduct(p.id, "item_1", fakeProduct("a", 100));
    const copy = await duplicateProject(p.id);
    expect(copy?.name).toContain("cópia");
    expect(copy?.id).not.toBe(p.id);
    const list = await listProjects();
    expect(list.length).toBe(2);
  });

  it("persists and deletes", async () => {
    const p = await createProject({ name: "X", templateId: "nas" });
    expect((await listProjects()).some((x) => x.id === p.id)).toBe(true);
    await deleteProject(p.id);
    expect(await getProject(p.id)).toBeNull();
  });

  it("integrates with Smart Cart without changing cart engine", async () => {
    await clearCart();
    const p = await createProject({ name: "Cart", templateId: "blank" });
    const prod = fakeProduct("ssd", 89);
    await addProductToProject(p.id, prod);
    await addToCart(productToCartDraft(prod));
    // cart still works independently
    const { getActiveConfig } = await import("@/lib/smart-cart");
    const cfg = await getActiveConfig();
    expect(cfg.items.some((i) => i.slug === "ssd")).toBe(true);
  });

  it("timeline updates on product add", async () => {
    const p = await createProject({ name: "Hist", templateId: "blank" });
    await addProductToProject(p.id, fakeProduct("m1", 200));
    const got = await getProject(p.id);
    expect(got?.priceHistory.length).toBeGreaterThanOrEqual(1);
    expect(got?.initialTotal).toBe(200);
  });
});
