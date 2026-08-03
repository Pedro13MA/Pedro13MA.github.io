/**
 * FASE 7.8 — conteúdo / specs / FAQ a partir de dados existentes.
 */

import { describe, expect, it } from "vitest";
import {
  buildAutoDescription,
  buildProductFaq,
  buildSpecRows,
  collectImageUrls,
  parseTypedAttributes,
} from "@/lib/product-content";
import type { Product } from "@/lib/types";

function baseProduct(over: Partial<Product> = {}): Product {
  return {
    slug: "rtx-5070-asus",
    ean: "1",
    name: "ASUS TUF RTX 5070",
    brand: "ASUS",
    category: "hardware",
    subcategory: "gpu",
    subcategoryLabel: "Placas Gráficas",
    leafId: "gpu",
    currentPrice: 649,
    avg30d: 680,
    historicalMin: 620,
    historicalMax: 799,
    history: [{ date: "2026-01-01", price: 650 }],
    offers: [
      {
        store: "globaldata",
        storeName: "Globaldata",
        url: "https://example.com",
        price: 649,
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
      discountPct: 10,
      dealQuality: "VERY_GOOD_DEAL",
      opportunityType: "NEW_LOW",
      isHistoricalMin: true,
      cheapestStore: "globaldata",
      feedCategory: "hardware",
      bullets: [],
      semaphore: "buy",
      limiarIndex: {
        value: 88,
        summary: "ok",
        factors: {
          vsAvg30d: { score: 0, label: "Preço vs média 30d", detail: "—" },
          historicalMin: { score: 0, label: "Mínimo histórico", detail: "—" },
          couponApplied: { score: 0, label: "Cupão aplicado", detail: "—" },
          volatility: { score: 0, label: "Volatilidade", detail: "—" },
        },
      },
    },
    seasonality: {
      timesBelowCurrent12m: 2,
      note: "",
      markers: [],
    },
    condition: "NEW",
    typedAttributes: { vram_gb: 12, pcie: "5.0", rgb: true },
    chipsetModel: "RTX 5070",
    imageUrl: "https://cdn.example/a.jpg",
    imageUrls: ["https://cdn.example/a.jpg", "https://cdn.example/b.jpg"],
    ...over,
  };
}

describe("product-content", () => {
  it("parseTypedAttributes", () => {
    expect(parseTypedAttributes({ a: 1 })).toEqual({ a: 1 });
    expect(parseTypedAttributes('{"vram_gb":16}')).toEqual({ vram_gb: 16 });
    expect(parseTypedAttributes(null)).toEqual({});
  });

  it("buildSpecRows — GPU attrs only from data", () => {
    const rows = buildSpecRows(baseProduct());
    const keys = rows.map((r) => r.key);
    expect(keys).toContain("vram_gb");
    expect(keys).toContain("pcie");
    expect(keys).toContain("chipset");
    expect(rows.find((r) => r.key === "rgb")?.value).toBe("Sim");
  });

  it("buildAutoDescription — never invents empty specs", () => {
    const d = buildAutoDescription(
      baseProduct({ typedAttributes: {}, chipsetModel: null, vramSpec: null }),
    );
    expect(d.summary.length).toBeGreaterThan(20);
    expect(d.features.length).toBeLessThanOrEqual(1);
  });

  it("buildProductFaq — uses real condition and stores", () => {
    const faq = buildProductFaq(baseProduct());
    expect(faq.some((f) => f.question.includes("novo"))).toBe(true);
    expect(faq.some((f) => f.answer.includes("620") || f.answer.includes("mínimo"))).toBe(
      true,
    );
  });

  it("collectImageUrls dedupes", () => {
    expect(collectImageUrls(baseProduct())).toHaveLength(2);
  });
});
