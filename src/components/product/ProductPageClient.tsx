"use client";

import { useEffect, useState } from "react";
import { detailToProduct, getProductBySlug } from "@/lib/api";
import type { Product } from "@/lib/types";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductMetricsPanel } from "@/components/ProductMetricsPanel";
import { DecisionCard } from "@/components/product/DecisionCard";
import { LimiarIndexCard } from "@/components/product/LimiarIndexCard";
import { PriceAlertForm } from "@/components/product/PriceAlertForm";
import { ProductHeader } from "@/components/product/ProductHeader";
import {
  ActiveCampaignBanner,
  CouponPriceBlock,
  SmartBasketBanner,
} from "@/components/product/CampaignCouponBlock";
import { SeasonalityCard } from "@/components/product/SeasonalityCard";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";

type Props = { slug: string };

export function ProductPageClient({ slug }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProductBySlug(slug)
      .then((detail) => {
        if (!cancelled) setProduct(detailToProduct(detail));
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

  if (error || !product) {
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

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <ProductHeader product={product} />
      <ActiveCampaignBanner product={product} />
      <SmartBasketBanner product={product} />
      <CouponPriceBlock product={product} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <LimiarIndexCard
          index={product.decision.limiarIndex}
          currentPrice={product.currentPrice}
        />
        <DecisionCard decision={product.decision} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <PriceHistoryChart
          productId={slug}
          fallbackHistory={product.history}
          fallbackMin={histMin}
          fallbackMax={histMax}
          referencePrice={product.referencePrice ?? product.avg30d}
          referenceSource={product.referenceSource ?? "HISTORY_30D"}
        />

        <div className="space-y-6">
          <ProductMetricsPanel ean={product.ean} currentPrice={product.currentPrice} />
          <SeasonalityCard seasonality={product.seasonality} />
          <PriceAlertForm
            productName={product.name}
            currentPrice={product.currentPrice}
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
    </main>
  );
}
