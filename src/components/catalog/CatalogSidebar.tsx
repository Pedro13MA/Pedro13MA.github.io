"use client";

import { CatalogCategoryTree } from "@/components/catalog/CatalogCategoryTree";
import { CatalogCollapsible } from "@/components/catalog/CatalogCollapsible";
import { CatalogConditionChecks } from "@/components/catalog/CatalogConditionChecks";
import { TaxonomyFilters } from "@/components/search/TaxonomyFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaxonomyFacet } from "@/lib/api";
import type { CatalogConditionId } from "@/lib/catalog-ui";
import {
  clearTaxonomySelection,
  countSelected,
  hasTaxonomyFacets,
  type TaxonomySelection,
} from "@/lib/taxonomy-facets";
import { cn } from "@/lib/utils";

type Props = {
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  conditions: CatalogConditionId[];
  onConditionsChange: (next: CatalogConditionId[]) => void;
  minDraft: string;
  maxDraft: string;
  onMinDraft: (v: string) => void;
  onMaxDraft: (v: string) => void;
  onApplyPrice: () => void;
  taxonomyFacets?: TaxonomyFacet[];
  taxonomySelection: TaxonomySelection;
  onTaxonomySelectionChange: (next: TaxonomySelection) => void;
  onClearAll: () => void;
  className?: string;
};

/**
 * Sidebar do Catálogo Lymiar v2 — categorias taxonomy + filtros + facets.
 */
export function CatalogSidebar({
  activeCategory,
  onSelectCategory,
  conditions,
  onConditionsChange,
  minDraft,
  maxDraft,
  onMinDraft,
  onMaxDraft,
  onApplyPrice,
  taxonomyFacets,
  taxonomySelection,
  onTaxonomySelectionChange,
  onClearAll,
  className,
}: Props) {
  const taxCount = countSelected(taxonomySelection);
  const hasFacets = hasTaxonomyFacets(taxonomyFacets);

  return (
    <aside
      className={cn(
        "lymiar-sidebar space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm",
        "lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:self-start",
        "lg:overflow-y-auto lg:overscroll-contain lg:pr-2",
        className,
      )}
      data-testid="catalog-sidebar"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-slate-900">
          Navegação
        </h2>
        <button
          type="button"
          className="text-xs text-sky-700 hover:underline"
          onClick={onClearAll}
        >
          Limpar
        </button>
      </div>

      <CatalogCollapsible id="categories" title="Categorias" defaultOpen>
        <CatalogCategoryTree
          activeSlug={activeCategory}
          onSelect={onSelectCategory}
        />
        {activeCategory ? (
          <button
            type="button"
            className="mt-1 text-xs text-sky-700 hover:underline"
            onClick={() => onSelectCategory("")}
          >
            Ver todas as categorias
          </button>
        ) : null}
      </CatalogCollapsible>

      <CatalogCollapsible
        id="condition"
        title="Estado"
        defaultOpen
        badge={conditions.length || null}
      >
        <CatalogConditionChecks
          selected={conditions}
          onChange={onConditionsChange}
        />
      </CatalogCollapsible>

      <CatalogCollapsible id="price" title="Preço" defaultOpen>
        <div className="flex gap-2">
          <Input
            inputMode="decimal"
            placeholder="Mín"
            value={minDraft}
            onChange={(e) => onMinDraft(e.target.value)}
            className="h-9"
            aria-label="Preço mínimo"
          />
          <Input
            inputMode="decimal"
            placeholder="Máx"
            value={maxDraft}
            onChange={(e) => onMaxDraft(e.target.value)}
            className="h-9"
            aria-label="Preço máximo"
          />
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onApplyPrice}>
          Aplicar preço
        </Button>
      </CatalogCollapsible>

      <CatalogCollapsible id="score" title="Score" defaultOpen={false}>
        <p className="text-xs leading-relaxed text-slate-500">
          Ordena os resultados por Índice Lymiar no selector «Ordenar» acima da
          grelha — sem alterar o algoritmo de score.
        </p>
      </CatalogCollapsible>

      <CatalogCollapsible id="history" title="Histórico" defaultOpen={false}>
        <p className="text-xs leading-relaxed text-slate-500">
          O histórico de preços está disponível em cada ficha de produto. Os
          filtros dinâmicos abaixo reflectem o conjunto actual de resultados.
        </p>
      </CatalogCollapsible>

      {hasFacets && taxonomyFacets ? (
        <CatalogCollapsible
          id="facets"
          title="Filtros dinâmicos"
          defaultOpen
          badge={taxCount || null}
        >
          <TaxonomyFilters
            facets={taxonomyFacets}
            selection={taxonomySelection}
            onChange={onTaxonomySelectionChange}
            onClearSelection={() =>
              onTaxonomySelectionChange(clearTaxonomySelection())
            }
          />
        </CatalogCollapsible>
      ) : (
        <p className="text-[11px] leading-relaxed text-slate-400">
          Facets dinâmicos (marca, VRAM, capacidade, …) aparecem quando há
          pesquisa ou categoria com resultados.
        </p>
      )}
    </aside>
  );
}
