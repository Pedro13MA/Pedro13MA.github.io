"use client";

import { BreadcrumbNav } from "@/components/nav/BreadcrumbNav";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";
import {
  ProductActionPlaceholders,
  ProductTelegramStrip,
} from "@/components/product/p34/ProductActionPlaceholders";
import {
  ProductCouponsSection,
  ProductHistoryHint,
  ProductStoresEmpty,
} from "@/components/product/p34/ProductCouponsSection";
import {
  ProductRelatedInterestSection,
  ProductSimilarSection,
} from "@/components/product/p34/ProductDiscoveryPlaceholders";
import type { DiscoveryCard } from "@/lib/product-discovery";
import type { BreadcrumbCrumb } from "@/lib/product-breadcrumb";
import type { Product } from "@/lib/types";
import { MIN_HISTORY_SPAN_DAYS } from "@/lib/product-insights";

type Verdict = { title: string; lines: string[] };

type Confidence = {
  stars: number;
  score: number;
};

type Props = {
  product: Product;
  slug: string;
  breadcrumbs: BreadcrumbCrumb[];
  verdict: Verdict;
  confidence: Confidence;
  spanDays: number;
  storeCount: number;
  observations: number;
  histMin: number;
  histMax: number;
  similar: DiscoveryCard[];
};

function Stars({ stars }: { stars: number }) {
  const s = Math.max(0, Math.min(5, Math.round(stars)));
  return (
    <span className="tracking-tight text-amber-500" aria-hidden>
      {"★".repeat(s)}
      <span className="text-slate-300">{"☆".repeat(Math.max(0, 5 - s))}</span>
    </span>
  );
}

/**
 * PDP P34 — mesma identidade visual, hierarquia e espaçamento melhorados.
 * Não altera gráfico interno, URLs, SEO nem contratos API.
 */
export function ProductPageP34({
  product,
  slug,
  breadcrumbs,
  verdict,
  confidence,
  spanDays,
  storeCount,
  observations,
  histMin,
  histMax,
  similar,
}: Props) {
  const thinHistory = spanDays < Math.min(14, MIN_HISTORY_SPAN_DAYS / 2);
  const navItems = breadcrumbs.map((c) => ({
    label: c.label,
    href: c.href,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-10">
      <ProductJsonLd product={product} />

      <BreadcrumbNav items={navItems} className="text-sm" />

      {/* Hierarquia: marca · título · preço · loja · CTA (ProductHero) */}
      <ProductHero product={product} />

      <ProductActionPlaceholders className="sm:pl-0" />

      {/* Veredicto */}
      <section
        id="porque"
        aria-labelledby="p34-verdict-heading"
        className="scroll-mt-28 space-y-3 border-t border-slate-100 pt-8"
      >
        <h2
          id="p34-verdict-heading"
          className="font-display text-2xl font-bold tracking-tight text-slate-900"
        >
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
        aria-labelledby="p34-confidence-heading"
        className="max-w-md rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm"
      >
        <h2
          id="p34-confidence-heading"
          className="text-sm font-semibold text-slate-800"
        >
          Confiança dos dados
        </h2>
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

      {/* Histórico — só espaçamento à volta; gráfico intacto */}
      <section
        id="historico"
        className="scroll-mt-28 space-y-4 border-t border-slate-100 pt-8"
        aria-labelledby="p34-history-heading"
      >
        <h2
          id="p34-history-heading"
          className="sr-only"
        >
          Histórico de preços
        </h2>
        <ProductHistoryHint thin={thinHistory} />
        <div className="pt-1">
          <PriceHistoryChart
            productId={slug}
            currentPrice={product.currentPrice}
            fallbackHistory={product.history}
            fallbackMin={histMin}
            fallbackMax={histMax}
          />
        </div>
      </section>

      {/* Cupões — nunca misturados com preço */}
      <ProductCouponsSection product={product} />

      {/* Lojas */}
      <section
        id="lojas"
        className="scroll-mt-28 space-y-4 border-t border-slate-100 pt-8"
        aria-labelledby="p34-stores-heading"
      >
        <h2
          id="p34-stores-heading"
          className="font-display text-xl font-bold text-slate-900"
        >
          Onde comprar
        </h2>
        {product.offers?.length ? (
          <StoreCompareTable offers={product.offers} />
        ) : (
          <ProductStoresEmpty />
        )}
      </section>

      <ProductTelegramStrip />

      <ProductSimilarSection products={similar} />
      <ProductRelatedInterestSection />
    </main>
  );
}
