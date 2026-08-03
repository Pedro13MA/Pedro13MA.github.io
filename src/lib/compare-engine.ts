/**
 * FASE 7.11 — motor de comparação (só dados existentes, sem inventar).
 */

import { buildSpecRows } from "@/lib/product-content";
import {
  compareGroupIdForSpecKey,
  resolveProductKnowledge,
} from "@/lib/product-knowledge";
import {
  resolveProductInsights,
} from "@/lib/product-insights-buying";
import { displayCategoryLabel, isOtherLabel } from "@/lib/product-display";
import { historySpanDays } from "@/lib/product-insights";
import type { Product } from "@/lib/types";
import { DECISION_UI_LABEL, formatEUR } from "@/lib/utils";

export type CompareSortKey =
  | "price"
  | "score"
  | "history"
  | "brand"
  | "category";

export type CompareBadgeId =
  | "best_price"
  | "best_history"
  | "best_score"
  | "most_stores"
  | "best_opportunity"
  | "most_recent";

export type CompareBadge = {
  id: CompareBadgeId;
  label: string;
  slug: string;
};

export type CompareCell = {
  text: string;
  numeric: number | null;
  /** Destacar como melhor (verde) — nunca vermelho. */
  best: boolean;
  empty: boolean;
};

export type CompareRow = {
  id: string;
  /** Grupos de preço/decisão/histórico + secções da ficha técnica. */
  group: string;
  label: string;
  cells: CompareCell[];
  /** true se todos os valores não-vazios são iguais */
  allEqual: boolean;
};

export type HistoryStats = {
  firstPrice: number | null;
  firstDate: string | null;
  lastChangeDate: string | null;
  changeCount: number;
  spanDays: number;
  spark: number[];
};

const LOWER_BETTER_KEYS = new Set([
  "price_current",
  "price_avg",
  "price_min",
  "tdp_w",
  "power_w",
  "weight_kg",
  "length_mm",
]);

function parseNumeric(text: string): number | null {
  if (!text || text === "—") return null;
  const cleaned = text
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/GB/gi, "")
    .replace(/TB/gi, "")
    .replace(/MHz/gi, "")
    .replace(/Hz/gi, "")
    .replace(/W/gi, "")
    .replace(/mm/gi, "")
    .replace(/kg/gi, "")
    .replace(/mAh/gi, "")
    .replace(/MB\/s/gi, "")
    .replace(/"/g, "")
    .replace(",", ".");
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  return Number(m[0]);
}

export function computeHistoryStats(product: Product): HistoryStats {
  const hist = product.history || [];
  if (!hist.length) {
    return {
      firstPrice: null,
      firstDate: null,
      lastChangeDate: null,
      changeCount: 0,
      spanDays: 0,
      spark: [],
    };
  }
  const first = hist[0];
  let changeCount = 0;
  let lastChangeDate: string | null = null;
  for (let i = 1; i < hist.length; i++) {
    if (hist[i].price !== hist[i - 1].price) {
      changeCount += 1;
      lastChangeDate = hist[i].date;
    }
  }
  const spark = hist.map((p) => p.price);
  return {
    firstPrice: first.price,
    firstDate: first.date,
    lastChangeDate: lastChangeDate || hist[hist.length - 1]?.date || null,
    changeCount,
    spanDays: historySpanDays(hist),
    spark,
  };
}

export function observedDiscountPct(product: Product): number | null {
  if (product.realDiscountPct != null && product.realDiscountPct > 0) {
    return product.realDiscountPct;
  }
  if (product.decision.discountPct > 0) return product.decision.discountPct;
  if (product.avg30d > product.currentPrice) {
    return ((product.avg30d - product.currentPrice) / product.avg30d) * 100;
  }
  return null;
}

export function productsHaveMixedCategories(products: Product[]): boolean {
  const leaves = new Set(
    products
      .map((p) => (p.leafId || p.subcategory || "").toLowerCase().trim())
      .filter((x) => x && !isOtherLabel(x)),
  );
  if (leaves.size > 1) return true;
  const cats = new Set(
    products
      .map((p) => (p.category || "").toLowerCase().trim())
      .filter((x) => x && !isOtherLabel(x)),
  );
  return cats.size > 1;
}

export function computeCompareBadges(products: Product[]): CompareBadge[] {
  if (products.length < 2) return [];
  const badges: CompareBadge[] = [];

  const prices = products.map((p) => p.currentPrice).filter((n) => n > 0);
  if (prices.length) {
    const min = Math.min(...prices);
    const winners = products.filter((p) => p.currentPrice === min);
    if (winners.length === 1) {
      badges.push({
        id: "best_price",
        label: "Melhor preço",
        slug: winners[0].slug,
      });
    }
  }

  const scores = products.map((p) => p.decision.limiarIndex.value);
  const maxScore = Math.max(...scores);
  const scoreWinners = products.filter(
    (p) => p.decision.limiarIndex.value === maxScore,
  );
  if (scoreWinners.length === 1 && maxScore > 0) {
    badges.push({
      id: "best_score",
      label: "Melhor score",
      slug: scoreWinners[0].slug,
    });
  }

  const storeCounts = products.map((p) => p.offers.length);
  const maxStores = Math.max(...storeCounts);
  const storeWinners = products.filter((p) => p.offers.length === maxStores);
  if (storeWinners.length === 1 && maxStores > 0) {
    badges.push({
      id: "most_stores",
      label: "Mais lojas",
      slug: storeWinners[0].slug,
    });
  }

  // Melhor histórico: mais dias de histórico (dados reais)
  const spans = products.map((p) => ({
    slug: p.slug,
    days: historySpanDays(p.history),
  }));
  const maxDays = Math.max(...spans.map((s) => s.days));
  const histWinners = spans.filter((s) => s.days === maxDays && s.days > 0);
  if (histWinners.length === 1) {
    badges.push({
      id: "best_history",
      label: "Melhor histórico",
      slug: histWinners[0].slug,
    });
  }

  const discounts = products.map((p) => ({
    slug: p.slug,
    d: observedDiscountPct(p) ?? (p.decision.isHistoricalMin ? 0.01 : null),
    min: p.decision.isHistoricalMin,
  }));
  const withDisc = discounts.filter((x) => x.d != null) as Array<{
    slug: string;
    d: number;
    min: boolean;
  }>;
  if (withDisc.length) {
    const best = Math.max(...withDisc.map((x) => x.d));
    const winners = withDisc.filter((x) => x.d === best);
    if (winners.length === 1) {
      badges.push({
        id: "best_opportunity",
        label: "Melhor oportunidade",
        slug: winners[0].slug,
      });
    }
  }

  const recency = products.map((p) => {
    const last = p.history[p.history.length - 1]?.date;
    return { slug: p.slug, t: last ? Date.parse(last) : 0 };
  });
  const maxT = Math.max(...recency.map((r) => r.t));
  const recentWinners = recency.filter((r) => r.t === maxT && r.t > 0);
  if (recentWinners.length === 1) {
    badges.push({
      id: "most_recent",
      label: "Mais recente",
      slug: recentWinners[0].slug,
    });
  }

  return badges;
}

function markBest(
  cells: Omit<CompareCell, "best">[],
  lowerBetter: boolean,
): CompareCell[] {
  const nums = cells
    .map((c, i) => ({ i, n: c.numeric }))
    .filter((x) => x.n != null && !cells[x.i].empty) as Array<{
    i: number;
    n: number;
  }>;
  if (nums.length < 2) {
    return cells.map((c) => ({ ...c, best: false }));
  }
  const target = lowerBetter
    ? Math.min(...nums.map((x) => x.n))
    : Math.max(...nums.map((x) => x.n));
  const winners = nums.filter((x) => x.n === target);
  // Só destacar se houver um único vencedor claro
  const sole = winners.length === 1 ? winners[0].i : -1;
  return cells.map((c, i) => ({ ...c, best: i === sole }));
}

function cellFromText(
  text: string,
  numeric: number | null = parseNumeric(text),
): Omit<CompareCell, "best"> {
  const empty = !text || text === "—";
  return { text: empty ? "—" : text, numeric: empty ? null : numeric, empty };
}

export function buildCompareRows(products: Product[]): CompareRow[] {
  if (!products.length) return [];

  const rows: CompareRow[] = [];

  const pushMetric = (
    id: string,
    group: CompareRow["group"],
    label: string,
    values: Array<{ text: string; numeric: number | null }>,
    lowerBetter: boolean,
  ) => {
    const base = values.map((v) => cellFromText(v.text, v.numeric));
    const cells = markBest(base, lowerBetter);
    const nonEmpty = cells.filter((c) => !c.empty).map((c) => c.text);
    const allEqual =
      nonEmpty.length >= 2 && nonEmpty.every((t) => t === nonEmpty[0]);
    rows.push({ id, group, label, cells, allEqual });
  };

  // —— Preço ——
  pushMetric(
    "price_current",
    "price",
    "Preço atual",
    products.map((p) => ({
      text: formatEUR(p.currentPrice),
      numeric: p.currentPrice,
    })),
    true,
  );
  pushMetric(
    "price_avg",
    "price",
    "Preço médio (30d)",
    products.map((p) => ({
      text: p.avg30d > 0 ? formatEUR(p.avg30d) : "—",
      numeric: p.avg30d > 0 ? p.avg30d : null,
    })),
    true,
  );
  pushMetric(
    "price_min",
    "price",
    "Preço mínimo",
    products.map((p) => ({
      text: p.historicalMin > 0 ? formatEUR(p.historicalMin) : "—",
      numeric: p.historicalMin > 0 ? p.historicalMin : null,
    })),
    true,
  );
  pushMetric(
    "price_max",
    "price",
    "Preço máximo",
    products.map((p) => ({
      text: p.historicalMax > 0 ? formatEUR(p.historicalMax) : "—",
      numeric: p.historicalMax > 0 ? p.historicalMax : null,
    })),
    false,
  );

  pushMetric(
    "discount",
    "price",
    "Maior desconto observado",
    products.map((p) => {
      const d = observedDiscountPct(p);
      return {
        text: d != null ? `${d.toFixed(1)} %` : "—",
        numeric: d,
      };
    }),
    false,
  );

  pushMetric(
    "stores",
    "price",
    "Número de lojas",
    products.map((p) => ({
      text: String(p.offers.length),
      numeric: p.offers.length,
    })),
    false,
  );

  pushMetric(
    "coupons",
    "price",
    "Cupões",
    products.map((p) => {
      const n = p.offers.filter((o) => o.couponCode || o.couponLabel).length;
      const yes = p.storeCouponsAvailable || n > 0;
      return { text: yes ? (n > 0 ? String(n) : "Sim") : "Não", numeric: n };
    }),
    false,
  );

  pushMetric(
    "best_store",
    "price",
    "Melhor loja",
    products.map((p) => {
      const store =
        p.decision.cheapestStore ||
        p.offers[0]?.storeName ||
        p.offers[0]?.store ||
        null;
      return { text: store || "—", numeric: null };
    }),
    false,
  );

  // —— Decisão ——
  pushMetric(
    "score",
    "decision",
    "Score Limiar",
    products.map((p) => ({
      text: `${p.decision.limiarIndex.value}/100`,
      numeric: p.decision.limiarIndex.value,
    })),
    false,
  );

  pushMetric(
    "decision_label",
    "decision",
    "Decisão",
    products.map((p) => {
      const ui = DECISION_UI_LABEL[p.decision.semaphore];
      return { text: ui?.label || p.decision.semaphore, numeric: null };
    }),
    false,
  );

  pushMetric(
    "decision_reason",
    "decision",
    "Justificação",
    products.map((p) => ({
      text: (p.decision.limiarIndex.summary || p.decision.reason || "—").slice(
        0,
        120,
      ),
      numeric: null,
    })),
    false,
  );

  // —— Histórico ——
  const stats = products.map(computeHistoryStats);

  pushMetric(
    "hist_first",
    "history",
    "Primeiro preço observado",
    stats.map((s) => ({
      text: s.firstPrice != null ? formatEUR(s.firstPrice) : "—",
      numeric: s.firstPrice,
    })),
    true,
  );

  pushMetric(
    "hist_last_change",
    "history",
    "Última alteração",
    stats.map((s) => ({
      text: s.lastChangeDate
        ? new Date(s.lastChangeDate).toLocaleDateString("pt-PT")
        : "—",
      numeric: s.lastChangeDate ? Date.parse(s.lastChangeDate) : null,
    })),
    false,
  );

  pushMetric(
    "hist_changes",
    "history",
    "Número de alterações",
    stats.map((s) => ({
      text: String(s.changeCount),
      numeric: s.changeCount,
    })),
    false,
  );

  pushMetric(
    "hist_days",
    "history",
    "Dias de histórico",
    stats.map((s) => ({
      text: s.spanDays > 0 ? String(s.spanDays) : "—",
      numeric: s.spanDays > 0 ? s.spanDays : null,
    })),
    false,
  );

  // Sparkline row — special text encoding
  rows.push({
    id: "hist_spark",
    group: "history",
    label: "Gráfico mini",
    cells: stats.map((s) => ({
      text: s.spark.length ? s.spark.join(",") : "—",
      numeric: null,
      best: false,
      empty: s.spark.length < 2,
    })),
    allEqual: false,
  });

  // —— Ficha técnica (grupos knowledge; fallback buildSpecRows) ——
  const labelByKey = new Map<string, string>();
  const groupByKey = new Map<string, string>();
  const order: string[] = [];
  for (const p of products) {
    const knowledge = resolveProductKnowledge(p);
    if (knowledge?.groups.length) {
      for (const g of knowledge.groups) {
        for (const item of g.items) {
          if (!labelByKey.has(item.key)) {
            labelByKey.set(item.key, item.label);
            groupByKey.set(item.key, g.id);
            order.push(item.key);
          }
        }
      }
    } else {
      for (const s of buildSpecRows(p)) {
        if (!labelByKey.has(s.key)) {
          labelByKey.set(s.key, s.label);
          groupByKey.set(s.key, compareGroupIdForSpecKey(s.key));
          order.push(s.key);
        }
      }
    }
  }

  for (const key of order) {
    const values = products.map((p) => {
      const knowledge = resolveProductKnowledge(p);
      let text = "—";
      if (knowledge) {
        for (const g of knowledge.groups) {
          const hit = g.items.find((i) => i.key === key);
          if (hit) {
            text = hit.value;
            break;
          }
        }
      }
      if (text === "—") {
        const hit = buildSpecRows(p).find((s) => s.key === key);
        text = hit?.value || "—";
      }
      return {
        text,
        numeric: text !== "—" ? parseNumeric(text) : null,
      };
    });
    if (values.every((v) => !v.text || v.text === "—")) continue;
    const lower = LOWER_BETTER_KEYS.has(key);
    const groupId = groupByKey.get(key) || compareGroupIdForSpecKey(key);
    pushMetric(
      `spec_${key}`,
      groupId,
      labelByKey.get(key) || key,
      values,
      lower,
    );
  }

  // —— FASE 7.16 — Insights (additivo; não altera métricas existentes) ——
  const insightList = products.map((p) => resolveProductInsights(p));
  pushMetric(
    "insight_position",
    "insights",
    "Posição do preço",
    insightList.map((i) => ({
      text: i.currentPositionLabel || "—",
      numeric: null,
    })),
    false,
  );
  pushMetric(
    "insight_recommendation",
    "insights",
    "Leitura Limiar",
    insightList.map((i) => ({
      text: i.recommendationLabel || "—",
      numeric: null,
    })),
    false,
  );
  pushMetric(
    "insight_confidence",
    "insights",
    "Confiança do insight",
    insightList.map((i) => ({
      text: `${i.confidence} %`,
      numeric: i.confidence,
    })),
    false,
  );
  pushMetric(
    "insight_data_quality",
    "insights",
    "Qualidade dos dados",
    insightList.map((i) => ({
      text: `${i.dataQuality}/5`,
      numeric: i.dataQuality,
    })),
    false,
  );

  return rows;
}

export function filterDiffRows(
  rows: CompareRow[],
  diffsOnly: boolean,
): CompareRow[] {
  if (!diffsOnly) return rows;
  return rows.filter((r) => r.id === "hist_spark" || !r.allEqual);
}

export function sortProducts(
  products: Product[],
  key: CompareSortKey,
): Product[] {
  const copy = [...products];
  copy.sort((a, b) => {
    if (key === "price") return a.currentPrice - b.currentPrice;
    if (key === "score") {
      return b.decision.limiarIndex.value - a.decision.limiarIndex.value;
    }
    if (key === "history") {
      return historySpanDays(b.history) - historySpanDays(a.history);
    }
    if (key === "brand") {
      return (a.brand || "").localeCompare(b.brand || "", "pt");
    }
    const ca =
      displayCategoryLabel(a.subcategoryLabel, a.leafId, a.category) || "";
    const cb =
      displayCategoryLabel(b.subcategoryLabel, b.leafId, b.category) || "";
    return ca.localeCompare(cb, "pt");
  });
  return copy;
}

export function categoryLabelForProduct(p: Product): string {
  return (
    displayCategoryLabel(
      p.subcategoryLabel,
      p.leafId?.replace(/_/g, " "),
      isOtherLabel(p.category || "") ? null : p.category,
    ) || "—"
  );
}
