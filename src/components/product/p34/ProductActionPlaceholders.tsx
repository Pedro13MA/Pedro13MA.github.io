"use client";

import { TELEGRAM_CHANNEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Botões preparados para fases futuras — sem implementação falsa de alerta. */
export function ProductActionPlaceholders({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 sm:max-w-md",
        className,
      )}
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
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5",
        className,
      )}
      aria-label="Telegram Lymiar"
    >
      <p className="text-sm font-semibold text-slate-800">Telegram</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        Recebe oportunidades seleccionadas no canal Lymiar — sem misturar com o
        preço desta página.
      </p>
      <a
        href={TELEGRAM_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
      >
        Abrir canal Telegram
      </a>
    </aside>
  );
}
