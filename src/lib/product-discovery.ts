/**
 * FASE 7.17 — Product Discovery (cliente).
 * Prefere `product.recommendations` da API; fallback com 1 searchProducts.
 * Sem IA / sem inventar produtos.
 */

import { searchProducts, summaryToProduct } from "@/lib/api";
import type { Product } from "@/lib/types";

export type DiscoveryCard = {
  slug: string;
  ean?: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  currentPrice: number;
  lymiarIndex?: number;
  storeCount?: number;
  leafId?: string | null;
  reason: string;
  deltaPrice?: number | null;
  deltaScore?: number | null;
  highlights?: string[];
  badge?: string | null;
};

export type ProductRecommendations = {
  alternatives?: DiscoveryCard[] | null;
  upgrades?: DiscoveryCard[] | null;
  savings?: DiscoveryCard[] | null;
  similar?: DiscoveryCard[] | null;
  alsoSearched?: DiscoveryCard[] | null;
  popular?: DiscoveryCard[] | null;
  recommended?: DiscoveryCard[] | null;
  meta?: {
    candidateCount?: number;
    insightConfidence?: number | null;
    source?: string;
  };
};

function scoreOf(p: Product): number {
  return p.decision?.lymiarIndex?.value ?? 0;
}

function storeCount(p: Product): number {
  const stores = new Set(
    (p.offers || []).map((o) => (o.slug || o.store || "").toLowerCase()).filter(Boolean),
  );
  return stores.size;
}

function vram(p: Product): number | null {
  const a = p.typedAttributes || p.knowledge?.attributes || {};
  const v = a.vram_gb ?? a.vram;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toCard(
  p: Product,
  reason: string,
  cur: Product,
  extras?: Partial<DiscoveryCard>,
): DiscoveryCard {
  const deltaPrice = p.currentPrice - cur.currentPrice;
  const deltaScore = scoreOf(p) - scoreOf(cur);
  const highlights: string[] = [];
  const cv = vram(cur);
  const nv = vram(p);
  if (cv != null && nv != null && nv !== cv) {
    const d = nv - cv;
    highlights.push(`${d > 0 ? "+" : ""}${d}GB VRAM`);
  }
  return {
    slug: p.slug,
    ean: p.ean,
    name: p.name,
    brand: p.brand,
    imageUrl: p.imageUrl,
    currentPrice: p.currentPrice,
    lymiarIndex: scoreOf(p),
    storeCount: storeCount(p),
    leafId: p.leafId,
    reason,
    deltaPrice,
    deltaScore,
    highlights,
    ...extras,
  };
}

/** Classifica um pool local (espelha hub). */
export function classifyDiscoveryPool(
  current: Product,
  pool: Product[],
): ProductRecommendations | null {
  const curPrice = current.currentPrice;
  if (!(curPrice > 0)) return null;
  const curScore = scoreOf(current);
  const curStores = storeCount(current);
  const curBrand = (current.brand || "").toLowerCase();

  const others = pool.filter((p) => p.ean !== current.ean && p.slug !== current.slug);
  if (!others.length) return null;

  const bandLo = curPrice * 0.85;
  const bandHi = curPrice * 1.15;
  const upHi = Math.max(curPrice * 1.2, curPrice + 80);
  const saveLo = curPrice * 0.65;

  const alternatives: DiscoveryCard[] = [];
  const upgrades: DiscoveryCard[] = [];
  const savings: DiscoveryCard[] = [];
  const similar: DiscoveryCard[] = [];
  const alsoBrand: DiscoveryCard[] = [];
  const alsoOther: DiscoveryCard[] = [];

  for (const p of others) {
    const sc = scoreOf(p);
    const st = storeCount(p);
    similar.push(toCard(p, "Produto semelhante na mesma categoria", current));
    const brand = (p.brand || "").toLowerCase();
    if (brand && curBrand && brand === curBrand) {
      alsoBrand.push(toCard(p, "Da mesma marca", current));
    } else {
      alsoOther.push(toCard(p, "Outra marca na mesma categoria", current));
    }
    if (
      p.currentPrice >= bandLo &&
      p.currentPrice <= bandHi &&
      (sc > curScore + 2 || (sc >= curScore && st > curStores))
    ) {
      alternatives.push(
        toCard(p, "Existe uma alternativa melhor neste intervalo de preço.", current),
      );
    }
    if (p.currentPrice > curPrice && p.currentPrice <= upHi && sc - curScore >= 3) {
      upgrades.push(toCard(p, "Upgrade com diferença de preço pequena", current));
    }
    if (
      p.currentPrice >= saveLo &&
      p.currentPrice < curPrice * 0.97 &&
      sc - curScore >= -5
    ) {
      savings.push(
        toCard(p, "Produto semelhante a um preço mais baixo", current),
      );
    }
  }

  const byScore = (a: DiscoveryCard, b: DiscoveryCard) =>
    (b.lymiarIndex || 0) - (a.lymiarIndex || 0);

  const bandRec = others.filter(
    (p) =>
      p.currentPrice >= curPrice * 0.75 && p.currentPrice <= curPrice * 1.25,
  );
  let recommended: DiscoveryCard[] | null = null;
  if (bandRec.length) {
    const best = [...bandRec].sort(
      (a, b) => scoreOf(b) - scoreOf(a) || storeCount(b) - storeCount(a),
    )[0];
    if (scoreOf(best) >= curScore) {
      recommended = [
        toCard(best, "Melhor compra observada nesta categoria (faixa de preço)", current, {
          badge: "Recomendado Lymiar",
        }),
      ];
    }
  }

  const hot = others.filter(
    (p) => p.isOnSale || (p.dropTodayPct != null && p.dropTodayPct >= 5),
  );
  const popular = hot.length
    ? hot
        .sort((a, b) => scoreOf(b) - scoreOf(a))
        .slice(0, 6)
        .map((p) => toCard(p, "Em destaque nas observações recentes", current))
    : null;

  const payload: ProductRecommendations = {
    alternatives: alternatives.sort(byScore).slice(0, 6) || null,
    upgrades: upgrades
      .sort((a, b) => (b.deltaScore || 0) - (a.deltaScore || 0))
      .slice(0, 6) || null,
    savings: savings
      .sort((a, b) => (a.deltaPrice || 0) - (b.deltaPrice || 0))
      .slice(0, 6) || null,
    similar: similar.sort(byScore).slice(0, 8) || null,
    alsoSearched: [...alsoBrand.slice(0, 4), ...alsoOther.slice(0, 4)].slice(0, 8) || null,
    popular,
    recommended,
    meta: { candidateCount: others.length, source: "client_search" },
  };

  // Normalize empty arrays to null
  for (const key of [
    "alternatives",
    "upgrades",
    "savings",
    "similar",
    "alsoSearched",
    "recommended",
  ] as const) {
    const v = payload[key];
    if (Array.isArray(v) && v.length === 0) payload[key] = null;
  }

  if (
    !payload.alternatives &&
    !payload.upgrades &&
    !payload.savings &&
    !payload.similar &&
    !payload.alsoSearched &&
    !payload.popular &&
    !payload.recommended
  ) {
    return null;
  }
  return payload;
}

export function recommendationsFromApi(
  raw: Product["recommendations"],
): ProductRecommendations | null {
  if (!raw || typeof raw !== "object") return null;
  const has =
    raw.alternatives?.length ||
    raw.upgrades?.length ||
    raw.savings?.length ||
    raw.similar?.length ||
    raw.alsoSearched?.length ||
    raw.popular?.length ||
    raw.recommended?.length;
  if (!has) return null;
  return raw as ProductRecommendations;
}

/** Extrai query de família (iphone, rtx 4070, ssd…) para semelhantes reais. */
export function similarSearchQuery(product: Product): string {
  const name = (product.name || "").toLowerCase();
  const chip = (product.chipsetModel || "").trim();
  if (chip) return chip;

  const familyMatch = name.match(
    /\b(iphone\s*\d+\s*(pro\s*max|pro|plus|mini)?|galaxy\s*[asz]?\d+\w*|pixel\s*\d+[a]?\w*|macbook\s*(air|pro)?|rtx\s*\d{3,4}\s*(ti|super)?|rx\s*\d{3,4}\s*(xt)?|ssd|nvme|air\s*fryer|fritadeira)\b/i,
  );
  if (familyMatch) return familyMatch[0].replace(/\s+/g, " ").trim();

  if (/\biphone\b/i.test(name)) return "iphone";
  if (/\bgalaxy\b/i.test(name)) return [product.brand, "galaxy"].filter(Boolean).join(" ");
  if (/\brtx\b/i.test(name)) return "rtx";

  const brandLeaf = [product.brand, product.leafId || product.subcategory]
    .filter(Boolean)
    .join(" ");
  if (brandLeaf.trim()) return brandLeaf.trim();

  return product.name.split(/\s+/).slice(0, 4).join(" ");
}

/** Lazy: 1 pesquisa semelhante quando a API não trouxe recommendations. */
export async function fetchClientRecommendations(
  product: Product,
  opts?: { forceSearch?: boolean },
): Promise<ProductRecommendations | null> {
  if (!opts?.forceSearch) {
    const fromApi = recommendationsFromApi(product.recommendations);
    if (fromApi) return fromApi;
  }

  const q = similarSearchQuery(product);
  if (!q.trim()) return null;
  try {
    const res = await searchProducts(q.trim(), {
      limit: 32,
      sortBy: "lymiar_desc",
      category: product.leafId || product.subcategory || undefined,
    });
    const pool = (res.results || []).map(summaryToProduct);
    return classifyDiscoveryPool(product, pool);
  } catch {
    return null;
  }
}

/** Melhor alternativa dentro do orçamento (comparador). */
export function pickBestWithinBudget(
  current: Product,
  pool: Product[],
  budget: number,
): DiscoveryCard | null {
  const eligible = pool.filter(
    (p) =>
      p.slug !== current.slug &&
      p.currentPrice > 0 &&
      p.currentPrice <= budget &&
      scoreOf(p) > scoreOf(current),
  );
  if (!eligible.length) return null;
  const best = [...eligible].sort(
    (a, b) => scoreOf(b) - scoreOf(a) || a.currentPrice - b.currentPrice,
  )[0];
  return toCard(
    best,
    "Sugestão dentro do orçamento actual",
    current,
    { badge: "Sugerir melhor" },
  );
}

export function bestSavingsTip(
  current: Product,
  recs: ProductRecommendations | null,
): { eur: number; name: string; slug: string } | null {
  const savings = recs?.savings;
  if (!savings?.length) return null;
  const top = savings[0];
  const eur = Math.abs(top.deltaPrice || 0);
  if (eur < 5) return null;
  return { eur, name: top.name, slug: top.slug };
}
