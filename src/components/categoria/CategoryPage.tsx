"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/categoria/Breadcrumbs";
import { CategoryFAQ } from "@/components/categoria/CategoryFAQ";
import { CategorySEO } from "@/components/categoria/CategorySEO";
import { CategorySidebar } from "@/components/categoria/CategorySidebar";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { FilterSidebar, type FilterValues } from "@/components/search/FilterSidebar";
import { Button } from "@/components/ui/button";
import {
  getCategory,
  getCategoryProducts,
  summaryToProduct,
  type CategoryDetail,
  type CategoryFaqItem,
  type SearchFacets,
  type SearchSortBy,
  type TaxonomyFacet,
} from "@/lib/api";
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

const EMPTY_FACETS: SearchFacets = {
  categories: [],
  subcategories: [],
  brands: [],
  stores: [],
  types: [],
};

type Props = {
  slug: string;
  initialCategory?: CategoryDetail | null;
};

export function CategoryPage({ slug, initialCategory = null }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const sortBy = (searchParams.get("sort_by") || "limiar_desc") as SearchSortBy;
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const taxonomySelection = useMemo(
    () => selectionFromSearchParams(searchParams),
    [searchParams],
  );

  const [category, setCategory] = useState<CategoryDetail | null>(initialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<SearchFacets>(EMPTY_FACETS);
  const [taxonomyFacets, setTaxonomyFacets] = useState<TaxonomyFacet[]>([]);
  const [faq, setFaq] = useState<CategoryFaqItem[]>(initialCategory?.faq || []);
  const [jsonLd, setJsonLd] = useState<Record<string, unknown>[]>(
    initialCategory?.json_ld || [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minDraft, setMinDraft] = useState("");
  const [maxDraft, setMaxDraft] = useState("");

  const filters: FilterValues = useMemo(
    () => ({
      category: "",
      subcategory: "",
      brand: searchParams.get("brand") || "",
      store: searchParams.get("store") || "",
      type: "",
      model: "",
      vram: "",
      series: "",
      socket: "",
      capacity: "",
      format: "",
      minPrice: searchParams.get("min_price") || searchParams.get("price_min") || "",
      maxPrice: searchParams.get("max_price") || searchParams.get("price_max") || "",
      inStockOnly: false,
    }),
    [searchParams],
  );

  const buildUrl = useCallback(
    (
      patch: {
        q?: string;
        sortBy?: SearchSortBy;
        page?: number;
        minPrice?: string;
        maxPrice?: string;
      },
      selection: TaxonomySelection = taxonomySelection,
    ) => {
      const params = new URLSearchParams();
      const query = patch.q !== undefined ? patch.q.trim() : q;
      if (query) params.set("q", query);
      const sort = patch.sortBy ?? sortBy;
      if (sort && sort !== "limiar_desc") params.set("sort_by", sort);
      const nextPage = patch.page ?? page;
      if (nextPage > 1) params.set("page", String(nextPage));
      const minP = patch.minPrice ?? filters.minPrice;
      const maxP = patch.maxPrice ?? filters.maxPrice;
      if (!selection.price_min?.length && minP) params.set("min_price", minP);
      if (!selection.price_max?.length && maxP) params.set("max_price", maxP);
      appendSelectionToParams(params, selection);
      if (!selection.brand?.length && filters.brand) {
        params.append("brand", filters.brand);
      }
      if (!selection.store?.length && filters.store) {
        params.append("store", filters.store);
      }
      const qs = params.toString();
      return `/categoria/${slug}/${qs ? `?${qs}` : ""}`;
    },
    [filters.brand, filters.maxPrice, filters.minPrice, filters.store, page, q, slug, sortBy, taxonomySelection],
  );

  useEffect(() => {
    let cancelled = false;
    if (!initialCategory) {
      getCategory(slug)
        .then((c) => {
          if (!cancelled) {
            setCategory(c);
            setFaq(c.faq || []);
            setJsonLd(c.json_ld || []);
          }
        })
        .catch(() => {
          if (!cancelled) setCategory(null);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [slug, initialCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const offset = (page - 1) * PAGE_SIZE;
    const tax = taxonomySelection;
    getCategoryProducts(slug, {
      q: q || undefined,
      limit: PAGE_SIZE,
      offset,
      sortBy: SORT_OPTIONS.some((o) => o.value === sortBy) ? sortBy : "limiar_desc",
      taxonomyFilters: countSelected(tax) > 0 ? tax : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.results.map(summaryToProduct));
        setTotal(res.total);
        setFacets(res.facets || EMPTY_FACETS);
        setTaxonomyFacets(res.taxonomyFacets ?? []);
        setCategory((prev) =>
          prev
            ? prev
            : {
                slug: res.slug,
                display_name: res.display_name,
                level: res.level,
                is_active: true,
                taxonomy_path: res.breadcrumbs.map((b) => b.slug),
                breadcrumbs: res.breadcrumbs,
                children: [],
                seo: res.seo,
              },
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha a carregar categoria");
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
  }, [slug, q, page, sortBy, taxonomySelection]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!category && !loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Categoria não encontrada
        </h1>
        <p className="mt-3 text-slate-500">
          Esta categoria não existe ou está reservada.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={category?.breadcrumbs || []} className="mb-4" />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {category?.display_name || "…"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {loading
              ? "A carregar…"
              : `${total} produto${total === 1 ? "" : "s"}`}
            {q ? (
              <span className="ml-1">
                · filtro “{q}”
              </span>
            ) : null}
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Ordenar por
          <select
            value={sortBy}
            onChange={(e) =>
              router.push(
                buildUrl({ sortBy: e.target.value as SearchSortBy, page: 1 }),
              )
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

      {category?.seo ? (
        <div className="mb-8">
          <CategorySEO
            seo={category.seo}
            jsonLd={jsonLd.length ? jsonLd : category.json_ld}
            description={category.seo.meta_description || category.seo.description}
            updatedHint={category.updated_hint}
            productCount={loading ? null : total}
          />
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="space-y-6">
          {category ? <CategorySidebar category={category} /> : null}
          <FilterSidebar
            facets={facets}
            taxonomyFacets={taxonomyFacets}
            taxonomySelection={taxonomySelection}
            onTaxonomySelectionChange={(next) =>
              router.push(buildUrl({ page: 1 }, next))
            }
            filters={filters}
            minDraft={minDraft}
            maxDraft={maxDraft}
            onMinDraft={setMinDraft}
            onMaxDraft={setMaxDraft}
            onSelect={(patch) => {
              const nextSel = { ...taxonomySelection };
              if (patch.brand !== undefined) {
                if (patch.brand) nextSel.brand = [patch.brand];
                else delete nextSel.brand;
              }
              if (patch.store !== undefined) {
                if (patch.store) nextSel.store = [patch.store];
                else delete nextSel.store;
              }
              router.push(
                buildUrl(
                  {
                    page: 1,
                    minPrice: patch.minPrice ?? filters.minPrice,
                    maxPrice: patch.maxPrice ?? filters.maxPrice,
                  },
                  nextSel,
                ),
              );
            }}
            onClear={() =>
              router.push(
                buildUrl(
                  { page: 1, minPrice: "", maxPrice: "", q: "" },
                  clearTaxonomySelection(),
                ),
              )
            }
            onApplyPrice={() =>
              router.push(
                buildUrl({
                  page: 1,
                  minPrice: minDraft.trim(),
                  maxPrice: maxDraft.trim(),
                }),
              )
            }
          />
        </div>

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
                  <OpportunityCard key={product.ean} product={product} compact />
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => router.push(buildUrl({ page: page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-slate-500">
                    Página {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => router.push(buildUrl({ page: page + 1 }))}
                  >
                    Seguinte
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              Ainda não há produtos nesta categoria com os filtros actuais.
            </p>
          )}
        </section>
      </div>

      <CategoryFAQ items={faq.length ? faq : category?.faq || []} />
    </main>
  );
}
