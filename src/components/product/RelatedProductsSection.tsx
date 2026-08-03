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

export function RelatedProductsSection({ product }: Props) {
  const [variants, setVariants] = useState<Product[]>([]);
  const [similar, setSimilar] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    const variantQuery = stripCapacityFromName(product.name) || product.name;
    const similarQuery =
      product.brand && product.category
        ? `${product.brand} ${product.category}`
        : stripVariantNoise(product.name) || product.name;

    Promise.all([
      searchProducts(variantQuery, {
        brand: product.brand || undefined,
        limit: 16,
        sortBy: "limiar_desc",
      }).catch(() => null),
      searchProducts(similarQuery, {
        category: product.category || undefined,
        limit: 16,
        sortBy: "limiar_desc",
      }).catch(() => null),
    ]).then(([variantRes, similarRes]) => {
      if (cancelled) return;
      const variantProducts = (variantRes?.results || [])
        .map(summaryToProduct)
        .filter((p) => isLikelyVariantOf(product, p))
        .slice(0, 6);
      const variantSlugs = new Set(variantProducts.map((p) => p.slug));
      const similarProducts = (similarRes?.results || [])
        .map(summaryToProduct)
        .filter((p) => isSimilarProduct(product, p) && !variantSlugs.has(p.slug))
        .filter((p) => p.inStock !== false)
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
              Variantes deste produto
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Capacidades ou cores da mesma gama, com base nos resultados Limiar.
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
              Também poderá gostar
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Produtos semelhantes da mesma categoria, ordenados pela qualidade da decisão de compra.
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
