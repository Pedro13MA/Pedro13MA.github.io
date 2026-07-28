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
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  fair: {
    label: "Preço Razoável",
    short: "Razoável",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  wait: {
    label: "Espera",
    short: "Espera",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};
