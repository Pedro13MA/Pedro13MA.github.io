"use client";

/**
 * FASE 7.19 — Atividade recente (produto) a partir do histórico observado.
 */

import { useMemo } from "react";
import type { Product } from "@/lib/types";
import {
  eventsFromProductHistory,
  formatEventDay,
} from "@/lib/watchlists";

type Props = { product: Product };

export function ProductActivityTimeline({ product }: Props) {
  const events = useMemo(
    () => eventsFromProductHistory(product, { limit: 10 }),
    [product],
  );

  if (!events.length) return null;

  return (
    <section id="atividade" className="scroll-mt-20 space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Atividade recente
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Alterações observadas no histórico — sem previsões.
        </p>
      </div>
      <ol className="relative space-y-0 border-l border-slate-200 pl-4">
        {events.map((e) => (
          <li key={e.id} className="relative pb-5 last:pb-0">
            <span
              className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-white"
              aria-hidden
            />
            <p className="text-xs font-medium text-slate-400">
              {formatEventDay(e.at)}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {e.title}
            </p>
            <p className="text-sm text-slate-500">{e.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
