"use client";

import { buildAutoDescription } from "@/lib/product-content";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductDescription({ product }: Props) {
  const { summary, features, benefits } = buildAutoDescription(product);

  return (
    <section id="descricao" className="scroll-mt-20 space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">Descrição</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Resumo institucional a partir dos dados de catálogo — sem inventar specs.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm leading-relaxed text-slate-700">{summary}</p>

        {features.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Principais características
            </h3>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="text-sm text-slate-700">
                  · {f}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {benefits.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Benefícios Limiar
            </h3>
            <ul className="mt-2 space-y-1.5">
              {benefits.map((b) => (
                <li key={b} className="text-sm text-slate-700">
                  · {b}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
