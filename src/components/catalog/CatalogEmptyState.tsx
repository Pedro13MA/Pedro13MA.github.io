"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onClearFilters: () => void;
  onBackToCatalog: () => void;
};

export function CatalogEmptyState({
  onClearFilters,
  onBackToCatalog,
}: Props) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm"
      data-testid="catalog-empty-state"
    >
      <p className="font-display text-lg font-semibold text-slate-900">
        Nenhum produto encontrado.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Ajusta ou remove filtros para ver mais resultados no catálogo Lymiar.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" onClick={onClearFilters}>
          Remover filtros
        </Button>
        <Button type="button" onClick={onBackToCatalog}>
          Voltar ao catálogo
        </Button>
      </div>
    </div>
  );
}
