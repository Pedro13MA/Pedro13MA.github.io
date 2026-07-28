import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DecisionSemaphore } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "−" : value < 0 ? "+" : "";
  return `${sign}${Math.abs(value).toFixed(1).replace(".", ",")}%`;
}

export const SEMAPHORE_LABEL: Record<
  DecisionSemaphore,
  { label: string; short: string; className: string }
> = {
  buy: {
    label: "Comprar Agora",
    short: "Comprar",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  fair: {
    label: "Preço Razoável",
    short: "Razoável",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  wait: {
    label: "Espera",
    short: "Espera",
    className: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
};
