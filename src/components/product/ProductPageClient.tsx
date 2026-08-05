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
  MIN_HISTORY_SPAN_DAYS,
} from "@/lib/product-insights";
import { recommendationsFromApi } from "@/lib/product-discovery";
import { pickSimilarAlternatives } from "@/lib/product-similar-alternatives";
import { buildPremiumProductBreadcrumbs } from "@/lib/product-breadcrumb-premium";
import { isP34ProductPageEnabled } from "@/lib/product/flags";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";
import {
  ProductPageP34,
  ProductPdpSkeleton,
} from "@/components/product/p34";
import { storeDisplayName } from "@/lib/storeLogos";
import { formatEUR } from "@/lib/utils";
import Link from "next/link";

type Props = { slug: string };

function Stars({ stars }: { stars: number }) {
  const s = Math.max(0, Math.min(5, Math.round(stars)));
  return (
    <span className="tracking-tight text-amber-500" aria-hidden>
      {"★".repeat(s)}
      <span className="text-slate-300">{"☆".repeat(Math.max(0, 5 - s))}</span>
    </span>
  );
}

function buildVerdictCopy(opts: {
  spanDays: number;
  storeCount: number;
  aboveAvg: boolean;
  currentIsMin: boolean;
  confidenceScore: number;
  bestStoreLabel: string | null;
}): { title: string; lines: string[] } {
  const {
    spanDays,
    storeCount,
    aboveAvg,
    currentIsMin,
    confidenceScore,
    bestStoreLabel,
  } = opts;

  const thinHistory =
    spanDays < Math.min(14, MIN_HISTORY_SPAN_DAYS / 2) || confidenceScore < 35;

  if (thinHistory) {
    return {
      title: "O Lymiar ainda está a observar este produto",
      lines: [
        `Acompanhamos este produto há apenas ${spanDays} dia${spanDays === 1 ? "" : "s"}.`,
        "Ainda não existe informação suficiente para recomendar a compra.",
        storeCount > 0
          ? `Neste momento existem ${storeCount} loja${storeCount === 1 ? "" : "s"} com oferta.`
          : "Ainda não há ofertas suficientes para comparar lojas.",
      ],
    };
  }

  if (currentIsMin || (!aboveAvg && confidenceScore >= 50)) {
    const lines = [
      `O Lymiar acompanha este produto há ${spanDays} dias.`,
      `Neste momento existem ${storeCount} loja${storeCount === 1 ? "" : "s"} com oferta.`,
      currentIsMin
        ? "O preço actual corresponde ao mínimo observado."
        : "O preço encontra-se abaixo da média observada.",
    ];
    if (bestStoreLabel) {
      lines.push(
        `A ${bestStoreLabel} apresenta actualmente o melhor preço.`,
      );
    }
    return {
      title: "Vale a pena comprar",
      lines,
    };
  }

  const lines = [
    `O Lymiar acompanha este produto há ${spanDays} dias.`,
    `Neste momento existem ${storeCount} loja${storeCount === 1 ? "" : "s"} com oferta.`,
    aboveAvg
      ? "O preço encontra-se acima da média observada."
      : "O preço ainda não se destaca claramente face ao histórico.",
  ];
  if (bestStoreLabel) {
    lines.push(
      `Se fores comprar agora, a ${bestStoreLabel} tem o melhor preço observado.`,
    );
  }
  return {
    title: "Recomendamos esperar",
    lines,
  };
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
    if (isP34ProductPageEnabled()) {
      return <ProductPdpSkeleton />;
    }
    return (
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="h-5 w-56 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100 sm:h-80" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-36 animate-pulse rounded bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
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
          Pode ser um link antigo, um erro temporário, ou um produto sem histórico
          suficiente no Lymiar. Experimenta a pesquisa na página inicial.
        </p>
      </main>
    );
  }

  const histMin = product.historicalMin;
  const histMax = product.historicalMax;
  const storeCount = metrics?.storeCount ?? product.offers.length;
  const spanDays = Math.max(1, historySpanDays(product.history));
  const observations = Math.max(
    product.history.length,
    metrics?.samples90d ?? 0,
    metrics?.samples30d ?? 0,
  );

  const avgObserved = metrics?.avg30d ?? product.avg30d;
  const currentIsMin = isAbsoluteHistoricalMin(
    product.currentPrice,
    product.historicalMin,
  );
  const aboveAvg = product.currentPrice > avgObserved;

  const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedOffers[0] ?? null;
  const bestStore = bestOffer?.storeName || bestOffer?.store || null;
  const bestStoreLabel = bestStore
    ? storeDisplayName(bestStore, bestStore)
    : null;

  const verdict = buildVerdictCopy({
    spanDays,
    storeCount,
    aboveAvg,
    currentIsMin,
    confidenceScore: confidence.score,
    bestStoreLabel,
  });

  const similar = pickSimilarAlternatives(
    product,
    recommendationsFromApi(product.recommendations),
    6,
  );

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

  if (isP34ProductPageEnabled()) {
    return (
      <ProductPageP34
        product={product}
        slug={slug}
        breadcrumbs={breadcrumbs}
        verdict={verdict}
        confidence={confidence}
        spanDays={spanDays}
        storeCount={storeCount}
        observations={observations}
        histMin={histMin}
        histMax={histMax}
        similar={similar}
      />
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:space-y-12 sm:px-6 sm:py-10">
      <ProductJsonLd product={product} />
      <ProductBreadcrumb crumbs={breadcrumbs} />

      <ProductHero product={product} />

      {/* Veredicto Lymiar */}
      <section
        id="porque"
        aria-label="Veredicto Lymiar"
        className="scroll-mt-28 space-y-3"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          {verdict.title}
        </h2>
        <div className="max-w-2xl space-y-2 text-[15px] leading-relaxed text-slate-600">
          {verdict.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      {/* Confiança */}
      <section
        aria-label="Confiança dos dados"
        className="max-w-md rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm"
      >
        <p className="text-sm font-semibold text-slate-800">
          Confiança dos dados
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <Stars stars={confidence.stars} />
          <span className="font-display text-2xl font-bold tabular-nums text-slate-900">
            {confidence.score}%
          </span>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Baseado em
        </p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>· {spanDays} dias observados</li>
          <li>· {storeCount} lojas</li>
          <li>· {observations} alterações de preço</li>
        </ul>
      </section>

      {/* Histórico */}
      <section id="historico" className="scroll-mt-28 space-y-4">
        <PriceHistoryChart
          productId={slug}
          currentPrice={product.currentPrice}
          fallbackHistory={product.history}
          fallbackMin={histMin}
          fallbackMax={histMax}
        />
      </section>

      {/* Onde comprar */}
      {product.offers?.length ? (
        <section id="lojas" className="scroll-mt-28 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Onde comprar
          </h2>
          <StoreCompareTable offers={product.offers} />
        </section>
      ) : null}

      {/* Alternativas */}
      {similar.length ? (
        <section id="alternativas" className="scroll-mt-20 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Alternativas semelhantes
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <li key={`alt-${p.slug}`}>
                <Link
                  href={`/p/?id=${encodeURIComponent(p.slug)}`}
                  className="flex h-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-slate-300"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-12 w-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
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
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
