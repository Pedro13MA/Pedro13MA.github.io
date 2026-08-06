import { describe, expect, it } from "vitest";
import { pickSimilarAlternatives } from "@/lib/product-similar-alternatives";
import type { ProductRecommendations } from "@/lib/product-discovery";
import type { Product } from "@/lib/types";

const iphone = {
  slug: "iphone-17",
  name: "Apple iPhone 17 256GB",
  brand: "Apple",
  leafId: "smartphone",
  subcategory: "smartphone",
  category: "telemoveis",
  currentPrice: 999,
} as unknown as Product;

function card(name: string, price: number, slug: string) {
  return {
    slug,
    name,
    currentPrice: price,
    leafId: "smartphone",
    reason: "test",
  };
}

describe("pickSimilarAlternatives", () => {
  it("keeps other iPhones and drops GPUs", () => {
    const recs: ProductRecommendations = {
      similar: [
        card("Apple iPhone 16 Pro 256GB", 1099, "iphone-16-pro"),
        card("Apple iPhone 17 Pro", 1199, "iphone-17-pro"),
        card("NVIDIA GeForce RTX 4070 12GB", 650, "rtx-4070"),
      ],
    };
    const out = pickSimilarAlternatives(iphone, recs, 6);
    expect(out.map((p) => p.slug)).toEqual([
      "iphone-16-pro",
      "iphone-17-pro",
    ]);
  });
});
