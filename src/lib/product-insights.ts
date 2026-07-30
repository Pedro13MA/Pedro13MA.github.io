/** Insights de produto para a página de detalhe Limiar (UI only). */

import type { PricePoint, Product, Seasonality, SeasonalMarker } from "@/lib/types";

const STORAGE_RE =
  /\b(\d+(?:[.,]\d+)?)\s*(tb|gb)\b/gi;

export function isAbsoluteHistoricalMin(
  current: number | null | undefined,
  historicalMin: number | null | undefined,
): boolean {
  if (current == null || historicalMin == null) return false;
  if (!(current > 0) || !(historicalMin > 0)) return false;
  // Estritamente igual (tolerância de cêntimo por arredondamento)
  return Math.abs(current - historicalMin) < 0.015;
}

/** Extrai capacidade em GB a partir do nome (256GB, 1TB → 1024). */
export function parseStorageGb(text: string | null | undefined): number | null {
  if (!text) return null;
  let best: number | null = null;
  const re = new RegExp(STORAGE_RE.source, STORAGE_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) != null) {
    const n = Number(m[1].replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) continue;
    const unit = m[2].toLowerCase();
    const gb = unit === "tb" ? n * 1024 : n;
    // Preferir valores típicos de armazenamento (não RAM 8/16 se houver 256+)
    if (best == null || gb > best) best = gb;
  }
  return best;
}

/** Remove sufixos de capacidade para comparar variantes da mesma gama. */
export function stripCapacityFromName(name: string): string {
  return name
    .replace(STORAGE_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProductSummary(product: Product): string {
  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.category && product.category !== "Other") {
    parts.push(product.category);
  }
  if (product.chipsetModel) parts.push(product.chipsetModel);
  if (product.vramSpec) parts.push(product.vramSpec);

  const storage = parseStorageGb(product.name);
  if (storage != null) {
    parts.push(
      storage >= 1024
        ? `${(storage / 1024).toFixed(storage % 1024 === 0 ? 0 : 1)} TB`
        : `${Math.round(storage)} GB`,
    );
  }

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
  if (indexHint && indexHint.length < 120) {
    return `${lead}. ${indexHint}`;
  }
  return `${lead}. Comparação factual entre lojas e histórico Limiar.`;
}

export type VariantValueTip = {
  message: string;
  siblingSlug: string;
  siblingName: string;
  siblingPrice: number;
  pricePerGbCurrent: number;
  pricePerGbSibling: number;
};

export function findBetterStorageVariantTip(opts: {
  currentName: string;
  currentSlug: string;
  currentPrice: number;
  siblings: Array<{
    slug: string;
    name: string;
    currentPrice: number;
  }>;
}): VariantValueTip | null {
  const currentGb = parseStorageGb(opts.currentName);
  if (currentGb == null || currentGb <= 0 || opts.currentPrice <= 0) return null;

  const base = stripCapacityFromName(opts.currentName).toLowerCase();
  const currentPerGb = opts.currentPrice / currentGb;
  let best: VariantValueTip | null = null;

  for (const s of opts.siblings) {
    if (!s.slug || s.slug === opts.currentSlug) continue;
    if (!(s.currentPrice > 0)) continue;
    const gb = parseStorageGb(s.name);
    if (gb == null || gb <= currentGb) continue;
    const siblingBase = stripCapacityFromName(s.name).toLowerCase();
    // Exigir sobreposição razoável de tokens (mesma gama)
    const baseTokens = new Set(base.split(/\s+/).filter((t) => t.length > 2));
    const sibTokens = siblingBase.split(/\s+/).filter((t) => t.length > 2);
    const overlap = sibTokens.filter((t) => baseTokens.has(t)).length;
    if (overlap < Math.min(2, baseTokens.size)) continue;

    const perGb = s.currentPrice / gb;
    if (perGb >= currentPerGb * 0.98) continue; // não é claramente melhor
    const savingPct = ((currentPerGb - perGb) / currentPerGb) * 100;
    if (savingPct < 5) continue;

    const label =
      gb >= 1024
        ? `${(gb / 1024).toFixed(gb % 1024 === 0 ? 0 : 1)} TB`
        : `${Math.round(gb)} GB`;
    const tip: VariantValueTip = {
      message: `A versão de ${label} está actualmente a um preço mais vantajoso por gigabyte do que esta.`,
      siblingSlug: s.slug,
      siblingName: s.name,
      siblingPrice: s.currentPrice,
      pricePerGbCurrent: currentPerGb,
      pricePerGbSibling: perGb,
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
    return `Nos últimos registos este produto raramente baixou dos ${floor.toFixed(2).replace(".", ",")} € — já estás no mínimo histórico absoluto.`;
  }

  if (historicalMin < currentPrice * 0.97) {
    return `Nos últimos 12 meses este produto raramente baixou dos ${floor.toFixed(2).replace(".", ",")} €. O preço costuma descer para cerca de ${campaignTarget.toFixed(2).replace(".", ",")} € durante campanhas.`;
  }

  return `Sugestão Limiar: um alvo perto de ${campaignTarget.toFixed(2).replace(".", ",")} € é realista face ao histórico recente.`;
}

/** Estima meses promocionais a partir do histórico embutido. */
export function estimateSeasonality(
  history: PricePoint[],
  currentPrice: number,
  timesBelowHint = 0,
): Seasonality {
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
      return { month, label: "Sem dados", kind: "neutral" as const };
    }
    if (avg <= globalAvg * 0.97) {
      const drop = ((globalAvg - avg) / globalAvg) * 100;
      return {
        month,
        label: `Historicamente ~${drop.toFixed(0)}% abaixo da média`,
        kind: "promo" as const,
      };
    }
    if (avg >= globalAvg * 1.04) {
      return {
        month,
        label: "Historicamente acima da média",
        kind: "peak" as const,
      };
    }
    return { month, label: "Preço estável", kind: "neutral" as const };
  });

  const promoMonths = markers.filter((m) => m.kind === "promo");
  const avgDrop =
    promoMonths.length > 0
      ? promoMonths
          .map((m) => {
            const avg = monthAvg.get(m.month);
            if (avg == null || !(globalAvg > 0)) return 0;
            return ((globalAvg - avg) / globalAvg) * 100;
          })
          .reduce((a, b) => a + b, 0) / promoMonths.length
      : 0;

  const promoNames = promoMonths
    .map((m) =>
      ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][
        m.month - 1
      ],
    )
    .join(", ");

  let note: string;
  if (promoMonths.length === 0) {
    note =
      "Ainda sem padrão sazonal claro — o Limiar continua a monitorizar o histórico multi-loja.";
  } else {
    note = `Costuma entrar em promoção em ${promoNames}${
      avgDrop >= 3 ? `, com descidas médias de cerca de ${avgDrop.toFixed(0)}%` : ""
    }.`;
  }

  let timesBelow = timesBelowHint;
  if (timesBelow === 0 && history.length > 2 && currentPrice > 0) {
    timesBelow = history.filter((p) => p.price > 0 && p.price < currentPrice - 0.01).length;
  }

  return { markers, note, timesBelowCurrent12m: timesBelow };
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
  if (hours < 48) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;
  return `há ${Math.floor(days / 30)} mês${days >= 60 ? "es" : ""}`;
}

export function volatilityLabelPt(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return "Sem dados";
  if (pct < 5) return "Baixa";
  if (pct < 15) return "Média";
  return "Alta";
}
