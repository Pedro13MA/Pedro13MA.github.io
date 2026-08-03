"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchClientRecommendations,
  recommendationsFromApi,
  type DiscoveryCard,
  type ProductRecommendations,
} from "@/lib/product-discovery";
import type { Product } from "@/lib/types";
import { cn, formatEUR } from "@/lib/utils";

type Props = { product: Product };

function Carousel({
  title,
  items,
}: {
  title: string;
  items: DiscoveryCard[];
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <ul className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li
            key={`${title}-${item.slug}`}
            className="w-44 shrink-0 rounded-xl border border-slate-200 bg-white p-3"
          >
            <Link href={`/p/?id=${encodeURIComponent(item.slug)}`} className="block">
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name || ""}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                ) : null}
              </div>
              {item.badge ? (
                <span className="mt-2 inline-block rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">
                  {item.badge}
                </span>
              ) : null}
              <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-900">
                {item.name}
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
                {formatEUR(item.currentPrice)}
              </p>
              {item.deltaPrice != null && item.deltaPrice !== 0 ? (
                <p
                  className={cn(
                    "text-[11px]",
                    item.deltaPrice < 0 ? "text-emerald-700" : "text-slate-500",
                  )}
                >
                  {item.deltaPrice < 0
                    ? `Poupa ${formatEUR(Math.abs(item.deltaPrice))}`
                    : `+${formatEUR(item.deltaPrice)}`}
                  {item.deltaScore != null && item.deltaScore !== 0
                    ? ` · ${item.deltaScore > 0 ? "+" : ""}${item.deltaScore.toFixed(0)} Limiar`
                    : ""}
                </p>
              ) : null}
              {item.highlights?.length ? (
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {item.highlights.join(" · ")}
                </p>
              ) : null}
              <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                {item.reason}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * FASE 7.17 — Descobre também (lazy).
 */
export function ProductDiscoverySection({ product }: Props) {
  const initial = recommendationsFromApi(product.recommendations);
  const [recs, setRecs] = useState<ProductRecommendations | null>(initial);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    const fromProp = recommendationsFromApi(product.recommendations);
    if (fromProp) {
      setRecs(fromProp);
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchClientRecommendations(product)
      .then((r) => {
        if (!cancelled) {
          setRecs(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecs(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [product.slug, product.recommendations]);

  if (loading) {
    return (
      <section id="descobre" className="scroll-mt-20 space-y-2">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Descobre também
        </h2>
        <p className="text-sm text-slate-400">A carregar sugestões…</p>
      </section>
    );
  }

  if (!recs) return null;

  const blocks: Array<{ title: string; items: DiscoveryCard[] }> = [
    { title: "Melhor alternativa", items: recs.alternatives || [] },
    { title: "Upgrade", items: recs.upgrades || [] },
    { title: "Poupar dinheiro", items: recs.savings || [] },
    { title: "Semelhantes", items: recs.similar || [] },
    { title: "Também pesquisados", items: recs.alsoSearched || [] },
    { title: "Mais populares", items: recs.popular || [] },
    { title: "Recomendado Limiar", items: recs.recommended || [] },
  ].filter((b) => b.items.length > 0);

  if (!blocks.length) return null;

  return (
    <section id="descobre" className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Descobre também
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Alternativas e semelhantes com base nos dados observados — sem inventar.
        </p>
      </div>
      {blocks.map((b) => (
        <Carousel key={b.title} title={b.title} items={b.items} />
      ))}
    </section>
  );
}
