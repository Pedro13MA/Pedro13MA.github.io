"use client";

import { TELEGRAM_CHANNEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Botões preparados para fases futuras — sem implementação falsa de alerta. */
export function ProductActionPlaceholders({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-wrap gap-2 sm:max-w-md", className)}
      role="group"
      aria-label="Acções futuras"
    >
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Comparador em breve"
        className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-400"
      >
        Comparar
        <span className="sr-only"> (em breve)</span>
      </button>
    </div>
  );
}

export function ProductTelegramStrip({ className }: { className?: string }) {
  return (
    <aside
      className={cn("pdp-telegram", className)}
      aria-label="Telegram Lymiar"
    >
      <p className="pdp-kicker">Canal</p>
      <h2 className="mt-2 font-display text-lg font-bold text-slate-900">
        Também no Telegram
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        O canal avisa promoções que o radar marca com mínimo histórico
        observado — de todas as categorias. Não substitui a decisão nesta
        página.
      </p>
      <a
        href={TELEGRAM_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex text-sm underline-offset-2 hover:underline"
      >
        Abrir canal →
      </a>
    </aside>
  );
}
