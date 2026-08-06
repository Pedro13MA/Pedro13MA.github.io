/**
 * Helpers do gráfico de histórico — Melhor Oferta (best price) no tempo.
 * Spread entre lojas nunca entra em min/máx históricos nem na linha principal.
 */

export type SeriesPoint = {
  date: string;
  /** Melhor oferta do dia (loja mais barata com stock). */
  price: number;
  /** Tecto de mercado no dia (loja mais cara) — só para banda, opcional. */
  maxMarketPrice?: number | null;
  /** Ponto preenchido por ausência de tick real (carry-forward). */
  isImputed?: boolean;
};

/** YYYY-MM-DD em UTC civil (sem desvio de timezone). */
export function toDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatTickDayMonth(key: string): string {
  const [y, m, d] = key.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return key;
  return `${d}/${m}`;
}

export function todayKey(now = new Date()): string {
  return toDateKey(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  );
}

/**
 * Janela [hoje−days … hoje] inclusive.
 * Carry-forward marca isImputed=true (não conta como observação estatística).
 */
export function fillPeriodWindow(
  points: SeriesPoint[],
  days: number,
  currentPrice: number,
  now = new Date(),
): SeriesPoint[] {
  const endKey = todayKey(now);
  const end = parseDateKey(endKey);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(1, days));

  const byDate = new Map<string, SeriesPoint>();
  for (const p of points) {
    if (!(p.price > 0) || !p.date) continue;
    const key = p.date.slice(0, 10);
    byDate.set(key, {
      date: key,
      price: p.price,
      maxMarketPrice: p.maxMarketPrice ?? null,
      isImputed: false,
    });
  }

  let carry: SeriesPoint | null = null;
  const sorted = [...byDate.keys()].sort();
  for (const key of sorted) {
    if (key <= toDateKey(start)) carry = byDate.get(key) ?? carry;
  }

  const out: SeriesPoint[] = [];
  const cursor = new Date(start);
  const endMs = end.getTime();
  while (cursor.getTime() <= endMs) {
    const key = toDateKey(cursor);
    const hit = byDate.get(key);
    if (hit) {
      carry = hit;
      out.push({ ...hit, isImputed: false });
    } else if (carry) {
      out.push({
        date: key,
        price: carry.price,
        maxMarketPrice: carry.maxMarketPrice ?? null,
        isImputed: true,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (!out.length) return [];

  const last = out[out.length - 1];
  if (last.date !== endKey) {
    const base = carry ?? last;
    out.push({
      date: endKey,
      price: currentPrice > 0 ? currentPrice : base.price,
      maxMarketPrice: base.maxMarketPrice ?? null,
      isImputed: true,
    });
  } else if (currentPrice > 0) {
    // Âncora do preço actual na Melhor Oferta de hoje (não inventa min/máx de loja).
    last.price = currentPrice;
  }

  return out;
}

/**
 * Extremos temporais só da Melhor Oferta (campo price).
 * Exclui pontos imputados — alinhado a DATA_PRINCIPLES.
 */
export function bestPriceExtremes(points: SeriesPoint[]): {
  min: number | null;
  max: number | null;
  minDate: string | null;
  maxDate: string | null;
} {
  const real = points.filter((p) => p.price > 0 && !p.isImputed);
  const pool = real.length ? real : points.filter((p) => p.price > 0);
  if (!pool.length) {
    return { min: null, max: null, minDate: null, maxDate: null };
  }

  let minP = pool[0];
  let maxP = pool[0];
  for (const p of pool) {
    if (p.price < minP.price) minP = p;
    if (p.price > maxP.price) maxP = p;
  }
  return {
    min: minP.price,
    max: maxP.price,
    minDate: minP.date,
    maxDate: maxP.date,
  };
}

/**
 * Domínio Y apertado ao preço da Melhor Oferta (+ banda se existir).
 */
export function nicePriceDomain(
  values: number[],
): { min: number; max: number; ticks: number[] } {
  const nums = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!nums.length) return { min: 0, max: 100, ticks: [0, 50, 100] };

  let lo = Math.min(...nums);
  let hi = Math.max(...nums);
  const mid = (lo + hi) / 2 || lo;

  const minSpan = Math.max(mid * 0.08, 8);
  if (hi - lo < minSpan) {
    const half = minSpan / 2;
    lo = mid - half;
    hi = mid + half;
  }

  const pad = Math.max((hi - lo) * 0.12, mid * 0.015, 3);
  lo = Math.max(0, lo - pad);
  hi = hi + pad;

  const ticks = buildTicks(lo, hi, 5);
  return {
    min: ticks[0],
    max: ticks[ticks.length - 1],
    ticks,
  };
}

function buildTicks(lo: number, hi: number, count: number): number[] {
  const span = hi - lo;
  if (!(span > 0)) return [roundNice(lo), roundNice(hi || lo + 1)];

  const rawStep = span / Math.max(2, count - 1);
  const step = niceStep(rawStep);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step * 0.01; v += step) {
    ticks.push(roundNice(v));
    if (ticks.length > 8) break;
  }
  if (ticks.length < 2) ticks.push(roundNice(hi));
  return ticks;
}

function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const frac = raw / exp;
  let nice: number;
  if (frac <= 1) nice = 1;
  else if (frac <= 2) nice = 2;
  else if (frac <= 2.5) nice = 2.5;
  else if (frac <= 5) nice = 5;
  else nice = 10;
  return nice * exp;
}

function roundNice(v: number): number {
  return Math.round(v * 100) / 100;
}
