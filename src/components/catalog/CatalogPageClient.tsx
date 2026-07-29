"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDealsNow,
  getDealsWait,
  searchProducts,
  summaryToProduct,
  type SearchSortBy,
} from "@/lib/api";
import type { Product, ProductCondition } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

export type CatalogSection = "deals" | "overpriced" | "drops" | "";

type ConditionMode = "new" | "all";

type CatalogSort = "discount_desc" | "limiar_desc" | "price_asc";

const SORT_OPTIONS: { value: CatalogSort; label: string; api?: SearchSortBy }[] = [
  { value: "discount_desc", label: "Maior Desconto", api: "discount_desc" },
  { value: "limiar_desc", label: "Score Limiar", api: "limiar_desc" },
  { value: "price_asc", label: "Menor Preço", api: "price_asc" },
];

const CATEGORY_PILLS: {
  id: string;
  label: string;
  /** Query enviada à API /search quando selecionada. */
  searchQ?: string;
  /** Keywords para filtragem client-side sobre deals. */
  keywords?: string[];
}[] = [
  { id: "", label: "Todos" },
  {
    id: "gaming",
    label: "Gaming",
    searchQ: "gaming",
    keywords: ["gaming", "rtx", "radeon", "console", "playstation", "xbox", "nintendo", "gpu"],
  },
  {
    id: "eletrodomesticos",
    label: "Eletrodomésticos",
    searchQ: "eletrodomésticos",
    keywords: ["air fryer", "aspirador", "máquina", "frigorífico", "lavar", "microondas"],
  },
  {
    id: "audio",
    label: "Áudio & Imagem",
    searchQ: "auscultadores",
    keywords: ["auscultador", "headphone", "earbuds", "monitor", "tv ", "soundbar", "colunas"],
  },
  {
    id: "informatica",
    label: "Informática",
    searchQ: "informática",
    keywords: ["ssd", "nvme", "cpu", "ram", "portátil", "laptop", "motherboard", "processador"],
  },
];

const SECTION_META: Record<
  Exclude<CatalogSection, "">,
  { title: string; subtitle: string }
> = {
  deals: {
    title: "🔥 Super Oportunidades",
    subtitle: "Produtos em mínimo histórico e melhores preços do momento.",
  },
  overpriced: {
    title: "⏳ Vale a Pena Esperar",
    subtitle: "Produtos atualmente acima do valor habitual de mercado.",
  },
  drops: {
    title: "📉 Maiores Quedas",
    subtitle: "Maiores descidas de preço face a ontem.",
  },
};

function dedupeByEan(products: Product[]): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of products) {
    if (seen.has(p.ean)) continue;
    seen.add(p.ean);
    out.push(p);
  }
  return out;
}

function matchesCategory(product: Product, categoryId: string): boolean {
  if (!categoryId) return true;
  const pill = CATEGORY_PILLS.find((c) => c.id === categoryId);
  if (!pill?.keywords?.length) return true;
  const hay = `${product.name} ${product.category} ${product.brand ?? ""}`.toLowerCase();
  return pill.keywords.some((kw) => hay.includes(kw.toLowerCase()));
}

function matchesCondition(product: Product, mode: ConditionMode): boolean {
  if (mode === "all") return true;
  const c = (product.condition ?? "NEW") as ProductCondition;
  return c === "NEW";
}

function matchesQuery(product: Product, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  return (
    product.name.toLowerCase().includes(term) ||
    product.ean.includes(term) ||
    (product.brand ?? "").toLowerCase().includes(term)
  );
}

function sortProducts(products: Product[], sort: CatalogSort): Product[] {
  const copy = [...products];
  if (sort === "price_asc") {
    copy.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (sort === "discount_desc") {
    copy.sort(
      (a, b) =>
        (b.decision.discountPct || b.dropTodayPct || 0) -
        (a.decision.discountPct || a.dropTodayPct || 0),
    );
  } else {
    copy.sort(
      (a, b) => b.decision.limiarIndex.value - a.decision.limiarIndex.value,
    );
  }
  return copy;
}

function readCatalogState(params: URLSearchParams) {
  const sectionRaw = (params.get("section") || "").trim().toLowerCase();
  const section: CatalogSection =
    sectionRaw === "deals" || sectionRaw === "overpriced" || sectionRaw === "drops"
      ? sectionRaw
      : "";
  const category = params.get("category") || "";
  const condition: ConditionMode =
    params.get("condition") === "all" ? "all" : "new";
  const sortRaw = (params.get("sort") || "limiar_desc") as CatalogSort;
  const sort = SORT_OPTIONS.some((o) => o.value === sortRaw)
    ? sortRaw
    : "limiar_desc";
  const q = (params.get("q") || "").trim();
  const page = Math.max(1, Number(params.get("page") || "1") || 1);
  return { section, category, condition, sort, q, page };
}

export function CatalogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useMemo(() => readCatalogState(searchParams), [searchParams]);

  const [pool, setPool] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchTotal, setSearchTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryDraft, setQueryDraft] = useState(state.q);

  useEffect(() => {
    setQueryDraft(state.q);
  }, [state.q]);

  const pushState = useCallback(
    (patch: Partial<ReturnType<typeof readCatalogState>>) => {
      const next = { ...state, ...patch, page: patch.page ?? 1 };
      const params = new URLSearchParams();
      if (next.section) params.set("section", next.section);
      if (next.category) params.set("category", next.category);
      if (next.condition === "all") params.set("condition", "all");
      if (next.sort && next.sort !== "limiar_desc") params.set("sort", next.sort);
      if (next.q) params.set("q", next.q);
      if (next.page > 1) params.set("page", String(next.page));
      const qs = params.toString();
      router.push(qs ? `/catalog/?${qs}` : "/catalog/");
    },
    [router, state],
  );

  // Debounce search box → URL (não depende de pushState para evitar loops)
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = queryDraft.trim();
      if (trimmed === state.q) return;
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `/catalog/?${qs}` : "/catalog/");
    }, 350);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao draft
  }, [queryDraft]);

  const pill = CATEGORY_PILLS.find((c) => c.id === state.category);
  const useApiSearch =
    !state.section && (state.q.length >= 2 || Boolean(pill?.searchQ));

  // Secções deals / catálogo base (pool local)
  useEffect(() => {
    if (useApiSearch) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setSearchTotal(0);

    (async () => {
      try {
        if (state.section === "deals") {
          const res = await getDealsNow(50);
          if (cancelled) return;
          setPool(res.results.map(summaryToProduct));
        } else if (state.section === "overpriced") {
          const res = await getDealsWait(50);
          if (cancelled) return;
          setPool(res.results.map(summaryToProduct));
        } else if (state.section === "drops") {
          const [nowRes, waitRes] = await Promise.all([
            getDealsNow(50),
            getDealsWait(50),
          ]);
          if (cancelled) return;
          setPool(
            dedupeByEan([
              ...nowRes.results.map(summaryToProduct),
              ...waitRes.results.map(summaryToProduct),
            ])
              .filter((p) => (p.dropTodayPct ?? 0) > 0)
              .sort((a, b) => (b.dropTodayPct ?? 0) - (a.dropTodayPct ?? 0)),
          );
        } else {
          const [nowRes, waitRes] = await Promise.all([
            getDealsNow(50),
            getDealsWait(50),
          ]);
          if (cancelled) return;
          setPool(
            dedupeByEan([
              ...nowRes.results.map(summaryToProduct),
              ...waitRes.results.map(summaryToProduct),
            ]),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar catálogo");
          setPool([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.section, useApiSearch]);

  // Pesquisa API (query ou pill de categoria, fora das secções deals)
  useEffect(() => {
    if (!useApiSearch) return;

    const q = state.q.length >= 2 ? state.q : (pill?.searchQ as string);
    let cancelled = false;
    setLoading(true);
    setError(null);
    const offset = (state.page - 1) * PAGE_SIZE;
    const sortOpt = SORT_OPTIONS.find((o) => o.value === state.sort);

    searchProducts(q, {
      limit: PAGE_SIZE,
      offset,
      sortBy: sortOpt?.api || "limiar_desc",
    })
      .then((res) => {
        if (cancelled) return;
        let products = res.results.map(summaryToProduct);
        products = products.filter((p) => matchesCondition(p, state.condition));
        if (state.category && state.q.length >= 2) {
          products = products.filter((p) => matchesCategory(p, state.category));
        }
        setSearchResults(products);
        setSearchTotal(res.total);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha na pesquisa");
          setSearchResults([]);
          setSearchTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    useApiSearch,
    state.q,
    state.category,
    state.sort,
    state.page,
    state.condition,
    pill?.searchQ,
  ]);

  const filteredPool = useMemo(() => {
    let list = pool.filter(
      (p) =>
        matchesCondition(p, state.condition) &&
        matchesCategory(p, state.category) &&
        matchesQuery(p, state.q),
    );
    list = sortProducts(list, state.sort);
    return list;
  }, [pool, state.condition, state.category, state.q, state.sort]);

  const usingApiSearch = searchResults !== null && !state.section;
  const total = usingApiSearch ? searchTotal : filteredPool.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(state.page, totalPages);

  const pageItems = useMemo(() => {
    if (usingApiSearch) return searchResults || [];
    const start = (page - 1) * PAGE_SIZE;
    return filteredPool.slice(start, start + PAGE_SIZE);
  }, [usingApiSearch, searchResults, filteredPool, page]);

  const shownFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const shownTo = Math.min(page * PAGE_SIZE, total);

  const meta = state.section
    ? SECTION_META[state.section]
    : {
        title: "Catálogo Limiar",
        subtitle: "Explora oportunidades com filtros por categoria, condição e preço.",
      };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          {meta.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={queryDraft}
          onChange={(e) => setQueryDraft(e.target.value)}
          placeholder="Filtrar por título ou EAN…"
          className="h-12 rounded-xl pl-10"
          aria-label="Filtrar catálogo"
        />
      </div>

      {/* Category pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_PILLS.map((pill) => {
          const active = state.category === pill.id;
          return (
            <button
              key={pill.id || "all"}
              type="button"
              onClick={() => pushState({ category: pill.id, page: 1 })}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Condition + sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => pushState({ condition: "new", page: 1 })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              state.condition === "new"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            Apenas Novos
          </button>
          <button
            type="button"
            onClick={() => pushState({ condition: "all", page: 1 })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              state.condition === "all"
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            Incluir Outlet/Caixa Aberta
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="shrink-0">Ordenar</span>
          <select
            value={state.sort}
            onChange={(e) =>
              pushState({ sort: e.target.value as CatalogSort, page: 1 })
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Count */}
      <p className="mb-5 text-sm text-slate-500">
        {loading
          ? "A carregar produtos…"
          : total === 0
            ? "Nenhum produto encontrado com estes filtros."
            : `A mostrar ${shownFrom}–${shownTo} de ${total} produto${total === 1 ? "" : "s"}`}
      </p>

      {error ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100"
            />
          ))}
        </div>
      ) : pageItems.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((product) => (
            <OpportunityCard
              key={product.ean}
              product={product}
              showDropToday={state.section === "drops"}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Sem resultados. Ajusta os filtros ou experimenta outra pesquisa.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => pushState({ page: page - 1 })}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-600">
            Página {page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => pushState({ page: page + 1 })}
          >
            Seguinte
          </Button>
        </div>
      ) : null}
    </main>
  );
}
