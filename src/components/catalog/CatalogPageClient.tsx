"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  ConditionFilterPills,
  matchesHomeCondition,
  type HomeConditionFilter,
} from "@/components/home/ConditionFilterPills";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDealsNow,
  getDealsWait,
  getTelegramDeals,
  searchProducts,
  summaryToProduct,
  type SearchSortBy,
} from "@/lib/api";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { cn, formatEUR } from "@/lib/utils";

const PAGE_SIZE = 24;

export type CatalogSection = "deals" | "overpriced" | "drops" | "telegram" | "";
type CatalogTab = "products" | "alerts";
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
  telegram: {
    title: "⚡ Últimas oportunidades detetadas",
    subtitle: "Produtos enviados automaticamente para o canal Telegram do Limiar.",
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

function matchesCondition(product: Product, mode: HomeConditionFilter): boolean {
  return matchesHomeCondition(product.condition, mode);
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
    sectionRaw === "deals" ||
    sectionRaw === "overpriced" ||
    sectionRaw === "drops" ||
    sectionRaw === "telegram"
      ? sectionRaw
      : "";
  const category = params.get("category") || "";
  const conditionRaw = (params.get("condition") || "all").toLowerCase();
  const condition: HomeConditionFilter =
    conditionRaw === "new" || conditionRaw === "outlet" ? conditionRaw : "all";
  const sortRaw = (params.get("sort") || "limiar_desc") as CatalogSort;
  const sort = SORT_OPTIONS.some((o) => o.value === sortRaw)
    ? sortRaw
    : "limiar_desc";
  const q = (params.get("q") || "").trim();
  const page = Math.max(1, Number(params.get("page") || "1") || 1);
  const tab: CatalogTab = params.get("tab") === "alerts" ? "alerts" : "products";
  return { section, category, condition, sort, q, page, tab };
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
      if (next.tab === "alerts") params.set("tab", "alerts");
      if (next.section) params.set("section", next.section);
      if (next.category) params.set("category", next.category);
      if (next.condition && next.condition !== "all") {
        params.set("condition", next.condition);
      }
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
    state.tab === "products" &&
    !state.section &&
    (state.q.length >= 2 || Boolean(pill?.searchQ));

  // Secções deals / catálogo base / alertas Telegram (pool local)
  useEffect(() => {
    if (useApiSearch) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setSearchTotal(0);

    (async () => {
      try {
        if (state.tab === "alerts") {
          const res = await getTelegramDeals(50, 168);
          if (cancelled) return;
          setPool(
            res.results
              .filter((s) => s.sentToTelegram !== false)
              .map(summaryToProduct),
          );
        } else if (state.section === "deals") {
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
        } else if (state.section === "telegram") {
          const res = await getTelegramDeals(50, 168);
          if (cancelled) return;
          setPool(
            res.results
              .filter((s) => s.sentToTelegram !== false)
              .map(summaryToProduct),
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
  }, [state.section, state.tab, useApiSearch]);

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

  const usingApiSearch = searchResults !== null && state.tab === "products" && !state.section;
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

  const meta =
    state.tab === "alerts"
      ? {
          title: "📢 Histórico de Alertas do Bot",
          subtitle: "Oportunidades com perfil de publicação no canal Telegram Limiar.",
        }
      : state.section
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

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => pushState({ tab: "products", page: 1 })}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
            state.tab === "products"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          Produtos
        </button>
        <button
          type="button"
          onClick={() => pushState({ tab: "alerts", section: "", page: 1 })}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
            state.tab === "alerts"
              ? "bg-sky-700 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          Histórico de Alertas do Bot
        </button>
      </div>

      {state.tab === "alerts" ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Alertas com mínimo histórico, semáforo comprar ou Índice ≥ 85.
          </p>
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center rounded-xl bg-sky-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
          >
            📢 Entrar no Telegram
          </a>
        </div>
      ) : (
        <>
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

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_PILLS.map((cat) => {
              const active = state.category === cat.id;
              return (
                <button
                  key={cat.id || "all"}
                  type="button"
                  onClick={() => pushState({ category: cat.id, page: 1 })}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ConditionFilterPills
          value={state.condition}
          onChange={(value) => pushState({ condition: value, page: 1 })}
        />

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

      <p className="mb-5 text-sm text-slate-500">
        {loading
          ? "A carregar…"
          : total === 0
            ? "Ainda não há produtos para estes filtros — tenta limpar filtros ou outra secção."
            : `A mostrar ${shownFrom}–${shownTo} de ${total} ${
                state.tab === "alerts" ? "alerta" : "produto"
              }${total === 1 ? "" : "s"}`}
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
        state.tab === "alerts" ? (
          <div className="space-y-3">
            {pageItems.map((product) => (
              <a
                key={product.ean}
                href={`/p/?id=${encodeURIComponent(product.slug)}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-sky-200/80 bg-gradient-to-r from-white to-sky-50/50 px-4 py-3 shadow-sm transition-colors hover:border-sky-300"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-0.5 text-xs text-sky-700">
                    Índice {product.decision.limiarIndex.value}/100
                    {product.decision.isHistoricalMin ? " · Mín. histórico" : ""}
                  </p>
                </div>
                <span className="shrink-0 font-display text-lg font-bold text-slate-900">
                  {formatEUR(product.currentPrice)}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((product) => (
              <OpportunityCard
                key={product.ean}
                product={product}
                showDropToday={state.section === "drops"}
                compact
                detectedAt={
                  state.section === "telegram" || state.tab === "alerts"
                    ? product.detectedAt
                    : undefined
                }
              />
            ))}
          </div>
        )
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Sem produtos com estes filtros. Ajusta os filtros ou experimenta outra pesquisa —
          alguns produtos ainda não têm histórico suficiente.
        </p>
      )}

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
