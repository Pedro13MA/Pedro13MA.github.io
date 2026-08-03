"use client";

import type { CatalogChip } from "@/lib/catalog-ui";

type Props = {
  chips: CatalogChip[];
  onClearAll: () => void;
};

export function CatalogActiveChips({ chips, onClearAll }: Props) {
  if (!chips.length) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="catalog-active-chips"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <span>{chip.label}</span>
          <span className="text-slate-400" aria-hidden>
            ×
          </span>
          <span className="sr-only">Remover {chip.label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-sky-700 hover:underline"
      >
        Limpar filtros
      </button>
    </div>
  );
}
