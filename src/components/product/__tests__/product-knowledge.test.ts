/**
 * FASE 7.15 — Product Knowledge (FE).
 */
import { describe, expect, it } from "vitest";
import {
  knowledgeForJsonLd,
  resolveProductKnowledge,
  scoreKnowledgeCompleteness,
} from "@/lib/product-knowledge";
import { buildCompareRows, filterDiffRows } from "@/lib/compare-engine";
import type { Product } from "@/lib/types";

function baseProduct(over: Partial<Product> = {}): Product {
  return {
    slug: "gpu-test",
    ean: "123",
    name: "ASUS TUF RTX 5070 12GB",
    brand: "ASUS",
    category: "Componentes",
    subcategory: "gpu",
    leafId: "gpu",
    currentPrice: 599,
    avg30d: 620,
    historicalMin: 580,
    historicalMax: 700,
    history: [
      { date: "2026-01-01", price: 650 },
      { date: "2026-02-01", price: 599 },
    ],
    offers: [
      {
        store: "pcdiga",
        storeName: "PCDiga",
        slug: "pcdiga",
        price: 599,
        currency: "EUR",
        url: "https://example.com",
        inStock: true,
      },
    ],
    decision: {
      finalScore: 80,
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
      discountPct: 10,
      dealQuality: "GOOD_DEAL",
      opportunityType: "PRICE_DROP",
      isHistoricalMin: false,
      cheapestStore: "pcdiga",
      feedCategory: "hardware",
      bullets: [],
      semaphore: "buy",
      lymiarIndex: {
        value: 82,
        summary: "Bom momento",
        factors: {
          vsAvg30d: { score: 0, label: "Preço vs média 30d", detail: "—" },
          historicalMin: { score: 0, label: "Mínimo histórico", detail: "—" },
          couponApplied: { score: 0, label: "Cupão aplicado", detail: "—" },
          volatility: { score: 0, label: "Volatilidade", detail: "—" },
        },
      },
    },
    seasonality: { timesBelowCurrent12m: 0, note: "", markers: [] },
    typedAttributes: {
      vram_gb: 12,
      chipset: "RTX 5070",
      pcie: "5.0",
      tdp_w: 320,
      memory_type: "GDDR7",
      brand: "ASUS",
    },
    ...over,
  };
}

describe("FASE 7.15 knowledge", () => {
  it("GPU ficha agrupada + completeness alto", () => {
    const k = resolveProductKnowledge(baseProduct());
    expect(k).not.toBeNull();
    expect(k!.groups.length).toBeGreaterThan(0);
    expect(k!.completeness).toBeGreaterThanOrEqual(80);
    const labels = k!.groups.map((g) => g.label);
    expect(labels.some((l) => /memória|vídeo|identidade/i.test(l))).toBe(true);
  });

  it("CPU completeness a partir de typed", () => {
    const p = baseProduct({
      leafId: "cpu",
      subcategory: "cpu",
      name: "AMD Ryzen 7",
      typedAttributes: {
        brand: "AMD",
        socket: "AM5",
        cores: 8,
        threads: 16,
        tdp_w: 120,
        series: "Ryzen 7",
      },
    });
    const k = resolveProductKnowledge(p);
    expect(k!.completeness).toBe(100);
  });

  it("SSD / Monitor / TV / Smartphone / Laptop grupos", () => {
    for (const [leaf, attrs] of [
      ["ssd", { brand: "Samsung", capacity_gb: 2000, interface: "NVMe", form_factor: "M.2", pcie: "4.0" }],
      ["monitor", { brand: "LG", screen_size: 27, resolution: "2560x1440", refresh_rate: 144, panel: "IPS" }],
      ["tv", { brand: "Samsung", screen_size: 55, resolution: "4K", panel: "OLED" }],
      ["smartphone", { brand: "Samsung", screen_size: 6.2, ram_gb: 8, capacity_gb: 256, battery_mah: 4000 }],
      ["laptop", { brand: "ASUS", ram_gb: 16, screen_size: 15.6, series: "ROG" }],
    ] as const) {
      const k = resolveProductKnowledge(
        baseProduct({
          leafId: leaf,
          subcategory: leaf,
          typedAttributes: attrs as Record<string, unknown>,
        }),
      );
      expect(k?.groups.length, leaf).toBeGreaterThan(0);
      expect(k!.completeness, leaf).toBeGreaterThanOrEqual(60);
    }
  });

  it("API knowledge preferido", () => {
    const k = resolveProductKnowledge(
      baseProduct({
        typedAttributes: { brand: "X" },
        knowledge: {
          leaf: "gpu",
          attributes: { chipset: "RTX 5090", vram_gb: 32 },
          groups: [
            {
              id: "video",
              label: "Vídeo / Ecrã",
              items: [
                { key: "chipset", label: "Chip", value: "RTX 5090" },
                { key: "vram_gb", label: "VRAM", value: "32 GB" },
              ],
            },
          ],
          completeness: 40,
        },
        knowledgeCompleteness: 40,
      }),
    );
    expect(k!.groups[0].items[0].value).toBe("RTX 5090");
    expect(k!.completeness).toBe(40);
  });

  it("JSON-LD specs só com attrs suficientes", () => {
    const rich = knowledgeForJsonLd(baseProduct());
    expect(rich.length).toBeGreaterThanOrEqual(3);
    const poor = knowledgeForJsonLd(
      baseProduct({ typedAttributes: { brand: "ASUS" }, knowledge: null }),
    );
    expect(poor.length).toBe(0);
  });

  it("scoreKnowledgeCompleteness 0-100", () => {
    expect(scoreKnowledgeCompleteness({}, "gpu")).toBe(0);
    expect(
      scoreKnowledgeCompleteness(
        {
          brand: "A",
          chipset: "X",
          vram_gb: 12,
          pcie: "5",
          tdp_w: 300,
          memory_type: "GDDR7",
        },
        "gpu",
      ),
    ).toBe(100);
  });

  it("comparador agrupa por secções e destaca diffs", () => {
    const a = baseProduct({ slug: "a", typedAttributes: { vram_gb: 12, chipset: "RTX 5070" } });
    const b = baseProduct({
      slug: "b",
      name: "MSI RTX 5070 Ti 16GB",
      typedAttributes: { vram_gb: 16, chipset: "RTX 5070 Ti" },
    });
    const rows = buildCompareRows([a, b]);
    const specRows = rows.filter((r) => r.id.startsWith("spec_"));
    expect(specRows.length).toBeGreaterThan(0);
    expect(specRows.some((r) => r.group !== "specs")).toBe(true);
    const diffs = filterDiffRows(specRows, true);
    expect(diffs.some((r) => !r.allEqual)).toBe(true);
  });
});
