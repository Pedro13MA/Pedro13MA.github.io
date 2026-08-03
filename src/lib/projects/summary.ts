/**
 * FASE 7.13 — resumo e totais de projeto (só dados existentes).
 */

import type {
  Project,
  ProjectProductSnap,
  ProjectSummary,
} from "@/lib/projects/types";

export function slotUnitPrice(p: ProjectProductSnap | null): number {
  if (!p) return 0;
  if (p.offers?.length) return Math.min(...p.offers.map((o) => o.price));
  return p.currentPrice;
}

export function projectTotal(project: Project): number {
  return project.slots.reduce(
    (s, slot) => s + slotUnitPrice(slot.product),
    0,
  );
}

export function projectMinTotal(project: Project): number {
  return project.slots.reduce((s, slot) => {
    if (!slot.product) return s;
    const prices = slot.product.offers?.map((o) => o.price) || [
      slot.product.currentPrice,
    ];
    return s + Math.min(...prices);
  }, 0);
}

export function computeProjectSummary(project: Project): ProjectSummary {
  const filled = project.slots.filter((s) => s.product);
  const total = projectTotal(project);
  const minTotal = projectMinTotal(project);
  const stores = new Set<string>();
  let onSaleCount = 0;
  let couponCount = 0;
  for (const slot of filled) {
    const p = slot.product!;
    if (p.isOnSale) onSaleCount += 1;
    if (p.storeCouponsAvailable) couponCount += 1;
    const best = [...(p.offers || [])].sort((a, b) => a.price - b.price)[0];
    if (best) stores.add(best.store);
    else if (p.cheapestStore) stores.add(p.cheapestStore);
  }
  return {
    total,
    minTotal,
    storeCount: stores.size,
    savingVsInitial: Math.max(0, project.initialTotal - total),
    onSaleCount,
    couponCount,
    filledSlots: filled.length,
    emptySlots: project.slots.length - filled.length,
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
