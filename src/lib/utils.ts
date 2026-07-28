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
  { label: string; short: string; emoji: string; className: string }
> = {
  buy: {
    label: "Excelente Oportunidade",
    short: "Excelente",
    emoji: "🟢",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  fair: {
    label: "Preço Competitivo",
    short: "Competitivo",
    emoji: "🟡",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  wait: {
    label: "Acima do Habitual",
    short: "Acima",
    emoji: "🔴",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function limiarIndexTone(value: number): {
  stroke: string;
  text: string;
  track: string;
} {
  if (value >= 85) {
    return { stroke: "#059669", text: "text-emerald-700", track: "#d1fae5" };
  }
  if (value >= 50) {
    return { stroke: "#d97706", text: "text-amber-700", track: "#fef3c7" };
  }
  return { stroke: "#e11d48", text: "text-rose-700", track: "#ffe4e6" };
}
