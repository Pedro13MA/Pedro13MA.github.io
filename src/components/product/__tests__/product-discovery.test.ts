/**
 * FASE 7.17 — Product Discovery (FE).
 */
import { describe, expect, it } from "vitest";
import {
  classifyDiscoveryPool,
  pickBestWithinBudget,
  recommendationsFromApi,
  bestSavingsTip,
} from "@/lib/product-discovery";
import type { Product } from "@/lib/types";

function prod(
  slug: string,
  price: number,
  score: number,
  over: Partial<Product> = {},
): Product {
  return {
    slug,
    ean: slug,
    name: `Prod ${slug}`,
    brand: "ASUS",
    category: "gpu",
    leafId: "gpu",
    currentPrice: price,
    avg30d: price,
    historicalMin: price * 0.9,
    historicalMax: price * 1.1,
    history: Array.from({ length: 8 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      price,
    })),
    offers: [
      {
        store: "a",
        storeName: "A",
        slug: "a",
        price,
        currency: "EUR",
        url: "https://example.com",
      },
      {
        store: "b",
        storeName: "B",
        slug: "b",
        price: price + 5,
        currency: "EUR",
        url: "https://example.com/b",
      },
    ],
    decision: {
      finalScore: score,
      publish: true,
      tier: "A",
      reason: "ok",
      breakdown: {
        baseQuality: 1,
        priceOpportunity: 1,
        trend: 1,
        rarity: 1,
        categoryOverload: 0,
        storeDominance: 0,
        feedbackAdjustment: 0,
      },
      discountPct: 0,
      dealQuality: "GOOD_DEAL",
      opportunityType: "PRICE_DROP",
      isHistoricalMin: false,
      cheapestStore: "a",
      feedCategory: "hardware",
      bullets: [],
      semaphore: "buy",
      limiarIndex: {
        value: score,
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
  };
}

describe("FASE 7.17 discovery", () => {
  it("null pool → null", () => {
    expect(classifyDiscoveryPool(prod("a", 100, 70), [])).toBeNull();
  });

  it("alternatives / upgrades / savings", () => {
    const cur = prod("cur", 100, 70);
    const pool = [
      prod("alt", 105, 88),
      prod("up", 125, 90),
      prod("save", 80, 68),
      prod("far", 300, 95),
    ];
    const r = classifyDiscoveryPool(cur, pool);
    expect(r?.alternatives?.length).toBeGreaterThan(0);
    expect(r?.upgrades?.length).toBeGreaterThan(0);
    expect(r?.savings?.length).toBeGreaterThan(0);
    expect(r?.similar?.length).toBeGreaterThan(0);
  });

  it("API recommendations preferidos", () => {
    const raw = recommendationsFromApi({
      alternatives: [
        {
          slug: "x",
          name: "X",
          currentPrice: 1,
          reason: "ok",
        },
      ],
    });
    expect(raw?.alternatives?.[0].slug).toBe("x");
    expect(recommendationsFromApi(null)).toBeNull();
  });

  it("pickBestWithinBudget", () => {
    const cur = prod("cur", 200, 60);
    const tip = pickBestWithinBudget(cur, [prod("b", 180, 85), prod("c", 250, 99)], 200);
    expect(tip?.slug).toBe("b");
    expect(pickBestWithinBudget(cur, [prod("c", 250, 99)], 200)).toBeNull();
  });

  it("bestSavingsTip", () => {
    const cur = prod("cur", 200, 80);
    const recs = classifyDiscoveryPool(cur, [prod("s", 140, 78)]);
    const tip = bestSavingsTip(cur, recs);
    expect(tip?.eur).toBeGreaterThanOrEqual(5);
  });
});
