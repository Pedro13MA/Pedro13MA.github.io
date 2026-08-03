/**
 * FASE 7.20 — Homepage discovery (FE smoke).
 */

import { describe, expect, it } from "vitest";
import type { HomepagePayload } from "@/lib/api";

function assertFactualNote(note: string | null | undefined) {
  const n = (note || "").toLowerCase();
  expect(n.includes("vai baixar") || n.includes("previsão de")).toBe(false);
}

describe("Homepage payload shape", () => {
  it("aceita payload vazio", () => {
    const empty: HomepagePayload = {
      featured: [],
      topDeals: [],
      recentDrops: [],
      popularProducts: [],
      recommended: [],
      categories: [],
      trendingBrands: [],
      trendingStores: [],
      marketSummary: {
        products: 0,
        brands: 0,
        stores: 0,
        categories: 0,
        promotionsActive: 0,
        couponsActive: 0,
      },
      latestCoupons: [],
      latestProducts: [],
      note: "Agregação factual — sem previsões.",
    };
    expect(empty.marketSummary.products).toBe(0);
    assertFactualNote(empty.note);
  });

  it("mapeia categorias de atalho", () => {
    const cats = [
      { slug: "gaming", displayName: "Gaming", products: 10 },
      { slug: "casa", displayName: "Casa", products: 5 },
    ];
    expect(cats.every((c) => c.slug && c.displayName)).toBe(true);
  });

  it("deals só com desconto observado positivo", () => {
    const deals = [
      { slug: "a", discountPct: 18, currentPrice: 100, originalPrice: 122 },
      { slug: "b", discountPct: 0, currentPrice: 50, originalPrice: 50 },
    ];
    const valid = deals.filter(
      (d) =>
        d.discountPct != null &&
        d.discountPct > 0 &&
        (d.originalPrice ?? 0) > (d.currentPrice ?? 0),
    );
    expect(valid).toHaveLength(1);
  });
});
