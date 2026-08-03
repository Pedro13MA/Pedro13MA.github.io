"use client";

import { buildProductFaq } from "@/lib/product-content";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductFaq({ product }: Props) {
  const items = buildProductFaq(product);
  if (!items.length) return null;

  return (
    <section id="faq" className="scroll-mt-20 space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-900">
        Perguntas frequentes
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm open:shadow-md"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.question}
                <span className="text-slate-400 group-open:rotate-180">▾</span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
