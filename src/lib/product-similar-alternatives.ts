/**
 * FASE 8.5.1 — filtrar alternativas leaf-first.
 * Não altera Discovery/API ranking; só composição na página de produto.
 *
 * Regra: se o produto actual tem leaf utilizável, só aceitar cards com o
 * mesmo leaf_id. Nunca misturar por subcategory legacy (ex.: console).
 */

import type { DiscoveryCard, ProductRecommendations } from "@/lib/product-discovery";
import type { Product } from "@/lib/types";

const ABSURD_RE =
  /\b(adaptador|adapter|carregador|cabo|capa|pel[ií]cula|trotinete|scooter|cafeteira|caf[eé]|aspirador|frigor[ií]fico|microondas|liquidificador|auscultador|auricular|fone|hub usb|powerbank|power bank)\b/i;

const UNUSABLE_LEAF =
  /^(unclassified|non_catalog|unmapped|other|outros|accessory)?$/i;

function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function usableLeaf(raw: string | null | undefined): string {
  const leaf = fold(raw || "");
  if (!leaf || UNUSABLE_LEAF.test(leaf)) return "";
  return leaf;
}

function sameCategory(current: Product, card: DiscoveryCard): boolean {
  const curLeaf = usableLeaf(current.leafId);
  const cardLeaf = usableLeaf(card.leafId);

  // Leaf-first: ambos com leaf → exigir igualdade exacta (game ≠ controller ≠ storage)
  if (curLeaf && cardLeaf) {
    return curLeaf === cardLeaf;
  }

  // Produto actual com leaf; cartão sem leaf → rejeitar (não misturar por subcategory)
  if (curLeaf && !cardLeaf) {
    return false;
  }

  // Sem leaf no produto: fallback legado controlado (só sinais de nome)
  const legacyKey = fold(current.subcategory || "");
  const name = fold(card.name || "");
  if (!legacyKey) return !ABSURD_RE.test(name);

  if (legacyKey.includes("smartphone") || legacyKey.includes("telemov")) {
    return /\b(iphone|galaxy|pixel|xiaomi|redmi|huawei|honor|oneplus|oppo|realme|samsung|apple|smartphone|telemovel)\b/i.test(
      name,
    );
  }
  if (legacyKey.includes("motherboard") || legacyKey.includes("placa")) {
    return /\b(motherboard|mainboard|placa.?m[aã]e|b\d{3}|x\d{3}|z\d{3}|b650|b760|x670|z790)\b/i.test(
      name,
    );
  }
  if (legacyKey.includes("gpu") || legacyKey.includes("graf")) {
    return /\b(rtx|gtx|radeon|rx\s?\d|geforce|arc\s?a)\b/i.test(name);
  }
  if (legacyKey.includes("laptop") || legacyKey.includes("portat")) {
    return /\b(port[aá]til|laptop|notebook|macbook)\b/i.test(name);
  }
  if (legacyKey.includes("monitor")) {
    return /\b(monitor|ultrawide|\d{2}["']?\s?(led|oled|ips|va))\b/i.test(name);
  }

  return !ABSURD_RE.test(name);
}

function priceClose(current: number, other: number): boolean {
  if (!(current > 0) || !(other > 0)) return false;
  const lo = current * 0.55;
  const hi = current * 1.55;
  return other >= lo && other <= hi;
}

/**
 * Junta listas da API (já carregadas) e filtra para ≤6 semelhantes reais.
 */
export function pickSimilarAlternatives(
  product: Product,
  recs: ProductRecommendations | null,
  max = 6,
): DiscoveryCard[] {
  if (!recs) return [];

  const pool: DiscoveryCard[] = [];
  const seen = new Set<string>();

  const push = (items: DiscoveryCard[] | null | undefined) => {
    for (const item of items || []) {
      const key = (item.slug || item.ean || item.name || "").toLowerCase();
      if (!key || seen.has(key)) continue;
      if (key === product.slug.toLowerCase()) continue;
      if (ABSURD_RE.test(item.name || "")) continue;
      if (!sameCategory(product, item)) continue;
      if (!priceClose(product.currentPrice, item.currentPrice)) continue;
      seen.add(key);
      pool.push(item);
    }
  };

  // Preferir semelhantes / alternativas; ignorar popular/alsoSearched/upgrade soltos.
  push(recs.similar);
  push(recs.alternatives);
  push(recs.savings);
  push(recs.upgrades);

  return pool
    .sort(
      (a, b) =>
        Math.abs(a.currentPrice - product.currentPrice) -
        Math.abs(b.currentPrice - product.currentPrice),
    )
    .slice(0, max);
}
