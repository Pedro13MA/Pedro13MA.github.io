import { describe, expect, it } from "vitest";
import { pickSimilarAlternatives } from "@/lib/product-similar-alternatives";
import type { DiscoveryCard, ProductRecommendations } from "@/lib/product-discovery";
import type { Product } from "@/lib/types";

function card(
  partial: Partial<DiscoveryCard> & Pick<DiscoveryCard, "slug" | "name" | "currentPrice">,
): DiscoveryCard {
  return {
    reason: "test",
    ...partial,
  };
}

function baseProduct(partial: Partial<Product> = {}): Product {
  return {
    slug: "iphone-15",
    ean: "1",
    name: "iPhone 15 128GB",
    brand: "Apple",
    category: "Tech",
    subcategory: "smartphone",
    leafId: "smartphone",
    imageUrl: null,
    currency: "EUR",
    listPrice: 900,
    currentPrice: 900,
    avg30d: 920,
    historicalMin: 850,
    historicalMax: 999,
    history: [],
    offers: [],
    seasonality: { timesBelowCurrent12m: 0, note: "", markers: [] },
    decision: {
      finalScore: 70,
      publish: true,
      tier: "A",
      reason: "",
      breakdown: {
        baseQuality: 0,
        priceOpportunity: 0,
        trend: 0,
        rarity: 0,
        categoryOverload: 0,
        storeDominance: 0,
        feedbackAdjustment: 0,
      },
      discountPct: 0,
      zScore: 0,
      dealQuality: "GOOD",
      opportunityType: "PRICE_DROP",
      semaphore: "buy",
      lymiarIndex: { value: 70, label: "", band: "good" },
      isHistoricalMin: false,
      cheapestStore: null,
    },
    ...partial,
  } as Product;
}

describe("pickSimilarAlternatives", () => {
  it("keeps phone peers and drops absurd accessories", () => {
    const recs: ProductRecommendations = {
      similar: [
        card({
          slug: "galaxy-s24",
          name: "Samsung Galaxy S24 128GB",
          currentPrice: 880,
          leafId: "smartphone",
        }),
        card({
          slug: "adapter-usb",
          name: "Adaptador USB-C",
          currentPrice: 20,
          leafId: "accessory",
        }),
        card({
          slug: "scooter",
          name: "Trotinete eléctrica",
          currentPrice: 400,
          leafId: "smartphone",
        }),
      ],
    };

    const out = pickSimilarAlternatives(baseProduct(), recs, 6);
    expect(out.map((c) => c.slug)).toEqual(["galaxy-s24"]);
  });

  it("never mixes console bucket leaves (game vs controller)", () => {
    const recs: ProductRecommendations = {
      similar: [
        card({
          slug: "fifa",
          name: "FIFA 25 Nintendo Switch",
          currentPrice: 55,
          leafId: "game_physical",
        }),
        card({
          slug: "dualsense",
          name: "DualSense Wireless",
          currentPrice: 60,
          leafId: "controller",
        }),
        card({
          slug: "pokemon-2",
          name: "Pokémon Pokopia",
          currentPrice: 50,
          leafId: "game_physical",
        }),
      ],
    };
    const out = pickSimilarAlternatives(
      baseProduct({
        slug: "pokemon",
        name: "Pokémon Legends",
        subcategory: "console",
        leafId: "game_physical",
        currentPrice: 52,
        listPrice: 52,
      }),
      recs,
      6,
    );
    expect(out.map((c) => c.slug).sort()).toEqual(["fifa", "pokemon-2"]);
  });

  it("rejects cards without leaf when current has usable leaf", () => {
    const recs: ProductRecommendations = {
      similar: [
        card({
          slug: "legacy-peer",
          name: "Samsung Galaxy A55",
          currentPrice: 420,
          // no leafId — would previously match via subcategory heuristics
        }),
      ],
    };
    const out = pickSimilarAlternatives(
      baseProduct({ leafId: "smartphone", currentPrice: 400, listPrice: 400 }),
      recs,
      6,
    );
    expect(out).toHaveLength(0);
  });
});
