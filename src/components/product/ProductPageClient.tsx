"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detailToProduct,
  fetchProductMetrics,
  getProductBySlug,
  searchProducts,
  type ProductMetricsOut,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import {
  buildLimiarInsights,
  computeDataConfidence,
  estimateSeasonality,
  findBetterStorageVariantTip,
  stripCapacityFromName,
} from "@/lib/product-insights";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { DataConfidenceCard } from "@/components/product/DataConfidenceCard";
import { DecisionCard } from "@/components/product/DecisionCard";
import { LimiarIndexCard } from "@/components/product/LimiarIndexCard";
import { LimiarInsights } from "@/components/product/LimiarInsights";
import { MarketSummaryPanel } from "@/components/product/MarketSummaryPanel";
import { PriceAlertForm } from "@/components/product/PriceAlertForm";
import { ProductHeader } from "@/components/product/ProductHeader";
import {
  ActiveCampaignBanner,
  StoreCouponsInfoBanner,
} from "@/components/product/CampaignCouponBlock";
import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";
import { SeasonalityCard } from "@/components/product/SeasonalityCard";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";

type Props = { slug: string };

export function ProductPageClient({ slug }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [metrics, setMetrics] = useState<ProductMetricsOut | null>(null);
  const [variantTip, setVariantTip] = useState<ReturnType<
    typeof findBetterStorageVariantTip
  >>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMetrics(null);
    setVariantTip(null);

    getProductBySlug(slug)
      .then(async (detail) => {
        if (cancelled) return;
        const mapped = detailToProduct(detail);
        setProduct(mapped);

        const [metricsRes, searchRes] = await Promise.all([
          fetchProductMetrics(mapped.ean).catch(() => null),
          searchProducts(stripCapacityFromName(mapped.name) || mapped.name, {
            brand: mapped.brand || undefined,
            limit: 16,
            sortBy: "price_asc",
          }).catch(() => null),
        ]);
        if (cancelled) return;
        setMetrics(metricsRes);
        setVariantTip(
          findBetterStorageVariantTip({
            currentName: mapped.name,
            currentSlug: mapped.slug,
            currentPrice: mapped.currentPrice,
            siblings: (searchRes?.results || []).map((r) => ({
              slug: r.slug,
              name: r.name,
              currentPrice: r.currentPrice,
            })),
          }),
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setProduct(null);
          setError(err instanceof Error ? err.message : "Produto não encontrado");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const seasonality = useMemo(() => {
    if (!product) return null;
    return estimateSeasonality(
      product.history,
      product.currentPrice,
      product.seasonality.timesBelowCurrent12m,
    );
  }, [product]);

  const confidence = useMemo(() => {
    if (!product) return null;
    return computeDataConfidence({
      history: product.history,
      storeCount: metrics?.storeCount ?? product.offers.length,
      samples30d: metrics?.samples30d,
      samples90d: metrics?.samples90d,
      volatilityPct: metrics?.volatilityPct,
    });
  }, [product, metrics]);

  const insights = useMemo(() => {
    if (!product || !confidence || !seasonality) return [];
    return buildLimiarInsights({
      product,
      confidence,
      seasonality,
      variantTip,
    });
  }, [product, confidence, seasonality, variantTip]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </main>
    );
  }

  if (error || !product || !seasonality || !confidence) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Produto não encontrado</h1>
        <p className="mt-3 text-slate-500">
          {error || "Não encontrámos este produto. Tenta outra pesquisa."}
        </p>
      </main>
    );
  }

  const histMin = product.historicalMin;
  const histMax = product.historicalMax;
  const pvpr =
    product.originalPrice != null && product.originalPrice > product.currentPrice
      ? product.originalPrice
      : null;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <ProductHeader product={product} />
      <ActiveCampaignBanner product={product} />
      <StoreCouponsInfoBanner product={product} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <LimiarIndexCard
          index={product.decision.limiarIndex}
          currentPrice={product.currentPrice}
        />
        <DecisionCard
          decision={product.decision}
          currentPrice={product.currentPrice}
          avg30d={product.avg30d}
          history={product.history}
        />
      </div>

      <LimiarInsights insights={insights} />

      <div className="space-y-6">
        <PriceHistoryChart
          productId={slug}
          fallbackHistory={product.history}
          fallbackMin={histMin}
          fallbackMax={histMax}
          referencePrice={product.referencePrice ?? product.avg30d}
          referenceSource={product.referenceSource ?? "HISTORY_30D"}
          pvpr={pvpr}
        />
        <MarketSummaryPanel
          ean={product.ean}
          currentPrice={product.currentPrice}
          avg30d={product.avg30d}
          metrics={metrics}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SeasonalityCard seasonality={seasonality} />
        <div className="space-y-6">
          <DataConfidenceCard confidence={confidence} />
          <PriceAlertForm
            productName={product.name}
            currentPrice={product.currentPrice}
            historicalMin={histMin}
            avg30d={product.avg30d}
            suggestedThreshold={Math.round(histMin * 100) / 100}
          />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">Comparação multi-loja</h2>
        {product.offers.length ? (
          <StoreCompareTable offers={product.offers} />
        ) : (
          <p className="text-sm text-slate-500">Sem ofertas multi-loja para este EAN.</p>
        )}
      </section>

      <RelatedProductsSection product={product} />
    </main>
  );
}
