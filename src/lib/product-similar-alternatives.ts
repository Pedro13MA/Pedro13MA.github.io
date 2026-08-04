/**
 * FASE 8.5 — filtrar alternativas já carregadas para produtos realmente semelhantes.
 * Não altera Discovery/API; só composição na página de produto.
 */

import type { DiscoveryCard, ProductRecommendations } from "@/lib/product-discovery";
import type { Product } from "@/lib/types";

const ABSURD_RE =
  /\b(adaptador|adapter|carregador|cabo|capa|pel[ií]cula|trotinete|scooter|cafeteira|caf[eé]|aspirador|frigor[ií]fico|microondas|liquidificador|auscultador|auricular|fone|mouse|rato|teclado|webcam|hub usb|powerbank|power bank)\b/i;

function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sameCategory(current: Product, card: DiscoveryCard): boolean {
  const curLeaf = fold(current.leafId || current.subcategory || "");
  const cardLeaf = fold(card.leafId || "");
  if (curLeaf && cardLeaf && curLeaf === cardLeaf) return true;

  // Sem leaf no cartão: aceitar só se o nome partilhar sinais da categoria actual.
  const name = fold(card.name || "");
  if (!curLeaf) return true;

  if (curLeaf.includes("smartphone") || curLeaf.includes("telemov")) {
    return /\b(iphone|galaxy|pixel|xiaomi|redmi|huawei|honor|oneplus|oppo|realme|samsung|apple|smartphone|telemovel)\b/i.test(
      name,
    );
  }
  if (curLeaf.includes("motherboard") || curLeaf.includes("placa.?m")) {
    return /\b(motherboard|mainboard|placa.?m[aã]e|b\d{3}|x\d{3}|z\d{3}|b650|b760|x670|z790)\b/i.test(
      name,
    );
  }
  if (curLeaf.includes("gpu") || curLeaf.includes("graf")) {
    return /\b(rtx|gtx|radeon|rx\s?\d|geforce|arc\s?a)\b/i.test(name);
  }
  if (curLeaf.includes("laptop") || curLeaf.includes("portat")) {
    return /\b(port[aá]til|laptop|notebook|macbook)\b/i.test(name);
  }
  if (curLeaf.includes("monitor")) {
    return /\b(monitor|ultrawide|\d{2}["']?\s?(led|oled|ips|va))\b/i.test(name);
  }

  // Outras folhas: exigir leafId coincidente (já falhou acima) → rejeitar se absurdo.
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
