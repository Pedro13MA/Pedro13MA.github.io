/**
 * FASE 7.18 — Marketplace client helpers (smoke).
 */
import { describe, expect, it } from "vitest";
import type { MarketplaceOverview } from "@/lib/api";

describe("FASE 7.18 marketplace types", () => {
  it("overview shape is usable", () => {
    const sample: MarketplaceOverview = {
      products: 10,
      brands: 3,
      leaves: 5,
      categories: 2,
      stores: 4,
      offers: 20,
      avgPrice: 199,
      promotionsActive: 1,
      couponsActive: 0,
      rankings: { cheapest: [{ slug: "a", name: "A", currentPrice: 10 }] },
    };
    expect(sample.products).toBe(10);
    expect(sample.rankings?.cheapest?.[0].slug).toBe("a");
  });
});
