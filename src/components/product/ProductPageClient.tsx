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
  computeDataConfidence,
  estimateSeasonality,
  findBetterStorageVariantTip,
  stripCapacityFromName,
} from "@/lib/product-insights";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { DecisionCard } from "@/components/product/DecisionCard";
import {
  ActiveCampaignBanner,
  StoreCouponsInfoBanner,
} from "@/components/product/CampaignCouponBlock";
import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";
import { ProductHeader } from "@/components/product/ProductHeader";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

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
  const storeCount = metrics?.storeCount ?? product.offers.length;

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <ProductHeader product={product} />

      <DecisionCard
        decision={product.decision}
        currentPrice={product.currentPrice}
        avg30d={product.avg30d}
        historicalMin={histMin}
        history={product.history}
        storeCount={storeCount}
        samples30d={metrics?.samples30d}
        samples90d={metrics?.samples90d}
      />

      <section id="lojas" className="scroll-mt-20 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Onde comprar</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Preço da loja separado de qualquer cupão. Ordenado do mais baixo para o mais alto.
          </p>
        </div>
        <StoreCompareTable offers={product.offers} />
      </section>

      <section id="historico" className="scroll-mt-20 space-y-4">
        <PriceHistoryChart
          productId={slug}
          fallbackHistory={product.history}
          fallbackMin={histMin}
          fallbackMax={histMax}
          referencePrice={product.referencePrice ?? product.avg30d}
          referenceSource={product.referenceSource ?? "HISTORY_30D"}
          pvpr={pvpr}
        />
      </section>

      <div className="space-y-4">
        <ActiveCampaignBanner product={product} />
        <StoreCouponsInfoBanner product={product} />
      </div>

      {variantTip ? (
        <p className="rounded-2xl border border-slate-200 bg-[#FAFAFA] px-4 py-3 text-sm text-slate-600">
          {variantTip.message}{" "}
          <a
            href={`/p/?id=${encodeURIComponent(variantTip.siblingSlug)}`}
            className="font-medium text-sky-700 hover:text-sky-900"
          >
            Ver variante
          </a>
        </p>
      ) : null}

      <section className="rounded-2xl border border-sky-100 bg-sky-50/40 px-6 py-8 sm:px-8">
        <h2 className="font-display text-lg font-bold text-slate-900">Alertas Limiar</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          Queres ser avisado quando o preço baixar? Segue o canal Telegram Limiar — alertas
          pessoais por email só quando estiverem disponíveis de ponta a ponta.
        </p>
        <a
          href={TELEGRAM_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-sky-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
        >
          Abrir Telegram
        </a>
      </section>

      <RelatedProductsSection product={product} />
    </main>
  );
}
