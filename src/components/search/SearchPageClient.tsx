"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchProducts,
  summaryToProduct,
  type FacetBucket,
  type SearchFacets,
  type SearchSortBy,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

const SORT_OPTIONS: { value: SearchSortBy; label: string }[] = [
  { value: "limiar_desc", label: "Melhor momento para comprar" },
  { value: "price_asc", label: "Preço mais baixo" },
  { value: "price_desc", label: "Preço mais alto" },
  { value: "discount_desc", label: "Maior Desconto" },
];

type Filters = {
  category: string;
  brand: string;
  store: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  sortBy: SearchSortBy;
  page: number;
};

function readFilters(params: URLSearchParams): Filters {
  const sort = (params.get("sort_by") || "limiar_desc") as SearchSortBy;
  return {
    category: params.get("category") || "",
    brand: params.get("brand") || "",
    store: params.get("store") || "",
    type: params.get("type") || "",
    minPrice: params.get("min_price") || "",
    maxPrice: params.get("max_price") || "",
    sortBy: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "limiar_desc",
    page: Math.max(1, Number(params.get("page") || "1") || 1),
  };
}

function FacetList({
  title,
  items,
  active,
  onSelect,
}: {
  title: string;
  items: FacetBucket[];
  active: string;
  onSelect: (value: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
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
    </div>
  );
}

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<SearchFacets>({
    categories: [],
    brands: [],
    stores: [],
    types: [],
  });
  const [inferred, setInferred] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minDraft, setMinDraft] = useState(filters.minPrice);
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice);

  useEffect(() => {
    setMinDraft(filters.minPrice);
    setMaxDraft(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const pushFilters = useCallback(
    (patch: Partial<Filters> & { q?: string }) => {
      const next: Filters = { ...filters, ...patch, page: patch.page ?? 1 };
      const params = new URLSearchParams();
      const query = (patch.q ?? q).trim();
      if (query) params.set("q", query);
      if (next.category) params.set("category", next.category);
      if (next.brand) params.set("brand", next.brand);
      if (next.store) params.set("store", next.store);
      if (next.type) params.set("type", next.type);
      if (next.minPrice) params.set("min_price", next.minPrice);
      if (next.maxPrice) params.set("max_price", next.maxPrice);
      if (next.sortBy && next.sortBy !== "limiar_desc") {
        params.set("sort_by", next.sortBy);
      }
      if (next.page > 1) params.set("page", String(next.page));
      router.push(`/search/?${params.toString()}`);
    },
    [filters, q, router],
  );

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setTotal(0);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const offset = (filters.page - 1) * PAGE_SIZE;
    searchProducts(q, {
      limit: PAGE_SIZE,
      offset,
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      store: filters.store || undefined,
      type: filters.type || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      sortBy: filters.sortBy,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.results.map(summaryToProduct));
        setTotal(res.total);
        setFacets(
          res.facets || { categories: [], brands: [], stores: [], types: [] },
        );
        setInferred(res.inferredCategory || null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha na pesquisa");
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, filters]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!q) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Pesquisa Limiar
        </h1>
        <p className="mt-3 text-slate-500">
          Escreve um termo (ex: SSD, RAM, GPU) e carrega Enter.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Resultados para “{q}”
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {loading
              ? "A carregar…"
              : `${total} produto${total === 1 ? "" : "s"} encontrados`}
            {inferred ? (
              <Badge variant="teal" className="ml-2">
                Categoria {inferred.toUpperCase()}
              </Badge>
            ) : null}
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Ordenar por
          <select
            value={filters.sortBy}
            onChange={(e) =>
              pushFilters({ sortBy: e.target.value as SearchSortBy })
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Filtros
            </h2>
            <button
              type="button"
              className="text-xs text-sky-700 hover:underline"
              onClick={() =>
                pushFilters({
                  category: "",
                  brand: "",
                  store: "",
                  type: "",
                  minPrice: "",
                  maxPrice: "",
                  page: 1,
                })
              }
            >
              Limpar
            </button>
          </div>

          <FacetList
            title="Capacidade / Tipo"
            items={facets.types}
            active={filters.type}
            onSelect={(value) => pushFilters({ type: value })}
          />
          <FacetList
            title="Marca"
            items={facets.brands}
            active={filters.brand}
            onSelect={(value) => pushFilters({ brand: value })}
          />
          <FacetList
            title="Loja"
            items={facets.stores}
            active={filters.store}
            onSelect={(value) => pushFilters({ store: value })}
          />
          <FacetList
            title="Categoria"
            items={facets.categories}
            active={filters.category}
            onSelect={(value) => pushFilters({ category: value })}
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
                onChange={(e) => setMinDraft(e.target.value)}
                className="h-9"
              />
              <Input
                inputMode="decimal"
                placeholder="Máx"
                value={maxDraft}
                onChange={(e) => setMaxDraft(e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                pushFilters({
                  minPrice: minDraft.trim(),
                  maxPrice: maxDraft.trim(),
                })
              }
            >
              Aplicar preço
            </Button>
          </div>
        </aside>

        <section>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100"
                />
              ))}
            </div>
          ) : products.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <OpportunityCard key={product.ean} product={product} />
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={filters.page <= 1}
                    onClick={() => pushFilters({ page: filters.page - 1 })}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-slate-500">
                    Página {filters.page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={filters.page >= totalPages}
                    onClick={() => pushFilters({ page: filters.page + 1 })}
                  >
                    Seguinte
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Sem produtos para estes filtros. Tenta limpar a sidebar ou outro
              termo.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
