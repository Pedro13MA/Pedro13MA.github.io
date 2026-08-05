"use client";

import Link from "next/link";
import type { DiscoveryCard } from "@/lib/product-discovery";
import { formatEUR } from "@/lib/utils";

type Props = {
  products: DiscoveryCard[];
};

/** Secção preparada para Bloco 5 — mostra dados actuais se existirem, senão placeholder. */
export function ProductSimilarSection({ products }: Props) {
  return (
    <section
      id="semelhantes"
      className="scroll-mt-20 space-y-4"
      aria-labelledby="p34-similar-heading"
    >
      <div>
        <h2
          id="p34-similar-heading"
          className="font-display text-xl font-bold text-slate-900"
        >
          Produtos semelhantes
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Alternativas próximas no catálogo. Recomendações inteligentes no Bloco 5.
        </p>
      </div>
      {products.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center"
          role="status"
        >
          <p className="text-sm text-slate-600">
            Ainda não temos semelhantes suficientes para este produto.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Esta secção será alimentada pelo motor de recomendações (Bloco 5).
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={`sim-${p.slug}`}>
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
      )}
    </section>
  );
}

/** Placeholder «Também pode interessar» — Bloco 5. */
export function ProductRelatedInterestSection() {
  return (
    <section
      id="tambem-interessar"
      className="scroll-mt-20 space-y-4"
      aria-labelledby="p34-related-heading"
    >
      <div>
        <h2
          id="p34-related-heading"
          className="font-display text-xl font-bold text-slate-900"
        >
          Também pode interessar
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Descoberta alargada — em preparação.
        </p>
      </div>
      <div
        className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center"
        role="status"
      >
        <p className="text-sm text-slate-600">
          Em breve: produtos relacionados por uso e categoria.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Placeholder para o Bloco 5 — sem recomendações nesta fase.
        </p>
      </div>
    </section>
  );
}
