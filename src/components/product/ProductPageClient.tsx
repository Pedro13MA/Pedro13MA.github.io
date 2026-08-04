"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detailToProduct,
  fetchProductMetrics,
  getProductBySlug,
  type ProductMetricsOut,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import {
  computeDataConfidence,
  estimateSeasonality,
  historySpanDays,
  isAbsoluteHistoricalMin,
} from "@/lib/product-insights";
import { recommendationsFromApi, type DiscoveryCard } from "@/lib/product-discovery";
import { buildPremiumProductBreadcrumbs } from "@/lib/product-breadcrumb-premium";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";
import { storeDisplayName } from "@/lib/storeLogos";
import { formatEUR } from "@/lib/utils";
import Link from "next/link";

type Props = { slug: string };

function Stars({ stars }: { stars: number }) {
  const s = Math.max(0, Math.min(5, Math.round(stars)));
  return (
    <span aria-hidden>
      {"★".repeat(s)}
      {"☆".repeat(Math.max(0, 5 - s))}
    </span>
  );
}

export function ProductPageClient({ slug }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [metrics, setMetrics] = useState<ProductMetricsOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProduct(null);
    setMetrics(null);

    getProductBySlug(slug)
      .then(async (detail) => {
        if (cancelled) return;
        const mapped = detailToProduct(detail);
        setProduct(mapped);

        const metricsRes = await fetchProductMetrics(mapped.ean).catch(() => null);
        if (cancelled) return;
        setMetrics(metricsRes);
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
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-10">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-xl bg-slate-100 sm:h-72" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product || !seasonality || !confidence) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Ainda não temos este produto
        </h1>
        <p className="mt-3 text-slate-500">
          Pode ser um link antigo, um erro temporário, ou um produto sem histórico suficiente no Limiar.
          Experimenta a pesquisa na página inicial.
        </p>
      </main>
    );
  }

  const histMin = product.historicalMin;
  const histMax = product.historicalMax;

  const storeCount = metrics?.storeCount ?? product.offers.length;
  const spanDays = historySpanDays(product.history);
  const observations = Math.max(
    product.history.length,
    metrics?.samples90d ?? 0,
    metrics?.samples30d ?? 0,
  );

  const avgObserved = metrics?.avg30d ?? product.avg30d;
  const currentIsMin = isAbsoluteHistoricalMin(product.currentPrice, product.historicalMin);
  const aboveAvg = product.currentPrice > avgObserved;

  const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedOffers[0] ?? null;
  const bestStore = bestOffer?.storeName || bestOffer?.store || null;

  // FASE 8.4 — recomendação apresentada ao utilizador deve ser explicada apenas
  // com dados observados (histórico) + confiança (e posição vs média observada).
  const verdict = currentIsMin || (confidence.score >= 50 && !aboveAvg);
  const recommendationLine = verdict
    ? "Recomendamos comprar."
    : "Recomendamos esperar.";

  const similar: DiscoveryCard[] =
    recommendationsFromApi(product.recommendations)?.similar?.slice(0, 6) ?? [];

  const breadcrumbs = buildPremiumProductBreadcrumbs({
    category: product.category,
    subcategory: product.subcategory,
    subcategoryLabel: product.subcategoryLabel,
    leafId: product.leafId,
    taxonomyPath: product.taxonomyPath,
    brand: product.brand,
    productName: product.name,
    chipsetModel: product.chipsetModel,
  });

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-10">
      <ProductJsonLd product={product} />
      <ProductBreadcrumb crumbs={breadcrumbs} />

      {/* Hero (imagem + essenciais + Comprar + ❤️/🛒/🔔) */}
      <ProductHero product={product} />

      {/* Análise Limiar — decisão em primeiro */}
      <section
        aria-label="Análise Limiar"
        className="rounded-2xl border border-slate-200/70 bg-white px-4 py-6 sm:px-6"
      >
        <h2 className="font-display text-xl font-bold text-slate-900">
          Vale a pena comprar?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {recommendationLine}
        </p>

        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>
            Observamos este produto há{" "}
            <span className="font-semibold text-slate-900">{spanDays}</span>{" "}
            dias.
          </li>
          <li>
            Existem atualmente{" "}
            <span className="font-semibold text-slate-900">{storeCount}</span>{" "}
            lojas com oferta.
          </li>
          <li>
            O preço atual encontra-se{" "}
            <span className="font-semibold text-slate-900">
              {aboveAvg ? "acima" : "abaixo"}
            </span>{" "}
            da média observada.
          </li>
          {seasonality?.sufficient && seasonality.lowPricePeriods.length > 0 ? (
            <li>
              Existem períodos no histórico em que o preço costuma ficar abaixo do atual.
            </li>
          ) : null}
          {bestStore ? (
            <li>
              Onde comprar mais barato:{" "}
              <span className="font-semibold text-slate-900">
                {storeDisplayName(bestStore, bestStore)}
              </span>
              .
            </li>
          ) : null}
        </ul>
      </section>

      {/* Confiança (apenas base estatística + estrelas) */}
      <section
        aria-label="Confiança"
        className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-6 sm:px-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Confidence:{" "}
              <span className="font-display tabular-nums">{confidence.score}%</span>{" "}
              <span className="inline-flex items-center align-middle">
                (<Stars stars={confidence.stars} />)
              </span>
            </p>
          </div>
          <div className="text-right">
            <span className="sr-only">Confiança por estrelas</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Based on:{" "}
          <span className="font-semibold text-slate-900">{spanDays}</span> days
          observed, <span className="font-semibold text-slate-900">{storeCount}</span>{" "}
          stores,{" "}
          <span className="font-semibold text-slate-900">{observations}</span>{" "}
          price changes.
        </p>
      </section>

      {/* Histórico — 1 gráfico grande */}
      <section id="historico" className="space-y-3">
        <PriceHistoryChart
          productId={slug}
          currentPrice={product.currentPrice}
          fallbackHistory={product.history}
          fallbackMin={histMin}
          fallbackMax={histMax}
        />
      </section>

      {/* Onde comprar — cartões por loja (sem tabela) */}
      {product.offers?.length ? (
        <section id="lojas" className="scroll-mt-20 space-y-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Onde comprar
            </h2>
          </div>
          <StoreCompareTable offers={product.offers} />
        </section>
      ) : null}

      {/* Alternativas — 1 lista, max 6 */}
      {similar.length ? (
        <section id="alternativas" className="scroll-mt-20 space-y-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Alternativas semelhantes
            </h2>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {similar.map((p) => (
              <li
                key={`alt-${p.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <Link
                  href={`/p/?id=${encodeURIComponent(p.slug)}`}
                  className="block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-10 w-10 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-600">
                          ?
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">
                        {p.name}
                      </p>
                      <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
                        {formatEUR(p.currentPrice)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
