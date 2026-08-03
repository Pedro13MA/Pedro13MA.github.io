"use client";

import { memo, useMemo } from "react";
import type { TaxonomyFacet } from "@/lib/api";
import { TaxonomyFacetPanel } from "@/components/search/TaxonomyFacetPanel";
import {
  countSelected,
  prepareTaxonomyFacets,
  type TaxonomySelection,
} from "@/lib/taxonomy-facets";

type Props = {
  facets: TaxonomyFacet[];
  selection: TaxonomySelection;
  onChange: (next: TaxonomySelection) => void;
  onClearSelection: () => void;
};

/**
 * Painel dinâmico — taxonomyFacets da API.
 * FASE 7.4: selecção actualiza URL + pesquisa (deep-link).
 */
export const TaxonomyFilters = memo(function TaxonomyFilters({
  facets,
  selection,
  onChange,
  onClearSelection,
}: Props) {
  const prepared = useMemo(() => prepareTaxonomyFacets(facets), [facets]);
  const selectedTotal = useMemo(() => countSelected(selection), [selection]);

  if (!prepared.length) return null;

  return (
    <div className="space-y-5" data-testid="taxonomy-filters">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Filtros
          {selectedTotal > 0 ? (
            <span className="ml-1 text-sky-700">({selectedTotal})</span>
          ) : null}
        </p>
        {selectedTotal > 0 ? (
          <button
            type="button"
            className="text-[11px] text-sky-700 hover:underline"
            onClick={onClearSelection}
          >
            Limpar selecção
          </button>
        ) : null}
      </div>
      {prepared.map((facet) => (
        <TaxonomyFacetPanel
          key={facet.id}
          facet={facet}
          selection={selection}
          onChange={onChange}
        />
      ))}
    </div>
  );
});
