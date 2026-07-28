"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FacetBucket, SearchFacets } from "@/lib/api";
import { cn } from "@/lib/utils";

const BRAND_PREVIEW = 5;

type FilterValues = {
  category: string;
  brand: string;
  store: string;
  type: string;
  minPrice: string;
  maxPrice: string;
};

type Props = {
  facets: SearchFacets;
  filters: FilterValues;
  minDraft: string;
  maxDraft: string;
  onMinDraft: (v: string) => void;
  onMaxDraft: (v: string) => void;
  onSelect: (patch: Partial<FilterValues>) => void;
  onClear: () => void;
  onApplyPrice: () => void;
};

function FacetList({
  title,
  items,
  active,
  onSelect,
  collapsible,
}: {
  title: string;
  items: FacetBucket[];
  active: string;
  onSelect: (value: string) => void;
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!items.length) return null;

  const visible =
    collapsible && !expanded && items.length > BRAND_PREVIEW
      ? items.slice(0, BRAND_PREVIEW)
      : items;
  const hiddenCount = Math.max(0, items.length - BRAND_PREVIEW);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <ul className="space-y-1">
        {visible.map((item) => {
          const selected = active.toLowerCase() === item.value.toLowerCase();
          return (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => onSelect(selected ? "" : item.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  selected
                    ? "bg-sky-50 font-medium text-sky-900"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span className="truncate">{item.label}</span>
                <span className="ml-2 shrink-0 text-xs text-slate-400">
                  {item.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {collapsible && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-sky-700 hover:underline"
        >
          {expanded ? "Ver menos" : `Ver mais (+${hiddenCount})`}
        </button>
      ) : null}
    </div>
  );
}

export function FilterSidebar({
  facets,
  filters,
  minDraft,
  maxDraft,
  onMinDraft,
  onMaxDraft,
  onSelect,
  onClear,
  onApplyPrice,
}: Props) {
  return (
    <aside
      className={cn(
        "limiar-sidebar space-y-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm",
        "lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:self-start",
        "lg:overflow-y-auto lg:overscroll-contain lg:pr-2",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-slate-900">Filtros</h2>
        <button
          type="button"
          className="text-xs text-sky-700 hover:underline"
          onClick={onClear}
        >
          Limpar
        </button>
      </div>

      <FacetList
        title="Capacidade / Tipo"
        items={facets.types}
        active={filters.type}
        onSelect={(value) => onSelect({ type: value })}
      />
      <FacetList
        title="Marca"
        items={facets.brands}
        active={filters.brand}
        onSelect={(value) => onSelect({ brand: value })}
        collapsible
      />
      <FacetList
        title="Loja"
        items={facets.stores}
        active={filters.store}
        onSelect={(value) => onSelect({ store: value })}
      />
      <FacetList
        title="Categoria"
        items={facets.categories}
        active={filters.category}
        onSelect={(value) => onSelect({ category: value })}
      />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Intervalo de preço (€)
        </p>
        <div className="flex gap-2">
          <Input
            inputMode="decimal"
            placeholder="Mín"
            value={minDraft}
            onChange={(e) => onMinDraft(e.target.value)}
            className="h-9"
          />
          <Input
            inputMode="decimal"
            placeholder="Máx"
            value={maxDraft}
            onChange={(e) => onMaxDraft(e.target.value)}
            className="h-9"
          />
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onApplyPrice}>
          Aplicar preço
        </Button>
      </div>
    </aside>
  );
}
