/**
 * FASE 7.19 — TimelineService.
 * Gera eventos factuais a partir de histórico / baselines.
 * Nunca inventa. Nunca prevê.
 */

import type { PricePoint, Product } from "@/lib/types";
import type {
  TimelineEvent,
  TimelineEventKind,
  TimelinePeriod,
  TimelinePeriodGroup,
  WatchBaseline,
  WatchItem,
  WatchKind,
} from "@/lib/watchlists/types";

const MS_DAY = 86_400_000;

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function searchBlob(
  kind: WatchKind,
  label: string,
  title: string,
  summary: string,
): string {
  return `${kind} ${label} ${title} ${summary}`.toLowerCase();
}

export function makeEvent(opts: {
  watchId: string | null;
  kind: WatchKind;
  eventKind: TimelineEventKind;
  title: string;
  summary: string;
  href: string;
  targetLabel: string;
  at: number;
  deltaEur?: number | null;
  deltaCount?: number | null;
}): TimelineEvent {
  return {
    id: uid("tev"),
    watchId: opts.watchId,
    kind: opts.kind,
    eventKind: opts.eventKind,
    title: opts.title,
    summary: opts.summary,
    href: opts.href,
    targetLabel: opts.targetLabel,
    at: opts.at,
    deltaEur: opts.deltaEur ?? null,
    deltaCount: opts.deltaCount ?? null,
    searchText: searchBlob(
      opts.kind,
      opts.targetLabel,
      opts.title,
      opts.summary,
    ),
  };
}

/** Eventos a partir do histórico de preços do produto (observado). */
export function eventsFromProductHistory(
  product: Product,
  opts?: { limit?: number; watchId?: string | null },
): TimelineEvent[] {
  const history = [...(product.history || [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  if (history.length < 2) return [];

  const limit = opts?.limit ?? 24;
  const href = `/p/${encodeURIComponent(product.slug)}/`;
  const label = product.name;
  const events: TimelineEvent[] = [];

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const cur = history[i];
    if (!(prev.price > 0 && cur.price > 0)) continue;
    const delta = round2(cur.price - prev.price);
    if (Math.abs(delta) < 0.005) continue;
    const at = Date.parse(`${cur.date}T12:00:00`);
    if (!Number.isFinite(at)) continue;
    const drop = delta < 0;
    events.push(
      makeEvent({
        watchId: opts?.watchId ?? null,
        kind: "PRODUCT",
        eventKind: drop ? "PRICE_DROP" : "PRICE_RISE",
        title: drop ? "Preço baixou" : "Preço subiu",
        summary: drop
          ? `Preço baixou ${formatDeltaEur(-delta)} (de ${prev.price.toFixed(2)} € para ${cur.price.toFixed(2)} €)`
          : `Preço subiu ${formatDeltaEur(delta)} (de ${prev.price.toFixed(2)} € para ${cur.price.toFixed(2)} €)`,
        href,
        targetLabel: label,
        at,
        deltaEur: delta,
      }),
    );
  }

  // Novo mínimo: último ponto igual ao mínimo histórico observado
  const last = history[history.length - 1];
  const min = Math.min(...history.map((h) => h.price).filter((p) => p > 0));
  if (
    last &&
    min > 0 &&
    Math.abs(last.price - min) < 0.005 &&
    product.historicalMin > 0 &&
    Math.abs(product.historicalMin - min) < 0.5
  ) {
    const at = Date.parse(`${last.date}T12:00:00`);
    if (Number.isFinite(at)) {
      events.push(
        makeEvent({
          watchId: opts?.watchId ?? null,
          kind: "PRODUCT",
          eventKind: "NEW_MIN",
          title: "Novo mínimo observado",
          summary: `Preço no mínimo observado: ${last.price.toFixed(2)} €`,
          href,
          targetLabel: label,
          at,
          deltaEur: 0,
        }),
      );
    }
  }

  return events
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
}

function formatDeltaEur(n: number): string {
  return `${round2(Math.abs(n)).toFixed(2).replace(".", ",")} €`;
}

/**
 * Compara baseline anterior com o actual.
 * Só emite evento se houver diferença factual.
 */
export function diffBaselines(
  watch: WatchItem,
  next: WatchBaseline,
): TimelineEvent[] {
  const prev = watch.baseline;
  if (!prev) return [];

  const events: TimelineEvent[] = [];
  const now = next.updatedAt || Date.now();
  const { kind, target, id: watchId } = watch;
  const label = target.label;
  const href = target.href;

  const push = (
    eventKind: TimelineEventKind,
    title: string,
    summary: string,
    extra?: { deltaEur?: number | null; deltaCount?: number | null },
  ) => {
    events.push(
      makeEvent({
        watchId,
        kind,
        eventKind,
        title,
        summary,
        href,
        targetLabel: label,
        at: now,
        ...extra,
      }),
    );
  };

  if (
    prev.price != null &&
    next.price != null &&
    prev.price > 0 &&
    next.price > 0
  ) {
    const d = round2(next.price - prev.price);
    if (d <= -0.5) {
      push(
        "PRICE_DROP",
        "Preço baixou",
        `Preço baixou ${formatDeltaEur(-d)}`,
        { deltaEur: d },
      );
    } else if (d >= 0.5) {
      push(
        "PRICE_RISE",
        "Preço subiu",
        `Preço subiu ${formatDeltaEur(d)}`,
        { deltaEur: d },
      );
    }
  }

  if (
    prev.historicalMin != null &&
    next.historicalMin != null &&
    next.price != null &&
    next.historicalMin > 0 &&
    Math.abs(next.price - next.historicalMin) < 0.5 &&
    (prev.historicalMin - next.historicalMin > 0.5 ||
      Math.abs((prev.price ?? 0) - next.historicalMin) > 0.5)
  ) {
    push(
      "NEW_MIN",
      "Novo mínimo",
      `Novo mínimo observado: ${next.historicalMin.toFixed(2)} €`,
    );
  }

  const prevStores = new Set(prev.offerStores || []);
  const nextStores = new Set(next.offerStores || []);
  const added = [...nextStores].filter((s) => !prevStores.has(s));
  const removed = [...prevStores].filter((s) => !nextStores.has(s));
  if (added.length) {
    push(
      "NEW_STORE",
      added.length === 1 ? "Entrou nova loja" : "Entraram novas lojas",
      `${added.length} loja(s) nova(s) com oferta`,
      { deltaCount: added.length },
    );
  }
  if (removed.length) {
    push(
      "STORE_GONE",
      "Loja deixou de vender",
      `${removed.length} loja(s) sem oferta agora`,
      { deltaCount: -removed.length },
    );
  }

  if (
    prev.storeCount != null &&
    next.storeCount != null &&
    next.storeCount > prev.storeCount
  ) {
    const d = next.storeCount - prev.storeCount;
    push("MORE_STORES", "Mais lojas", `+${d} loja(s)`, { deltaCount: d });
  }

  if (prev.inStock === false && next.inStock === true) {
    push("BACK_IN_STOCK", "Voltou a stock", "Produto voltou a estar em stock");
  }

  if (
    prev.couponCount != null &&
    next.couponCount != null &&
    next.couponCount > prev.couponCount
  ) {
    const d = next.couponCount - prev.couponCount;
    push("MORE_COUPONS", "Mais cupões", `+${d} cupão(ões)`, { deltaCount: d });
  }

  if (
    prev.productCount != null &&
    next.productCount != null &&
    next.productCount !== prev.productCount
  ) {
    const d = next.productCount - prev.productCount;
    if (d > 0) {
      push(
        kind === "BRAND" ? "BRAND_PRODUCTS_UP" : "CATEGORY_PRODUCTS_UP",
        kind === "BRAND" ? "Novos produtos na marca" : "Categoria ganhou produtos",
        `+${d} produto(s)`,
        { deltaCount: d },
      );
    } else if (d < 0) {
      push(
        "CATEGORY_PRODUCTS_DOWN",
        "Menos produtos",
        `${d} produto(s)`,
        { deltaCount: d },
      );
    }
  }

  if (
    prev.avgPrice != null &&
    next.avgPrice != null &&
    prev.avgPrice > 0 &&
    next.avgPrice > 0
  ) {
    const d = round2(next.avgPrice - prev.avgPrice);
    if (d <= -1) {
      push(
        "CATEGORY_AVG_DOWN",
        "Preço médio caiu",
        `Preço médio caiu ${formatDeltaEur(-d)}`,
        { deltaEur: d },
      );
    }
  }

  if (
    prev.brandCount != null &&
    next.brandCount != null &&
    next.brandCount > prev.brandCount
  ) {
    const d = next.brandCount - prev.brandCount;
    push(
      "CATEGORY_BRANDS_UP",
      "Novas marcas",
      `+${d} marca(s)`,
      { deltaCount: d },
    );
  }

  if (
    prev.promotionCount != null &&
    next.promotionCount != null &&
    next.promotionCount > prev.promotionCount
  ) {
    const d = next.promotionCount - prev.promotionCount;
    push(
      kind === "STORE" ? "STORE_PROMOS_UP" : "BRAND_PROMOS_UP",
      "Mais promoções",
      `+${d} promoção(ões)`,
      { deltaCount: d },
    );
  }

  if (
    prev.total != null &&
    next.total != null &&
    prev.total > 0 &&
    next.total > 0
  ) {
    const d = round2(next.total - prev.total);
    if (kind === "PROJECT" && d <= -0.5) {
      push(
        "PROJECT_CHEAPER",
        "Projeto ficou mais barato",
        `Total baixou ${formatDeltaEur(-d)}`,
        { deltaEur: d },
      );
    }
    if (kind === "SMART_CART" && d <= -0.5) {
      push(
        "CART_TOTAL_DOWN",
        "Carrinho mais barato",
        `Total baixou ${formatDeltaEur(-d)}`,
        { deltaEur: d },
      );
    }
  }

  return events;
}

/** Eventos de histórico de totais do projeto (já gravados). */
export function eventsFromProjectPriceHistory(
  projectId: string,
  name: string,
  history: Array<{ date: string; total: number }>,
  watchId?: string | null,
): TimelineEvent[] {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const events: TimelineEvent[] = [];
  const href = `/projetos/p/?id=${encodeURIComponent(projectId)}`;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const d = round2(cur.total - prev.total);
    if (Math.abs(d) < 0.5) continue;
    const at = Date.parse(`${cur.date}T12:00:00`);
    if (!Number.isFinite(at)) continue;
    const cheaper = d < 0;
    events.push(
      makeEvent({
        watchId: watchId ?? null,
        kind: "PROJECT",
        eventKind: cheaper ? "PROJECT_CHEAPER" : "PROJECT_ITEM_COSTLIER",
        title: cheaper ? "Total baixou" : "Total subiu",
        summary: cheaper
          ? `Total baixou ${formatDeltaEur(-d)}`
          : `Total subiu ${formatDeltaEur(d)}`,
        href,
        targetLabel: name,
        at,
        deltaEur: d,
      }),
    );
  }
  return events;
}

export function periodOf(at: number, now = Date.now()): TimelinePeriod {
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const t0 = startToday.getTime();
  if (at >= t0) return "today";
  if (at >= t0 - MS_DAY) return "yesterday";
  if (at >= t0 - 7 * MS_DAY) return "week";
  if (at >= t0 - 30 * MS_DAY) return "month";
  return "older";
}

const PERIOD_LABEL: Record<TimelinePeriod, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  week: "Semana passada",
  month: "Mês passado",
  older: "Mais antigo",
};

export function groupEventsByPeriod(
  events: TimelineEvent[],
  now = Date.now(),
): TimelinePeriodGroup[] {
  const buckets: Record<TimelinePeriod, TimelineEvent[]> = {
    today: [],
    yesterday: [],
    week: [],
    month: [],
    older: [],
  };
  for (const e of [...events].sort((a, b) => b.at - a.at)) {
    buckets[periodOf(e.at, now)].push(e);
  }
  return (Object.keys(buckets) as TimelinePeriod[])
    .filter((p) => buckets[p].length > 0)
    .map((p) => ({ period: p, label: PERIOD_LABEL[p], events: buckets[p] }));
}

export type TimelineFilter = {
  kinds?: WatchKind[] | null;
  query?: string;
  /** 1 | 7 | 30 | 90 — janela em dias a partir de agora. */
  days?: number | null;
};

export function filterTimelineEvents(
  events: TimelineEvent[],
  filter: TimelineFilter,
  now = Date.now(),
): TimelineEvent[] {
  const q = (filter.query || "").trim().toLowerCase();
  const kinds = filter.kinds?.length ? new Set(filter.kinds) : null;
  const days = filter.days && filter.days > 0 ? filter.days : null;
  const minAt = days != null ? now - days * MS_DAY : null;

  return events.filter((e) => {
    if (kinds && !kinds.has(e.kind)) return false;
    if (minAt != null && e.at < minAt) return false;
    if (q && !e.searchText.includes(q) && !e.targetLabel.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

export function mergeUniqueEvents(
  existing: TimelineEvent[],
  incoming: TimelineEvent[],
  max = 500,
): TimelineEvent[] {
  const key = (e: TimelineEvent) =>
    `${e.kind}|${e.eventKind}|${e.targetLabel}|${e.at}|${e.summary}`;
  const seen = new Set(existing.map(key));
  const out = [...existing];
  for (const e of incoming) {
    const k = key(e);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out.sort((a, b) => b.at - a.at).slice(0, max);
}

/** Utilitário de teste / UI — formata data relativa curta. */
export function formatEventDay(at: number): string {
  return new Date(at).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
  });
}

export type { PricePoint };
