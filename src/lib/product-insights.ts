/** Insights de produto para a página de detalhe Limiar — só dados reais. */

import type {
  DecisionScore,
  LimiarIndex,
  PricePoint,
  Product,
  Seasonality,
  SeasonalMarker,
} from "@/lib/types";
import { formatEUR, formatPct } from "@/lib/utils";

const STORAGE_RE = /\b(\d+(?:[.,]\d+)?)\s*(tb|gb)\b/gi;
const COLOR_RE =
  /\b(preto|black|branco|white|azul|blue|vermelho|red|verde|green|cinza|grey|gray|dourado|gold|prata|silver|rosa|pink|roxo|purple|tit[aâ]nio|titanium)\b/gi;

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** Mínimo de pontos / meses para padrões sazonais e dicas avançadas. */
export const MIN_HISTORY_POINTS_FOR_PATTERNS = 20;
export const MIN_MONTHS_FOR_SEASONALITY = 4;
export const MIN_HISTORY_SPAN_DAYS = 60;

export function isAbsoluteHistoricalMin(
  current: number | null | undefined,
  historicalMin: number | null | undefined,
): boolean {
  if (current == null || historicalMin == null) return false;
  if (!(current > 0) || !(historicalMin > 0)) return false;
  return Math.abs(current - historicalMin) < 0.015;
}

export function parseStorageGb(text: string | null | undefined): number | null {
  if (!text) return null;
  let best: number | null = null;
  const re = new RegExp(STORAGE_RE.source, STORAGE_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) != null) {
    const n = Number(m[1].replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) continue;
    const gb = m[2].toLowerCase() === "tb" ? n * 1024 : n;
    if (best == null || gb > best) best = gb;
  }
  return best;
}

export function formatStorageLabel(gb: number): string {
  if (gb >= 1024) {
    const tb = gb / 1024;
    return `${tb.toFixed(tb % 1 === 0 ? 0 : 1)} TB`;
  }
  return `${Math.round(gb)} GB`;
}

export function stripCapacityFromName(name: string): string {
  return name.replace(STORAGE_RE, " ").replace(/\s+/g, " ").trim();
}

export function stripVariantNoise(name: string): string {
  return stripCapacityFromName(name)
    .replace(COLOR_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProductSummary(product: Product): string {
  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.category && product.category !== "Other") parts.push(product.category);
  if (product.chipsetModel) parts.push(product.chipsetModel);
  if (product.vramSpec) parts.push(product.vramSpec);
  const storage = parseStorageGb(product.name);
  if (storage != null) parts.push(formatStorageLabel(storage));
  const condition = product.condition ?? "NEW";
  if (condition !== "NEW") {
    const labels: Record<string, string> = {
      OUTLET: "Outlet / exposição",
      REFURBISHED: "Recondicionado",
      OPEN_BOX: "Caixa aberta",
    };
    parts.push(labels[condition] || condition);
  }
  if (parts.length === 0) {
    return (
      product.decision.limiarIndex.summary ||
      "Monitorizado pelo Limiar com base no histórico de preços multi-loja."
    );
  }
  const lead = parts.slice(0, 4).join(" · ");
  const indexHint = product.decision.limiarIndex.summary?.trim();
  if (indexHint && indexHint.length < 120) return `${lead}. ${indexHint}`;
  return `${lead}. Comparação factual entre lojas e histórico Limiar.`;
}

export type VariantValueTip = {
  message: string;
  siblingSlug: string;
  siblingName: string;
  siblingPrice: number;
  pricePerGbCurrent: number;
  pricePerGbSibling: number;
  unitLabel: string;
};

function nameTokenOverlap(a: string, b: string): number {
  const ta = new Set(
    a
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
  const tb = b
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (ta.size === 0) return 0;
  return tb.filter((t) => ta.has(t)).length / Math.max(ta.size, 1);
}

export function findBetterStorageVariantTip(opts: {
  currentName: string;
  currentSlug: string;
  currentPrice: number;
  siblings: Array<{ slug: string; name: string; currentPrice: number }>;
}): VariantValueTip | null {
  const currentGb = parseStorageGb(opts.currentName);
  if (currentGb == null || currentGb <= 0 || opts.currentPrice <= 0) return null;
  const base = stripCapacityFromName(opts.currentName);
  const currentPerGb = opts.currentPrice / currentGb;
  let best: VariantValueTip | null = null;

  for (const s of opts.siblings) {
    if (!s.slug || s.slug === opts.currentSlug || !(s.currentPrice > 0)) continue;
    const gb = parseStorageGb(s.name);
    if (gb == null || gb <= currentGb) continue;
    if (nameTokenOverlap(base, stripCapacityFromName(s.name)) < 0.45) continue;
    const perGb = s.currentPrice / gb;
    if (perGb >= currentPerGb * 0.97) continue;
    const savingPct = ((currentPerGb - perGb) / currentPerGb) * 100;
    if (savingPct < 8) continue;
    const extraEur = s.currentPrice - opts.currentPrice;
    const label = formatStorageLabel(gb);
    const unitLabel = gb >= 1024 ? "€/TB" : "€/GB";
    const message =
      extraEur > 0
        ? `A versão de ${label} custa apenas mais ${formatEUR(extraEur)} e oferece melhor valor por capacidade (${unitLabel}).`
        : `A versão de ${label} está a um preço mais vantajoso por capacidade (${unitLabel}) do que esta.`;
    const tip: VariantValueTip = {
      message,
      siblingSlug: s.slug,
      siblingName: s.name,
      siblingPrice: s.currentPrice,
      pricePerGbCurrent: currentPerGb,
      pricePerGbSibling: perGb,
      unitLabel,
    };
    if (!best || perGb < best.pricePerGbSibling) best = tip;
  }
  return best;
}

export function buildStillBetterAlertTip(opts: {
  currentPrice: number;
  historicalMin: number;
  avg30d?: number | null;
}): string | null {
  const { currentPrice, historicalMin, avg30d } = opts;
  if (!(currentPrice > 0) || !(historicalMin > 0)) return null;
  const floor = Math.round(historicalMin * 100) / 100;
  const campaignTarget =
    avg30d != null && avg30d > historicalMin
      ? Math.round(Math.min(avg30d * 0.92, currentPrice * 0.9) * 100) / 100
      : Math.round(currentPrice * 0.9 * 100) / 100;
  if (isAbsoluteHistoricalMin(currentPrice, historicalMin)) {
    return `Nos últimos registos este produto raramente baixou dos ${floor.toFixed(2).replace(".", ",")} € — já está no mínimo histórico absoluto.`;
  }
  if (historicalMin < currentPrice * 0.97) {
    return `Nos últimos registos este produto raramente baixou dos ${floor.toFixed(2).replace(".", ",")} €. Em campanhas observámos valores perto de ${campaignTarget.toFixed(2).replace(".", ",")} €.`;
  }
  return null;
}

export function historySpanDays(history: PricePoint[]): number {
  if (history.length < 2) return 0;
  const times = history
    .map((p) => new Date(p.date).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b);
  if (times.length < 2) return 0;
  return (times[times.length - 1] - times[0]) / 86_400_000;
}

export function distinctMonthsCovered(history: PricePoint[]): number {
  const months = new Set<string>();
  for (const p of history) {
    const d = new Date(p.date);
    if (Number.isNaN(d.getTime())) continue;
    months.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
  }
  return months.size;
}

export function hasEnoughSeasonalityData(history: PricePoint[]): boolean {
  return (
    history.length >= MIN_HISTORY_POINTS_FOR_PATTERNS &&
    distinctMonthsCovered(history) >= MIN_MONTHS_FOR_SEASONALITY &&
    historySpanDays(history) >= MIN_HISTORY_SPAN_DAYS
  );
}

export type SeasonalityInsight = Seasonality & {
  sufficient: boolean;
  lowPricePeriods: string[];
  highPriceMonths: string[];
  avgPromoDiscountPct: number | null;
  bestPromoDiscountPct: number | null;
};

function periodLabelForMonth(month: number): string {
  if (month === 11) return "Novembro (campanhas de fim de ano)";
  if (month === 1) return "Janeiro";
  if (month >= 6 && month <= 8) return "Campanhas de Verão";
  return MONTH_NAMES[month - 1];
}

export function estimateSeasonality(
  history: PricePoint[],
  currentPrice: number,
  timesBelowHint = 0,
): SeasonalityInsight {
  const sufficient = hasEnoughSeasonalityData(history);
  if (!sufficient) {
    return {
      sufficient: false,
      markers: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        label: "Histórico insuficiente",
        kind: "neutral" as const,
      })),
      note: "Histórico insuficiente para estimar padrões sazonais.",
      timesBelowCurrent12m: timesBelowHint,
      lowPricePeriods: [],
      highPriceMonths: [],
      avgPromoDiscountPct: null,
      bestPromoDiscountPct: null,
    };
  }

  const byMonth = new Map<number, number[]>();
  for (const p of history) {
    const d = new Date(p.date);
    if (Number.isNaN(d.getTime()) || !(p.price > 0)) continue;
    const m = d.getUTCMonth() + 1;
    const arr = byMonth.get(m) ?? [];
    arr.push(p.price);
    byMonth.set(m, arr);
  }
  const monthAvg = new Map<number, number>();
  for (const [m, prices] of byMonth) {
    monthAvg.set(m, prices.reduce((a, b) => a + b, 0) / prices.length);
  }
  const avgs = [...monthAvg.values()];
  const globalAvg =
    avgs.length > 0 ? avgs.reduce((a, b) => a + b, 0) / avgs.length : currentPrice;

  const markers: SeasonalMarker[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const avg = monthAvg.get(month);
    if (avg == null) {
      return { month, label: "Sem dados neste mês", kind: "neutral" as const };
    }
    if (avg <= globalAvg * 0.97) {
      const drop = ((globalAvg - avg) / globalAvg) * 100;
      return {
        month,
        label: `~${drop.toFixed(0)}% abaixo da média anual`,
        kind: "promo" as const,
      };
    }
    if (avg >= globalAvg * 1.04) {
      return { month, label: "Acima da média anual", kind: "peak" as const };
    }
    return { month, label: "Perto da média", kind: "neutral" as const };
  });

  const promo = markers.filter((m) => m.kind === "promo" && monthAvg.has(m.month));
  const peak = markers.filter((m) => m.kind === "peak" && monthAvg.has(m.month));
  const drops = promo.map((m) => {
    const avg = monthAvg.get(m.month)!;
    return ((globalAvg - avg) / globalAvg) * 100;
  });
  const avgPromoDiscountPct =
    drops.length > 0 ? drops.reduce((a, b) => a + b, 0) / drops.length : null;
  const bestPromoDiscountPct = drops.length > 0 ? Math.max(...drops) : null;

  const lowPricePeriods = [
    ...new Set(promo.map((m) => periodLabelForMonth(m.month))),
  ];
  const highPriceMonths = peak.map((m) => MONTH_NAMES[m.month - 1]);

  let timesBelow = timesBelowHint;
  if (timesBelow === 0 && currentPrice > 0) {
    timesBelow = history.filter((p) => p.price > 0 && p.price < currentPrice - 0.01).length;
  }

  const note =
    lowPricePeriods.length > 0
      ? `Com base no histórico Limiar, os preços mais baixos concentram-se em: ${lowPricePeriods.join(", ")}.`
      : "Com o histórico disponível, ainda não há um padrão sazonal dominante.";

  return {
    sufficient: true,
    markers,
    note,
    timesBelowCurrent12m: timesBelow,
    lowPricePeriods,
    highPriceMonths,
    avgPromoDiscountPct,
    bestPromoDiscountPct,
  };
}

export type DataConfidence = {
  stars: number; // 1–5
  label: string;
  reasons: string[];
  score: number; // 0–100
};

export function computeDataConfidence(opts: {
  history: PricePoint[];
  storeCount: number;
  samples30d?: number;
  samples90d?: number;
  volatilityPct?: number | null;
}): DataConfidence {
  const spanDays = historySpanDays(opts.history);
  const observations = Math.max(
    opts.history.length,
    opts.samples90d ?? 0,
    opts.samples30d ?? 0,
  );
  const stores = Math.max(0, opts.storeCount);

  let score = 0;
  // Duração (até 40)
  score += Math.min(40, (spanDays / 540) * 40);
  // Observações (até 35)
  score += Math.min(35, (observations / 400) * 35);
  // Lojas (até 15)
  score += Math.min(15, (stores / 6) * 15);
  // Estabilidade (até 10) — volatilidade baixa ajuda
  if (opts.volatilityPct != null && Number.isFinite(opts.volatilityPct)) {
    if (opts.volatilityPct < 8) score += 10;
    else if (opts.volatilityPct < 15) score += 6;
    else if (opts.volatilityPct < 25) score += 3;
  } else if (observations >= 30) {
    score += 4;
  }

  score = Math.round(Math.max(0, Math.min(100, score)));
  const stars = Math.max(1, Math.min(5, Math.ceil(score / 20)));

  const label =
    stars >= 5
      ? "Muito elevada"
      : stars === 4
        ? "Elevada"
        : stars === 3
          ? "Moderada"
          : stars === 2
            ? "Reduzida"
            : "Muito reduzida";

  const reasons: string[] = [];
  if (spanDays >= 30) {
    const months = Math.max(1, Math.round(spanDays / 30));
    reasons.push(
      months >= 12
        ? `${Math.round(spanDays / 30)} meses de histórico`
        : `${Math.round(spanDays)} dias de histórico`,
    );
  } else if (observations > 0) {
    reasons.push("Histórico ainda curto");
  }
  if (observations > 0) {
    reasons.push(
      `${observations} observa${observations === 1 ? "ção" : "ções"} de preço`,
    );
  }
  if (stores > 0) {
    reasons.push(
      `${stores} loja${stores === 1 ? "" : "s"} monitorizada${stores === 1 ? "" : "s"}`,
    );
  }
  if (reasons.length === 0) {
    reasons.push("Ainda a recolher observações para este produto");
  }

  return { stars, label, reasons, score };
}

export type DecisionPoint = {
  kind: "pro" | "con";
  text: string;
};

export function buildDecisionVerdict(opts: {
  decision: DecisionScore;
  currentPrice: number;
  avg30d?: number | null;
  historyLength: number;
  historySpanDays: number;
}): { points: DecisionPoint[]; conclusion: string } {
  const { decision, currentPrice, avg30d, historyLength, historySpanDays: span } = opts;
  const points: DecisionPoint[] = [];
  const histAvg = decision.historicalAvg ?? avg30d ?? null;
  const histMin = decision.historicalMin ?? null;
  const thin = historyLength < 8 || span < 21;

  if (histAvg != null && histAvg > 0 && currentPrice > 0) {
    const vsAvg = ((histAvg - currentPrice) / histAvg) * 100;
    if (vsAvg >= 3) {
      points.push({
        kind: "pro",
        text: `Está ${formatPct(vsAvg)} abaixo da média dos últimos 30 dias (${formatEUR(histAvg)}).`,
      });
    } else if (vsAvg <= -3) {
      points.push({
        kind: "con",
        text: `Está ${formatPct(Math.abs(vsAvg))} acima da média dos últimos 30 dias (${formatEUR(histAvg)}).`,
      });
    }
  }

  if (
    decision.isHistoricalMin ||
    isAbsoluteHistoricalMin(currentPrice, histMin)
  ) {
    points.push({
      kind: "pro",
      text:
        histMin != null
          ? `Igualou o mínimo histórico registado (${formatEUR(histMin)}).`
          : "Igualou o mínimo histórico registado.",
    });
    if (!thin && span >= 180) {
      points.push({
        kind: "pro",
        text: "Nunca esteve mais barato no período histórico analisado pelo Limiar.",
      });
    }
  } else if (histMin != null && currentPrice > histMin * 1.02) {
    points.push({
      kind: "con",
      text: `Ainda ${formatEUR(currentPrice - histMin)} acima do mínimo histórico (${formatEUR(histMin)}).`,
    });
  }

  if (thin) {
    points.push({
      kind: "con",
      text: "Produto ainda com poucos registos históricos — a análise tem menor confiança.",
    });
  }

  // Bullets factuais da API (sem duplicar)
  for (const bullet of decision.bullets || []) {
    const lower = bullet.toLowerCase();
    if (points.some((p) => p.text.toLowerCase().includes(lower.slice(0, 24)))) continue;
    const isWarning =
      lower.includes("pouca") ||
      lower.includes("insuficiente") ||
      lower.includes("acima") ||
      lower.includes("aguardar") ||
      lower.includes("esperar");
    points.push({ kind: isWarning ? "con" : "pro", text: bullet });
  }

  // Limitar ruído
  const pros = points.filter((p) => p.kind === "pro").slice(0, 4);
  const cons = points.filter((p) => p.kind === "con").slice(0, 3);
  const ordered = [...pros, ...cons];

  let conclusion: string;
  if (decision.semaphore === "buy" && pros.length > 0) {
    conclusion =
      "Se pretende comprar este produto, os dados históricos indicam que este é um momento favorável.";
  } else if (decision.semaphore === "fair") {
    conclusion =
      "Os dados sugerem um preço razoável, mas ainda não o melhor momento absoluto face ao histórico.";
  } else {
    conclusion =
      "Com base no histórico disponível, pode ser preferível aguardar uma melhor oportunidade.";
  }
  if (thin) {
    conclusion =
      "Com o histórico ainda reduzido, o Limiar recomenda confirmar o preço em mais do que uma loja antes de decidir.";
  }

  return { points: ordered, conclusion };
}

export type LimiarInsight = {
  id: string;
  icon: string;
  title: string;
  message: string;
  href?: string;
};

/** Detecta subidas após mínimos locais — só com histórico suficiente. */
function detectPostLowRise(history: PricePoint[]): boolean {
  if (history.length < MIN_HISTORY_POINTS_FOR_PATTERNS) return false;
  const sorted = [...history]
    .filter((p) => p.price > 0 && !Number.isNaN(new Date(p.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (sorted.length < 15) return false;

  let rises = 0;
  for (let i = 2; i < sorted.length - 5; i++) {
    const prev = sorted[i - 1].price;
    const cur = sorted[i].price;
    const next = sorted[i + 1].price;
    if (!(cur <= prev && cur <= next)) continue;
    // mínimo local
    const later = sorted.slice(i + 1, i + 12);
    const rose = later.some((p) => p.price >= cur * 1.06);
    if (rose) rises += 1;
  }
  return rises >= 3;
}

export function buildLimiarInsights(opts: {
  product: Product;
  confidence: DataConfidence;
  seasonality: SeasonalityInsight;
  variantTip: VariantValueTip | null;
}): LimiarInsight[] {
  const { product, confidence, seasonality, variantTip } = opts;
  const insights: LimiarInsight[] = [];
  const price = product.currentPrice;
  const histMin = product.historicalMin;
  const avg = product.avg30d;

  // Mínimo histórico — pode aparecer mesmo com confiança moderada se for factual exacto
  if (isAbsoluteHistoricalMin(price, histMin) || product.decision.isHistoricalMin) {
    insights.push({
      id: "hist-min",
      icon: "🔥",
      title: "Mínimo Histórico",
      message:
        "O preço actual coincide com o mínimo histórico absoluto registado pelo Limiar.",
    });
  }

  // Dicas que exigem confiança ≥ 3
  if (confidence.stars >= 3 && hasEnoughSeasonalityData(product.history)) {
    if (detectPostLowRise(product.history) && isAbsoluteHistoricalMin(price, histMin)) {
      insights.push({
        id: "often-rises",
        icon: "📈",
        title: "Normalmente sobe",
        message:
          "No histórico Limiar, após períodos neste nível de preço, o valor voltou a subir em várias ocasiões.",
      });
    }

    if (
      seasonality.sufficient &&
      seasonality.lowPricePeriods.length > 0 &&
      histMin > 0 &&
      price > histMin * 1.05
    ) {
      insights.push({
        id: "wait-campaign",
        icon: "⏳",
        title: "Vale esperar",
        message: `Nos registos Limiar este produto chegou a cerca de ${formatEUR(histMin)} em períodos como ${seasonality.lowPricePeriods[0]}.`,
      });
    } else if (
      avg > 0 &&
      price > avg * 0.98 &&
      histMin > 0 &&
      histMin < price * 0.9 &&
      confidence.stars >= 4
    ) {
      insights.push({
        id: "wait-avg",
        icon: "⏳",
        title: "Vale esperar",
        message: `O preço actual está alinhado com a média. O mínimo registado é ${formatEUR(histMin)}.`,
      });
    }
  }

  // Variante — só com overlap forte (já filtrado) e tip real
  if (variantTip && confidence.stars >= 2) {
    insights.push({
      id: "variant",
      icon: "💾",
      title: "Melhor variante",
      message: variantTip.message,
      href: `/p/?id=${encodeURIComponent(variantTip.siblingSlug)}`,
    });
  }

  return insights.slice(0, 4);
}

export function factorBarTone(score: number, maxScore = 30): {
  bar: string;
  text: string;
} {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.7) return { bar: "bg-emerald-500", text: "text-emerald-800" };
  if (ratio >= 0.45) return { bar: "bg-sky-500", text: "text-sky-800" };
  if (ratio >= 0.25) return { bar: "bg-amber-500", text: "text-amber-800" };
  return { bar: "bg-slate-400", text: "text-slate-600" };
}

export function displayFactors(index: LimiarIndex) {
  const map: Array<{
    key: keyof LimiarIndex["factors"];
    title: string;
    maxScore: number;
  }> = [
    { key: "vsAvg30d", title: "Preço vs Mercado", maxScore: 30 },
    { key: "historicalMin", title: "Histórico", maxScore: 30 },
    { key: "couponApplied", title: "Campanhas", maxScore: 20 },
    { key: "volatility", title: "Volatilidade", maxScore: 20 },
  ];
  return map.map(({ key, title, maxScore }) => {
    const f = index.factors[key];
    return {
      key,
      title,
      description: f.detail || f.label,
      score: f.score,
      maxScore,
      tone: factorBarTone(f.score, maxScore),
    };
  });
}

export function formatRelativeTimePt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diffMs = Date.now() - t;
  if (diffMs < 0) return "agora";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  return `há ${months} mês${months === 1 ? "" : "es"}`;
}

export function volatilityLabelPt(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return "Sem dados";
  if (pct < 5) return "Baixa";
  if (pct < 15) return "Média";
  return "Alta";
}

export function isLikelyVariantOf(current: Product, candidate: Product): boolean {
  if (candidate.slug === current.slug) return false;
  if (current.brand && candidate.brand && current.brand !== candidate.brand) return false;
  const overlap = nameTokenOverlap(
    stripVariantNoise(current.name),
    stripVariantNoise(candidate.name),
  );
  if (overlap < 0.5) return false;
  // Deve diferir em capacidade ou cor (variante), não ser cópia exacta
  const curGb = parseStorageGb(current.name);
  const candGb = parseStorageGb(candidate.name);
  const sameCapacity =
    curGb != null && candGb != null ? Math.abs(curGb - candGb) < 0.01 : false;
  const curColor = (current.name.match(COLOR_RE) || []).join(" ").toLowerCase();
  const candColor = (candidate.name.match(COLOR_RE) || []).join(" ").toLowerCase();
  const colorDiff = Boolean(curColor && candColor && curColor !== candColor);
  const capacityDiff = curGb != null && candGb != null && !sameCapacity;
  return capacityDiff || colorDiff || overlap >= 0.75;
}

export function isSimilarProduct(current: Product, candidate: Product): boolean {
  if (candidate.slug === current.slug) return false;
  if (isLikelyVariantOf(current, candidate)) return false;
  if (current.category && candidate.category && current.category !== candidate.category) {
    return false;
  }
  if (current.brand && candidate.brand && current.brand === candidate.brand) return true;
  return (
    nameTokenOverlap(stripVariantNoise(current.name), stripVariantNoise(candidate.name)) >=
    0.25
  );
}
