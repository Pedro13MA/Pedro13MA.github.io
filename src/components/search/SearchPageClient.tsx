"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { FilterSidebar, type FilterValues } from "@/components/search/FilterSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  searchProducts,
  summaryToProduct,
  type CanonicalHighlight,
  type SearchFacets,
  type SearchSortBy,
  type TaxonomyFacet,
} from "@/lib/api";
import { formatEUR } from "@/lib/utils";
import {
  appendSelectionToParams,
  clearTaxonomySelection,
  countSelected,
  selectionFromSearchParams,
  type TaxonomySelection,
} from "@/lib/taxonomy-facets";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 24;

const SORT_OPTIONS: { value: SearchSortBy; label: string }[] = [
  { value: "limiar_desc", label: "Melhor momento para comprar" },
  { value: "price_asc", label: "Preço mais baixo" },
  { value: "price_desc", label: "Preço mais alto" },
  { value: "discount_desc", label: "Maior Desconto" },
];

const INFERRED_LABEL: Record<string, string> = {
  gpu: "Placas Gráficas",
  ssd: "Armazenamento",
  ram: "RAM / Memória",
  cpu: "Processadores / CPUs",
};

type Filters = FilterValues & {
  sortBy: SearchSortBy;
  page: number;
};

function readFilters(params: URLSearchParams): Filters {
  const sort = (params.get("sort_by") || "limiar_desc") as SearchSortBy;
  return {
    category: params.get("category") || "",
    subcategory: params.get("subcategory") || "",
    brand: params.get("brand") || "",
    store: params.get("store") || "",
    type: params.get("type") || "",
    model: params.get("model") || "",
    vram: params.get("vram") || "",
    series: params.get("series") || "",
    socket: params.get("socket") || "",
    capacity: params.get("capacity") || "",
    format: params.get("format") || "",
    minPrice: params.get("min_price") || params.get("price_min") || "",
    maxPrice: params.get("max_price") || params.get("price_max") || "",
    inStockOnly: params.get("in_stock") === "true",
    sortBy: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "limiar_desc",
    page: Math.max(1, Number(params.get("page") || "1") || 1),
  };
}

const EMPTY_FACETS: SearchFacets = {
  categories: [],
  subcategories: [],
  brands: [],
  stores: [],
  types: [],
  models: [],
  vram: [],
  series: [],
  sockets: [],
  capacities: [],
  formats: [],
  in_stock: [],
};

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  /** Deep-link: estado reconstruído da URL em cada navegação / refresh */
  const taxonomySelection = useMemo(
    () => selectionFromSearchParams(searchParams),
    [searchParams],
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<SearchFacets>(EMPTY_FACETS);
  const [taxonomyFacets, setTaxonomyFacets] = useState<TaxonomyFacet[]>([]);
  const [inferred, setInferred] = useState<string | null>(null);
  const [canonicalHighlight, setCanonicalHighlight] =
    useState<CanonicalHighlight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minDraft, setMinDraft] = useState(filters.minPrice);
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice);

  useEffect(() => {
    setMinDraft(filters.minPrice);
    setMaxDraft(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (!q) return;
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "search", { search_term: q });
    }
  }, [q]);

  const buildSearchUrl = useCallback(
    (
      patch: Partial<Filters> & { q?: string },
      selection: TaxonomySelection = taxonomySelection,
    ) => {
      const next: Filters = { ...filters, ...patch, page: patch.page ?? 1 };
      const params = new URLSearchParams();
      const query = (patch.q ?? q).trim();
      if (query) params.set("q", query);
      if (next.category) params.set("category", next.category);
      if (next.subcategory) params.set("subcategory", next.subcategory);
      if (next.type) params.set("type", next.type);
      if (next.model) params.set("model", next.model);
      if (next.vram) params.set("vram", next.vram);
      if (next.series) params.set("series", next.series);
      if (next.socket) params.set("socket", next.socket);
      if (next.capacity) params.set("capacity", next.capacity);
      if (next.format) params.set("format", next.format);
      // Preço legado só se não houver price_* taxonomy
      if (!selection.price_min?.length && next.minPrice) {
        params.set("min_price", next.minPrice);
      }
      if (!selection.price_max?.length && next.maxPrice) {
        params.set("max_price", next.maxPrice);
      }
      if (next.inStockOnly) params.set("in_stock", "true");
      if (next.sortBy && next.sortBy !== "limiar_desc") {
        params.set("sort_by", next.sortBy);
      }
      if (next.page > 1) params.set("page", String(next.page));
      appendSelectionToParams(params, selection);
      // Legado single brand/store (quando taxonomy UI não está a gerir esses keys)
      if (!selection.brand?.length && next.brand) {
        params.append("brand", next.brand);
      }
      if (!selection.store?.length && next.store) {
        params.append("store", next.store);
      }
      return `/search/?${params.toString()}`;
    },
    [filters, q, taxonomySelection],
  );

  const pushFilters = useCallback(
    (patch: Partial<Filters> & { q?: string }) => {
      router.push(buildSearchUrl(patch, taxonomySelection));
    },
    [buildSearchUrl, router, taxonomySelection],
  );

  const pushTaxonomySelection = useCallback(
    (nextSelection: TaxonomySelection) => {
      router.push(buildSearchUrl({ page: 1 }, nextSelection));
    },
    [buildSearchUrl, router],
  );

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setTotal(0);
      setError(null);
      setTaxonomyFacets([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const offset = (filters.page - 1) * PAGE_SIZE;
    const tax = taxonomySelection;
    searchProducts(q, {
      limit: PAGE_SIZE,
      offset,
      category: filters.category || undefined,
      // brand/store via taxonomyFilters (multi)
      type: filters.type || undefined,
      model: filters.model || undefined,
      vram: filters.vram || undefined,
      series: filters.series || undefined,
      socket: filters.socket || undefined,
      capacity: filters.capacity || undefined,
      format: filters.format || undefined,
      minPrice:
        !tax.price_min?.length && filters.minPrice
          ? Number(filters.minPrice)
          : undefined,
      maxPrice:
        !tax.price_max?.length && filters.maxPrice
          ? Number(filters.maxPrice)
          : undefined,
      sortBy: filters.sortBy,
      inStockOnly: filters.inStockOnly || undefined,
      subcategory: filters.subcategory || undefined,
      taxonomyFilters: countSelected(tax) > 0 ? tax : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.results.map(summaryToProduct));
        setTotal(res.total);
        setFacets(res.facets || EMPTY_FACETS);
        setTaxonomyFacets(res.taxonomyFacets ?? []);
        setInferred(res.inferredCategory || null);
        setCanonicalHighlight(res.canonicalHighlight ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha na pesquisa");
          setProducts([]);
          setTotal(0);
          setTaxonomyFacets([]);
          setCanonicalHighlight(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, filters, taxonomySelection]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!q) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Pesquisa Limiar
        </h1>
        <p className="mt-3 text-slate-500">
          Escreve um termo (ex: SSD, CPU AMD, placa gráfica) e carrega Enter.
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
                {INFERRED_LABEL[inferred] || inferred}
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

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <FilterSidebar
          facets={facets}
          taxonomyFacets={taxonomyFacets}
          taxonomySelection={taxonomySelection}
          onTaxonomySelectionChange={pushTaxonomySelection}
          filters={filters}
          inferredCategory={inferred}
          minDraft={minDraft}
          maxDraft={maxDraft}
          onMinDraft={setMinDraft}
          onMaxDraft={setMaxDraft}
          onSelect={(patch) => pushFilters(patch)}
          onClear={() => {
            router.push(
              buildSearchUrl(
                {
                  category: "",
                  subcategory: "",
                  brand: "",
                  store: "",
                  type: "",
                  model: "",
                  vram: "",
                  series: "",
                  socket: "",
                  capacity: "",
                  format: "",
                  minPrice: "",
                  maxPrice: "",
                  inStockOnly: false,
                  page: 1,
                },
                clearTaxonomySelection(),
              ),
            );
          }}
          onApplyPrice={() =>
            pushFilters({
              minPrice: minDraft.trim(),
              maxPrice: maxDraft.trim(),
            })
          }
        />

        <section>
          {canonicalHighlight ? (
            <Link
              href={
                canonicalHighlight.href ||
                `/catalogo/grupo/?id=${encodeURIComponent(canonicalHighlight.slug)}`
              }
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-5 py-4 hover:border-sky-300"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                  Produto canónico
                </p>
                <p className="font-display text-lg font-bold text-slate-900">
                  {canonicalHighlight.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {canonicalHighlight.variantCount} variantes
                  {canonicalHighlight.minPrice != null
                    ? ` · desde ${formatEUR(canonicalHighlight.minPrice)}`
                    : ""}
                </p>
              </div>
              <span className="text-sm font-semibold text-sky-800">
                Escolher variante →
              </span>
            </Link>
          ) : null}
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
                  <OpportunityCard key={product.ean} product={product} compact />
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
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm leading-relaxed text-slate-600">
              Não encontrámos produtos para esta pesquisa com os filtros actuais.
              Experimenta outro termo, limpa os filtros, ou volta mais tarde — ainda
              podemos não ter histórico suficiente para alguns produtos.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
