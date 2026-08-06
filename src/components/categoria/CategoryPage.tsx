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
import { WatchButton } from "@/components/watchlists/WatchButton";
import { EntityActivityTimeline } from "@/components/watchlists/EntityActivityTimeline";
import { CategoryFamilies } from "@/components/catalogo/CategoryFamilies";
import { baselineFromCategoryStats } from "@/lib/watchlists";
import {
  getCategory,
  getCategoryProducts,
  getCategoryStats,
  summaryToProduct,
  type CategoryDetail,
  type CategoryFaqItem,
  type MarketplaceCategoryStats,
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
import { relatedForSlug } from "@/lib/nav/build-menu";
import { EmptyCategory } from "@/components/nav/EmptyCategory";
import { CategoryRelated } from "@/components/nav/CategoryLayout";
import { useTaxonomyNavOptional } from "@/components/nav/TaxonomyTreeProvider";

const PAGE_SIZE = 24;

const SORT_OPTIONS: { value: SearchSortBy; label: string }[] = [
  { value: "lymiar_desc", label: "Melhor momento para comprar" },
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
  /** String estável — evita cancelar fetch em loop (mesmo padrão P3.2.2 Search). */
  const queryKey = searchParams.toString();
  const nav = useTaxonomyNavOptional();
  const related = useMemo(
    () => (nav?.tree?.length ? relatedForSlug(nav.tree, slug) : []),
    [nav?.tree, slug],
  );
  const q = (new URLSearchParams(queryKey).get("q") || "").trim();
  const sortBy = (new URLSearchParams(queryKey).get("sort_by") ||
    "lymiar_desc") as SearchSortBy;
  const page = Math.max(
    1,
    Number(new URLSearchParams(queryKey).get("page") || "1") || 1,
  );
  const taxonomySelection = useMemo(
    () => selectionFromSearchParams(new URLSearchParams(queryKey)),
    [queryKey],
  );
  const taxonomyKey = useMemo(
    () => JSON.stringify(taxonomySelection),
    [taxonomySelection],
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
  const [stats, setStats] = useState<MarketplaceCategoryStats | null>(null);

  const filters: FilterValues = useMemo(() => {
    const sp = new URLSearchParams(queryKey);
    return {
      category: "",
      subcategory: "",
      brand: sp.get("brand") || "",
      store: sp.get("store") || "",
      type: "",
      model: "",
      vram: "",
      series: "",
      socket: "",
      capacity: "",
      format: "",
      minPrice: sp.get("min_price") || sp.get("price_min") || "",
      maxPrice: sp.get("max_price") || sp.get("price_max") || "",
      inStockOnly: false,
    };
  }, [queryKey]);

  useEffect(() => {
    setMinDraft(filters.minPrice);
    setMaxDraft(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

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
      if (sort && sort !== "lymiar_desc") params.set("sort_by", sort);
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
    getCategoryStats(slug)
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
      sortBy: SORT_OPTIONS.some((o) => o.value === sortBy) ? sortBy : "lymiar_desc",
      taxonomyFilters: countSelected(tax) > 0 ? tax : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        const mapped: Product[] = [];
        for (const row of res.results) {
          try {
            mapped.push(summaryToProduct(row));
          } catch {
            /* skip malformed card — não derrubar a grelha */
          }
        }
        setProducts(mapped);
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
  }, [slug, q, page, sortBy, taxonomyKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const recommended = useMemo(
    () =>
      products
        .filter((p) => p.decision.lymiarIndex.value >= 70)
        .slice(0, 4),
    [products],
  );
  const recommendedKeys = useMemo(
    () => new Set(recommended.map((p) => p.ean || p.slug)),
    [recommended],
  );
  const gridProducts = useMemo(
    () => products.filter((p) => !recommendedKeys.has(p.ean || p.slug)),
    [products, recommendedKeys],
  );

  if (!category && !loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-[var(--hm-ink)]">
          Categoria não encontrada
        </h1>
        <p className="mt-3 text-[var(--hm-muted)]">
          Esta categoria não existe ou está reservada.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:max-w-7xl">
      <Breadcrumbs items={category?.breadcrumbs || []} className="mb-5" />

      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="catalog-kicker">Categoria</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--hm-ink)] sm:text-4xl">
            {category?.display_name || (loading ? "A carregar" : "Categoria")}
          </h1>
          <p className="text-sm text-[var(--hm-muted)]">
            {loading
              ? "A carregar…"
              : `${total} produto${total === 1 ? "" : "s"}`}
            {q ? <span className="ml-1">· filtro «{q}»</span> : null}
          </p>
          {category?.seo ? (
            <CategorySEO
              seo={category.seo}
              jsonLd={jsonLd.length ? jsonLd : category.json_ld}
              description={
                category.seo.meta_description || category.seo.description
              }
              updatedHint={category.updated_hint}
              productCount={loading ? null : total}
              compact
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {category ? (
            <WatchButton
              kind="CATEGORY"
              target={{
                key: slug,
                label: category.display_name,
                href: `/categoria/${encodeURIComponent(slug)}/`,
              }}
              baseline={stats ? baselineFromCategoryStats(stats) : null}
            />
          ) : null}
          <label className="flex flex-col gap-1 text-sm text-[var(--hm-muted)]">
            Ordenar por
            <select
              value={sortBy}
              onChange={(e) =>
                router.push(
                  buildUrl({ sortBy: e.target.value as SearchSortBy, page: 1 }),
                )
              }
              className="catalog-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {error ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {stats ? (
        <dl className="catalog-stat-strip mb-6">
          <div>
            <dt>Produtos</dt>
            <dd>{stats.products}</dd>
          </div>
          <div>
            <dt>Marcas</dt>
            <dd>{stats.brands}</dd>
          </div>
          <div>
            <dt>Lojas</dt>
            <dd>{stats.stores}</dd>
          </div>
          <div>
            <dt>Preço médio</dt>
            <dd>
              {stats.avgPrice != null
                ? new Intl.NumberFormat("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  }).format(stats.avgPrice)
                : "—"}
            </dd>
          </div>
        </dl>
      ) : null}

      <details className="catalog-panel mb-8 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--hm-ink)]">
          Atividade observada nesta categoria
        </summary>
        <div className="mt-3 border-t border-[var(--hm-line)] pt-3">
          <EntityActivityTimeline kind="CATEGORY" targetKey={slug} />
        </div>
      </details>

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
            showInStock={false}
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
          <CategoryFamilies leafHint={slug} />
          {!loading && recommended.length ? (
            <div className="catalog-section mb-8 space-y-3">
              <p className="catalog-kicker">Decisão</p>
              <h2 className="font-display text-xl font-bold text-[var(--hm-ink)]">
                Melhor momento nesta categoria
              </h2>
              <p className="text-sm text-[var(--hm-muted)]">
                Produtos com sinal favorável observado nesta página — a listagem
                completa continua abaixo.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {recommended.map((product) => (
                  <OpportunityCard
                    key={`rec-${product.ean || product.slug}`}
                    product={product}
                    compact
                  />
                ))}
              </div>
            </div>
          ) : null}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl border border-[var(--hm-line)] bg-[var(--hm-bg-soft)]"
                />
              ))}
            </div>
          ) : products.length ? (
            <>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[var(--hm-ink)]">
                  Produtos
                </h2>
                <p className="text-sm text-[var(--hm-faint)]">
                  {total} observados
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {gridProducts.map((product) => (
                  <OpportunityCard
                    key={product.ean || product.slug}
                    product={product}
                    compact
                  />
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
                  <span className="text-sm text-[var(--hm-muted)]">
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
            <EmptyCategory
              title={category?.display_name || slug}
              parentHref={
                category?.parent
                  ? `/categoria/${category.parent}/`
                  : "/categorias/"
              }
              parentLabel={
                category?.parent ? "Ver categoria pai" : "Todas as categorias"
              }
              related={related}
            />
          )}
          {related.length ? <CategoryRelated items={related} /> : null}
        </section>
      </div>

      <CategoryFAQ items={faq.length ? faq : category?.faq || []} />
    </main>
  );
}
