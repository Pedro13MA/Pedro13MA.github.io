"use client";

import { useEffect, useState } from "react";
import { searchProducts, summaryToProduct } from "@/lib/api";
import type { Product } from "@/lib/types";
import {
  isLikelyVariantOf,
  isSimilarProduct,
  stripCapacityFromName,
  stripVariantNoise,
} from "@/lib/product-insights";
import { OpportunityCard } from "@/components/product/OpportunityCard";

type Props = { product: Product };

function similarScore(current: Product, cand: Product): number {
  let s = 0;
  if (current.leafId && cand.leafId && current.leafId === cand.leafId) s += 40;
  if (
    current.chipsetModel &&
    cand.chipsetModel &&
    current.chipsetModel.toLowerCase() === cand.chipsetModel.toLowerCase()
  ) {
    s += 35;
  }
  if (current.brand && cand.brand && current.brand === cand.brand) s += 20;
  if (current.category && cand.category && current.category === cand.category) {
    s += 10;
  }
  const priceDelta =
    Math.abs(cand.currentPrice - current.currentPrice) /
    Math.max(current.currentPrice, 1);
  if (priceDelta <= 0.15) s += 15;
  else if (priceDelta <= 0.3) s += 8;
  s += Math.min(20, cand.decision.limiarIndex.value / 5);
  return s;
}

/**
 * Variantes (só se existirem) + semelhantes por leaf/chip/marca/preço/score.
 * Reutiliza searchProducts já usado — sem endpoints novos.
 */
export function RelatedProductsSection({ product }: Props) {
  const [variants, setVariants] = useState<Product[]>([]);
  const [similar, setSimilar] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    const variantQuery = stripCapacityFromName(product.name) || product.name;
    const similarQuery =
      product.chipsetModel ||
      (product.brand && product.leafId
        ? `${product.brand} ${product.leafId}`
        : product.brand && product.category
          ? `${product.brand} ${product.category}`
          : stripVariantNoise(product.name) || product.name);

    Promise.all([
      searchProducts(variantQuery, {
        brand: product.brand || undefined,
        limit: 16,
        sortBy: "limiar_desc",
      }).catch(() => null),
      searchProducts(similarQuery, {
        category: product.category || undefined,
        limit: 24,
        sortBy: "limiar_desc",
      }).catch(() => null),
    ]).then(([variantRes, similarRes]) => {
      if (cancelled) return;
      const variantProducts = (variantRes?.results || [])
        .map(summaryToProduct)
        .filter((p) => isLikelyVariantOf(product, p))
        .filter((p) => p.slug !== product.slug && p.ean !== product.ean)
        .slice(0, 6);

      const variantSlugs = new Set(variantProducts.map((p) => p.slug));
      const similarProducts = (similarRes?.results || [])
        .map(summaryToProduct)
        .filter((p) => p.slug !== product.slug && p.ean !== product.ean)
        .filter((p) => !variantSlugs.has(p.slug))
        .filter((p) => isSimilarProduct(product, p) || Boolean(product.chipsetModel))
        .filter((p) => p.inStock !== false)
        .map((p) => ({ p, score: similarScore(product, p) }))
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p)
        .slice(0, 6);

      setVariants(variantProducts);
      setSimilar(similarProducts);
    });

    return () => {
      cancelled = true;
    };
  }, [product]);

  if (!variants.length && !similar.length) return null;

  return (
    <div className="space-y-10">
      {variants.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Variantes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Cor, capacidade ou tamanho da mesma gama — sem repetir este produto.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((p) => (
              <OpportunityCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {similar.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Produtos semelhantes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mesmo chip, leaf, marca ou intervalo de preço — ordenados por relevância.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <OpportunityCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
