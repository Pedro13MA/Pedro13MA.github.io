import type { Product } from "@/lib/types";

export type OpportunitySeal = {
  emoji: string;
  label: string;
  className: string;
  semaphore: Product["decision"]["semaphore"];
};

/** Selo de oportunidade — legível, sem efeitos pesados. */
export function getOpportunitySeal(product: Product): OpportunitySeal {
  if (product.decision.isHistoricalMin) {
    return {
      emoji: "🔥",
      label: "Mínimo Histórico",
      className: "border-orange-200 bg-orange-50 text-orange-900",
      semaphore: "buy",
    };
  }
  if (product.decision.semaphore === "buy") {
    return {
      emoji: "🟢",
      label: "Excelente oportunidade",
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      semaphore: "buy",
    };
  }
  if (product.decision.semaphore === "fair") {
    return {
      emoji: "🟡",
      label: "Bom preço",
      className: "border-amber-200 bg-amber-50 text-amber-900",
      semaphore: "fair",
    };
  }
  return {
    emoji: "🔴",
    label: "Vale a pena esperar",
    className: "border-rose-200 bg-rose-50 text-rose-900",
    semaphore: "wait",
  };
}
