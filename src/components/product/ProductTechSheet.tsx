"use client";

import { resolveProductKnowledge } from "@/lib/product-knowledge";
import type { Product } from "@/lib/types";

type Props = { product: Product };

/**
 * FASE 7.15 — Ficha Técnica agrupada (só grupos com dados).
 */
export function ProductTechSheet({ product }: Props) {
  const knowledge = resolveProductKnowledge(product);
  if (!knowledge?.groups.length) return null;

  return (
    <section id="ficha-tecnica" className="scroll-mt-20 space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Ficha Técnica
        </h2>
        {typeof knowledge.completeness === "number" ? (
          <p className="text-xs text-slate-400">
            Completude {knowledge.completeness}%
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        {knowledge.groups.map((group) => (
          <div key={group.id}>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              {group.label}
            </h3>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((row) => (
                <div
                  key={row.key}
                  className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
