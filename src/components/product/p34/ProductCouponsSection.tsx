"use client";

import {
  ActiveCampaignBanner,
  StoreCouponsInfoBanner,
} from "@/components/product/CampaignCouponBlock";
import type { Product } from "@/lib/types";

type Props = { product: Product };

/**
 * Cupões / campanhas — sempre separados do preço.
 * Empty state explícito quando não há cupões.
 */
export function ProductCouponsSection({ product }: Props) {
  const hasCampaign = Boolean(product.activeCampaign);
  const hasCoupons =
    product.storeCouponsAvailable ||
    Boolean(product.activeCoupon?.code) ||
    Boolean(product.offers?.some((o) => o.couponCode));

  return (
    <section
      id="cupoes"
      className="scroll-mt-20 space-y-3"
      aria-labelledby="p34-coupons-heading"
    >
      <h2
        id="p34-coupons-heading"
        className="font-display text-xl font-bold text-slate-900"
      >
        Cupões e campanhas
      </h2>
      <p className="text-sm text-slate-500">
        Informativo — o preço Lymiar não inclui descontos de cupão.
      </p>
      {hasCampaign || hasCoupons ? (
        <div className="space-y-3">
          <ActiveCampaignBanner product={product} />
          <StoreCouponsInfoBanner product={product} />
        </div>
      ) : (
        <div
          className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5"
          role="status"
        >
          <p className="text-sm text-slate-600">
            Sem cupões ou campanhas conhecidos para este produto neste momento.
          </p>
        </div>
      )}
    </section>
  );
}

export function ProductStoresEmpty() {
  return (
    <div
      className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center"
      role="status"
    >
      <p className="text-sm text-slate-600">
        Ainda não há lojas com oferta activa para este produto.
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Volta mais tarde ou activa um alerta no hero quando disponível.
      </p>
    </div>
  );
}

export function ProductHistoryHint({ thin }: { thin: boolean }) {
  if (!thin) return null;
  return (
    <p className="text-sm text-slate-500" role="status">
      Histórico ainda curto — o gráfico abaixo mostra o que já observámos. Dados
      mais ricos chegarão com o tempo.
    </p>
  );
}
