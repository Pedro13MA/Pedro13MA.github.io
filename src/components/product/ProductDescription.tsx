"use client";

import { buildAutoDescription } from "@/lib/product-content";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductDescription({ product }: Props) {
  const { summary, features } = buildAutoDescription(product);
  if (!summary) return null;

  return (
    <section id="descricao" className="scroll-mt-20 space-y-3">
      <h2 className="font-display text-xl font-bold text-slate-900">Descrição</h2>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          {summary}
        </p>
        {features.length ? (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="text-sm text-slate-700">
                · {f}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
