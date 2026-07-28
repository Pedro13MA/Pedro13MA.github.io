import type { Promotion } from "@/lib/types";

/** Normaliza slug AWIN (wortenpt → worten) para filtros do hub. */
export function normalizeCouponStoreSlug(slug: string): string {
  const s = (slug || "").trim().toLowerCase();
  if (s.startsWith("worten")) return "worten";
  if (s.startsWith("globaldata")) return "globaldata";
  if (s.startsWith("fnac")) return "fnac";
  if (s.startsWith("pccomponentes")) return "pccomponentes";
  return s;
}

export function formatCouponDiscount(promo: Promotion): string | null {
  if (promo.discountKind === "percent" && promo.discountValue != null) {
    return `${promo.discountValue}%`;
  }
  if (promo.discountKind === "amount" && promo.discountValue != null) {
    return `${promo.discountValue}€`;
  }
  return null;
}

export function formatCouponTitle(promo: Promotion): string {
  if (promo.title?.trim()) return promo.title.trim();
  const discount = formatCouponDiscount(promo);
  if (discount) return `Desconto de ${discount}`;
  return promo.description?.trim() || "Oferta parceira";
}

export function formatCouponValidity(promo: Promotion): string {
  if (promo.endDate) {
    const d = new Date(promo.endDate);
    if (!Number.isNaN(d.getTime())) {
      return `Válido até ${d.toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
      })}`;
    }
  }
  if (promo.description?.trim()) return promo.description.trim();
  return "Consulte condições na loja";
}

export async function copyCouponCode(code: string): Promise<boolean> {
  const text = code.trim();
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export const COUPON_FILTER_STORES = [
  { id: "all", label: "Todas as Lojas" },
  { id: "worten", label: "Worten" },
  { id: "globaldata", label: "Globaldata" },
] as const;

export type CouponStoreFilterId = (typeof COUPON_FILTER_STORES)[number]["id"];

export const STORE_BADGE_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  worten: { bg: "bg-red-600", text: "text-white", ring: "ring-red-200" },
  globaldata: { bg: "bg-sky-700", text: "text-white", ring: "ring-sky-200" },
  fnac: { bg: "bg-yellow-500", text: "text-slate-900", ring: "ring-yellow-200" },
  pccomponentes: { bg: "bg-orange-500", text: "text-white", ring: "ring-orange-200" },
  default: { bg: "bg-slate-700", text: "text-white", ring: "ring-slate-200" },
};
