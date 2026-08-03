/**
 * FASE 7.12 — otimização de compra (só ofertas observadas).
 * Portes: só se shippingCostEur conhecido; senão «desconhecido».
 */

import type {
  CartItem,
  OptimizeAssignment,
  OptimizeOption,
  OptimizeStrategyId,
} from "@/lib/smart-cart/types";

/** Penalização suave por loja extra no equilíbrio (não é porte inventado). */
const BALANCE_STORE_PENALTY = 12;

function activeItems(items: CartItem[]): CartItem[] {
  return items.filter((i) => i.status !== "bought" && i.quantity > 0);
}

function offersForItem(item: CartItem) {
  let offers = item.offers.filter((o) => o.price > 0);
  if (item.preferredStore) {
    const pref = offers.filter(
      (o) =>
        o.store === item.preferredStore ||
        o.storeName === item.preferredStore,
    );
    if (pref.length) offers = pref;
  }
  return offers;
}

function buildAssignments(
  items: CartItem[],
  pick: (item: CartItem) => { store: string; storeName: string; price: number; url: string; shippingCostEur: number | null } | null,
): OptimizeAssignment[] | null {
  const assignments: OptimizeAssignment[] = [];
  for (const item of items) {
    const chosen = pick(item);
    if (!chosen) return null;
    assignments.push({
      itemId: item.id,
      slug: item.slug,
      store: chosen.store,
      storeName: chosen.storeName,
      unitPrice: chosen.price,
      quantity: item.quantity,
      lineTotal: chosen.price * item.quantity,
      url: chosen.url,
      shippingCostEur: chosen.shippingCostEur ?? null,
    });
  }
  return assignments;
}

function summarize(
  id: OptimizeStrategyId,
  label: string,
  description: string,
  assignments: OptimizeAssignment[],
): OptimizeOption {
  const productTotal = assignments.reduce((s, a) => s + a.lineTotal, 0);
  const stores = [...new Set(assignments.map((a) => a.store))];
  let shippingUnknown = false;
  let shippingSum = 0;
  const shippingByStore = new Map<string, number | null>();
  for (const a of assignments) {
    if (!shippingByStore.has(a.store)) {
      shippingByStore.set(a.store, a.shippingCostEur);
    }
  }
  for (const cost of shippingByStore.values()) {
    if (cost == null) {
      shippingUnknown = true;
    } else {
      shippingSum += cost;
    }
  }
  const shippingTotal = shippingUnknown ? null : shippingSum;
  const grandTotal =
    shippingTotal != null ? productTotal + shippingTotal : productTotal;

  return {
    id,
    label,
    description,
    assignments,
    productTotal,
    shippingTotal,
    shippingUnknown,
    storeCount: stores.length,
    stores,
    grandTotal,
  };
}

/** Opção A — menor preço absoluto por linha. */
export function optimizeMinPrice(items: CartItem[]): OptimizeOption | null {
  const list = activeItems(items);
  if (!list.length) return null;
  const assignments = buildAssignments(list, (item) => {
    const offers = offersForItem(item);
    if (!offers.length) return null;
    const best = [...offers].sort((a, b) => a.price - b.price)[0];
    return {
      store: best.store,
      storeName: best.storeName,
      price: best.price,
      url: best.url,
      shippingCostEur: best.shippingCostEur ?? null,
    };
  });
  if (!assignments) return null;
  return summarize(
    "min_price",
    "Menor preço absoluto",
    "Cada produto na loja mais barata observada.",
    assignments,
  );
}

/**
 * Opção B — menor número de lojas, depois menor total.
 * Brute-force em subconjuntos de lojas (N lojas tipicamente pequeno).
 */
export function optimizeMinStores(items: CartItem[]): OptimizeOption | null {
  const list = activeItems(items);
  if (!list.length) return null;

  const allStores = new Set<string>();
  for (const item of list) {
    for (const o of offersForItem(item)) allStores.add(o.store);
  }
  const storeList = [...allStores];
  if (!storeList.length) return null;

  // Limitar explosão combinatória
  const maxStores = Math.min(storeList.length, 12);
  const stores = storeList.slice(0, maxStores);

  let best: OptimizeAssignment[] | null = null;
  let bestStoreCount = Infinity;
  let bestTotal = Infinity;

  const n = stores.length;
  const limit = 1 << n;
  for (let mask = 1; mask < limit; mask++) {
    const subset: string[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(stores[i]);
    }
    const set = new Set(subset);
    const assignments = buildAssignments(list, (item) => {
      const offers = offersForItem(item).filter((o) => set.has(o.store));
      if (!offers.length) return null;
      const bestOffer = [...offers].sort((a, b) => a.price - b.price)[0];
      return {
        store: bestOffer.store,
        storeName: bestOffer.storeName,
        price: bestOffer.price,
        url: bestOffer.url,
        shippingCostEur: bestOffer.shippingCostEur ?? null,
      };
    });
    if (!assignments) continue;
    const total = assignments.reduce((s, a) => s + a.lineTotal, 0);
    const sc = subset.length;
    if (
      sc < bestStoreCount ||
      (sc === bestStoreCount && total < bestTotal)
    ) {
      bestStoreCount = sc;
      bestTotal = total;
      best = assignments;
    }
  }

  if (!best) return null;
  return summarize(
    "min_stores",
    "Menor número de lojas",
    "Concentra a compra no menor número de lojas possível.",
    best,
  );
}

/** Opção C — equilíbrio: total + penalização por loja extra. */
export function optimizeBalanced(items: CartItem[]): OptimizeOption | null {
  const list = activeItems(items);
  if (!list.length) return null;

  const allStores = new Set<string>();
  for (const item of list) {
    for (const o of offersForItem(item)) allStores.add(o.store);
  }
  const storeList = [...allStores].slice(0, 12);
  if (!storeList.length) return null;

  let best: OptimizeAssignment[] | null = null;
  let bestScore = Infinity;

  const n = storeList.length;
  const limit = 1 << n;
  for (let mask = 1; mask < limit; mask++) {
    const subset: string[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(storeList[i]);
    }
    const set = new Set(subset);
    const assignments = buildAssignments(list, (item) => {
      const offers = offersForItem(item).filter((o) => set.has(o.store));
      if (!offers.length) return null;
      const bestOffer = [...offers].sort((a, b) => a.price - b.price)[0];
      return {
        store: bestOffer.store,
        storeName: bestOffer.storeName,
        price: bestOffer.price,
        url: bestOffer.url,
        shippingCostEur: bestOffer.shippingCostEur ?? null,
      };
    });
    if (!assignments) continue;
    const total = assignments.reduce((s, a) => s + a.lineTotal, 0);
    const score = total + subset.length * BALANCE_STORE_PENALTY;
    if (score < bestScore) {
      bestScore = score;
      best = assignments;
    }
  }

  if (!best) return null;
  return summarize(
    "balanced",
    "Melhor equilíbrio",
    `Equilibra preço e número de lojas (penalização ${BALANCE_STORE_PENALTY} €/loja — heurística, não é porte).`,
    best,
  );
}

export function optimizeAll(items: CartItem[]): OptimizeOption[] {
  const opts = [
    optimizeMinPrice(items),
    optimizeMinStores(items),
    optimizeBalanced(items),
  ].filter(Boolean) as OptimizeOption[];
  // Deduplicar opções idênticas em assignments
  const seen = new Set<string>();
  return opts.filter((o) => {
    const key = o.assignments
      .map((a) => `${a.itemId}:${a.store}:${a.unitPrice}`)
      .sort()
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cartProductTotalNaive(items: CartItem[]): number {
  return activeItems(items).reduce((sum, item) => {
    const offers = offersForItem(item);
    const best = offers.length
      ? Math.min(...offers.map((o) => o.price))
      : item.priceAtAdd;
    return sum + best * item.quantity;
  }, 0);
}

export function parseShippingCostEur(
  raw: string | null | undefined,
): number | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  if (!t || t === "varies" || t === "n/d" || t.includes("grátis") || t.includes("gratis")) {
    if (t.includes("grátis") || t.includes("gratis") || t === "free") return 0;
    return null;
  }
  const m = t.replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
}
