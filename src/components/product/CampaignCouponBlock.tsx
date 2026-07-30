"use client";

import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ActiveCampaignBanner({ product }: Props) {
  const campaign = product.activeCampaign;
  if (!campaign) return null;

  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/70 px-4 py-3">
      <p className="text-sm font-semibold text-sky-950">
        🎟️ Existe campanha disponível nesta loja
      </p>
      <p className="mt-1 text-xs text-sky-900/75">
        Este produto pode estar abrangido por uma campanha. O preço Limiar não é
        alterado.
      </p>
    </div>
  );
}

/** Banner informativo — sem cálculo de preço com cupão. */
export function StoreCouponsInfoBanner({ product }: Props) {
  const available =
    product.storeCouponsAvailable ||
    Boolean(product.activeCoupon?.code) ||
    Boolean(product.offers?.some((o) => o.couponCode));

  if (!available) return null;

  // Evitar duplicar se ActiveCampaignBanner já cobre o mesmo sinal
  if (product.activeCampaign) return null;

  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/70 px-4 py-3">
      <p className="text-sm font-semibold text-sky-950">
        🎟️ Existe campanha disponível nesta loja
      </p>
      <p className="mt-1 text-xs text-sky-900/75">
        Este produto pode estar abrangido por uma campanha. Consulta condições na
        loja — o preço Limiar continua a ser o preço real encontrado.
      </p>
    </div>
  );
}

/** @deprecated Prefer StoreCouponsInfoBanner — sem preço estimado. */
export function CouponPriceBlock(_props: Props) {
  return null;
}

/** Removido: smart basket misturava cupão com poupança estimada. */
export function SmartBasketBanner(_props: Props) {
  return null;
}
