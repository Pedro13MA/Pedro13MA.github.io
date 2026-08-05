/**
 * FASE 7.11 — compare storage + engine.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addToCompare,
  buildCompareShareUrl,
  clearCompare,
  COMPARE_MAX,
  parseCompareIdsParam,
  readCompareList,
  removeFromCompare,
} from "@/lib/compare";
import {
  buildCompareRows,
  computeCompareBadges,
  filterDiffRows,
  productsHaveMixedCategories,
  sortProducts,
} from "@/lib/compare-engine";
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
    location: { origin: "https://lymiar.com" },
  });
}

function baseProduct(over: Partial<Product> = {}): Product {
  return {
    slug: "gpu-a",
    ean: "1",
    name: "GPU A 12GB",
    brand: "ASUS",
    category: "hardware",
    subcategory: "gpu",
    subcategoryLabel: "Placas Gráficas",
    leafId: "gpu",
    currentPrice: 649,
    avg30d: 700,
    historicalMin: 600,
    historicalMax: 800,
    history: [
      { date: "2026-01-01", price: 720 },
      { date: "2026-02-01", price: 680 },
      { date: "2026-03-01", price: 649 },
    ],
    offers: [
      {
        store: "globaldata",
        storeName: "Globaldata",
        url: "https://example.com/a",
        price: 649,
      },
      {
        store: "pcdiga",
        storeName: "PCDIGA",
        url: "https://example.com/a2",
        price: 659,
      },
    ],
    decision: {
      finalScore: 88,
      publish: true,
      tier: "S",
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
      discountPct: 12,
      dealQuality: "VERY_GOOD_DEAL",
      opportunityType: "NEW_LOW",
      isHistoricalMin: false,
      cheapestStore: "globaldata",
      feedCategory: "hardware",
      bullets: [],
      semaphore: "buy",
      lymiarIndex: {
        value: 88,
        summary: "Bom momento",
        factors: {
          vsAvg30d: { score: 0, label: "Preço vs média 30d", detail: "—" },
          historicalMin: { score: 0, label: "Mínimo histórico", detail: "—" },
          couponApplied: { score: 0, label: "Cupão aplicado", detail: "—" },
          volatility: { score: 0, label: "Volatilidade", detail: "—" },
        },
      },
    },
    seasonality: { timesBelowCurrent12m: 2, note: "", markers: [] },
    condition: "NEW",
    typedAttributes: { vram_gb: 12, chipset: "RTX 5070", pcie: "5.0" },
    chipsetModel: "RTX 5070",
    ...over,
  };
}

afterEach(() => {
  clearCompare();
  vi.unstubAllGlobals();
});

describe("compare storage", () => {
  it("adds up to 4 and removes", () => {
    stubStorage();
    for (let i = 0; i < COMPARE_MAX; i++) {
      expect(
        addToCompare({
          slug: `p-${i}`,
          ean: String(i),
          name: `Product ${i}`,
          currentPrice: 100 + i,
          lymiarIndex: 50,
        }).ok,
      ).toBe(true);
    }
    expect(
      addToCompare({
        slug: "extra",
        ean: "x",
        name: "Extra",
        currentPrice: 1,
        lymiarIndex: 1,
      }).reason,
    ).toBe("full");
    expect(readCompareList()).toHaveLength(4);
    removeFromCompare("p-0");
    expect(readCompareList()).toHaveLength(3);
  });

  it("deep link ids parse and share url", () => {
    stubStorage();
    expect(parseCompareIdsParam("a,b,c")).toEqual(["a", "b", "c"]);
    expect(parseCompareIdsParam("a|b")).toEqual(["a", "b"]);
    expect(buildCompareShareUrl(["x", "y"])).toContain("ids=x%2Cy");
  });
});

describe("compare engine", () => {
  it("compares 2 products and highlights best price/score", () => {
    const a = baseProduct();
    const b = baseProduct({
      slug: "gpu-b",
      ean: "2",
      name: "GPU B 16GB",
      currentPrice: 799,
      typedAttributes: { vram_gb: 16, chipset: "RTX 5070 Ti", pcie: "5.0" },
      chipsetModel: "RTX 5070 Ti",
      decision: {
        ...baseProduct().decision,
        lymiarIndex: { ...baseProduct().decision.lymiarIndex, value: 70 },
        cheapestStore: "pcdiga",
      },
      offers: [
        {
          store: "pcdiga",
          storeName: "PCDIGA",
          url: "https://example.com/b",
          price: 799,
        },
      ],
    });

    const rows = buildCompareRows([a, b]);
    const price = rows.find((r) => r.id === "price_current")!;
    expect(price.cells[0].best).toBe(true);
    expect(price.cells[1].best).toBe(false);

    const score = rows.find((r) => r.id === "score")!;
    expect(score.cells[0].best).toBe(true);

    const vram = rows.find((r) => r.id === "spec_vram_gb")!;
    expect(vram.cells[1].best).toBe(true);
    expect(vram.cells[0].text).toMatch(/12/);
    expect(vram.cells[1].text).toMatch(/16/);

    const badges = computeCompareBadges([a, b]);
    expect(badges.some((x) => x.id === "best_price" && x.slug === "gpu-a")).toBe(
      true,
    );
    expect(badges.some((x) => x.id === "best_score" && x.slug === "gpu-a")).toBe(
      true,
    );
    expect(badges.some((x) => x.id === "most_stores" && x.slug === "gpu-a")).toBe(
      true,
    );
  });

  it("compares 4 products without inventing empty specs", () => {
    const products = [0, 1, 2, 3].map((i) =>
      baseProduct({
        slug: `p-${i}`,
        ean: String(i),
        name: `GPU ${i}`,
        currentPrice: 500 + i * 50,
        typedAttributes: i === 3 ? {} : { vram_gb: 8 + i * 2 },
        chipsetModel: i === 3 ? null : `RTX ${5070 + i}`,
      }),
    );
    const rows = buildCompareRows(products);
    expect(rows.length).toBeGreaterThan(5);
    const vram = rows.find((r) => r.id === "spec_vram_gb");
    expect(vram?.cells[3].text).toBe("—");
    expect(vram?.cells[3].empty).toBe(true);
  });

  it("filterDiffRows hides equal rows", () => {
    const a = baseProduct({ brand: "ASUS" });
    const b = baseProduct({
      slug: "b",
      ean: "2",
      name: "Other",
      currentPrice: 700,
      brand: "ASUS",
    });
    const rows = buildCompareRows([a, b]);
    const brandRow = rows.find((r) => r.id === "spec_brand");
    if (brandRow) {
      expect(brandRow.allEqual).toBe(true);
      const filtered = filterDiffRows(rows, true);
      expect(filtered.some((r) => r.id === "spec_brand")).toBe(false);
      expect(filtered.some((r) => r.id === "price_current")).toBe(true);
    }
  });

  it("detects mixed categories", () => {
    const gpu = baseProduct();
    const phone = baseProduct({
      slug: "phone",
      ean: "9",
      leafId: "smartphone",
      subcategory: "smartphone",
      category: "electronics",
      typedAttributes: { ram_gb: 8 },
    });
    expect(productsHaveMixedCategories([gpu, phone])).toBe(true);
    expect(productsHaveMixedCategories([gpu, baseProduct({ slug: "g2", ean: "3" })])).toBe(
      false,
    );
  });

  it("sorts by price and score", () => {
    const a = baseProduct({ slug: "a", currentPrice: 900 });
    const b = baseProduct({
      slug: "b",
      ean: "2",
      currentPrice: 500,
      decision: {
        ...baseProduct().decision,
        lymiarIndex: { ...baseProduct().decision.lymiarIndex, value: 40 },
      },
    });
    expect(sortProducts([a, b], "price")[0].slug).toBe("b");
    expect(sortProducts([a, b], "score")[0].slug).toBe("a");
  });
});
