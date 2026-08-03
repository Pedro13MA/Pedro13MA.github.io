"use client";

import type { CategoryFaqItem } from "@/lib/api";

type Props = {
  items: CategoryFaqItem[];
  title?: string;
};

/**
 * FASE 7.6 — FAQ automática institucional (substituível por editorial).
 */
export function CategoryFAQ({
  items,
  title = "Perguntas frequentes",
}: Props) {
  if (!items?.length) return null;

  return (
    <section className="mt-10 space-y-4" aria-labelledby="category-faq-heading">
      <h2
        id="category-faq-heading"
        className="font-display text-xl font-semibold text-slate-900"
      >
        {title}
      </h2>
      <div className="space-y-3">
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
