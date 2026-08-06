"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActiveCampaignBanner,
  StoreCouponsInfoBanner,
} from "@/components/product/CampaignCouponBlock";
import { getCoupons, getStoreCampaigns } from "@/lib/api";
import type { Product } from "@/lib/types";

type Props = { product: Product };

function productHasAttachedPromo(product: Product): boolean {
  return Boolean(
    product.activeCampaign ||
      product.storeCouponsAvailable ||
      product.activeCoupon?.code ||
      product.offers?.some((o) => o.couponCode || o.couponLabel),
  );
}

function uniqueOfferStores(product: Product): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of product.offers || []) {
    const raw = (o.slug || o.store || "").trim().toLowerCase();
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  return out;
}

/**
 * Cupões / campanhas — só aparece se alguma loja deste produto
 * tiver campanha ou cupão conhecido. Sem empty state.
 */
export function ProductCouponsSection({ product }: Props) {
  const attached = useMemo(() => productHasAttachedPromo(product), [product]);
  const stores = useMemo(() => uniqueOfferStores(product), [product]);
  const [storeHasPromo, setStoreHasPromo] = useState(attached);

  useEffect(() => {
    if (attached) {
      setStoreHasPromo(true);
      return;
    }
    if (!stores.length) {
      setStoreHasPromo(false);
      return;
    }

    let cancelled = false;
    Promise.all(
      stores.map(async (store) => {
        const [campaigns, coupons] = await Promise.all([
          getStoreCampaigns(store).catch(() => null),
          getCoupons(store).catch(() => null),
        ]);
        const hasCampaign = Boolean(
          campaigns &&
            ((Array.isArray(campaigns.campaigns) &&
              campaigns.campaigns.length > 0) ||
              (Array.isArray(campaigns.coupons) && campaigns.coupons.length > 0)),
        );
        const hasCoupon = Boolean(coupons?.coupons?.length);
        return hasCampaign || hasCoupon;
      }),
    )
      .then((flags) => {
        if (!cancelled) setStoreHasPromo(flags.some(Boolean));
      })
      .catch(() => {
        if (!cancelled) setStoreHasPromo(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attached, stores]);

  if (!storeHasPromo) return null;

  return (
    <section
      id="cupoes"
      className="pdp-section scroll-mt-20 space-y-3"
      aria-labelledby="p34-coupons-heading"
    >
      <p className="pdp-kicker">Complemento</p>
      <h2
        id="p34-coupons-heading"
        className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl"
      >
        Cupões e campanhas
      </h2>
      <p className="text-sm text-slate-500">
        À parte do preço observado — o cupão nunca entra no histórico como se
        já estivesse aplicado.
      </p>
      <div className="space-y-3">
        <ActiveCampaignBanner product={product} />
        <StoreCouponsInfoBanner product={product} />
        {!productHasAttachedPromo(product) ? (
          <div className="rounded-xl border border-sky-200/90 bg-sky-50/70 px-4 py-3">
            <p className="text-sm font-semibold text-sky-950">
              Existe campanha ou cupão numa loja deste produto
            </p>
            <p className="mt-1 text-xs text-sky-900/75">
              Pelo menos uma loja onde este produto está à venda tem campanha ou
              cupão activo. Consulta condições na loja — o preço Lymiar continua
              a ser o preço real encontrado.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ProductStoresEmpty() {
  return (
    <div
      className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center"
      role="status"
    >
      <p className="text-sm text-slate-600">
        Ainda não há lojas com oferta activa para este produto.
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Volta mais tarde ou cria um alerta no topo da página.
      </p>
    </div>
  );
}

export function ProductHistoryHint({ thin }: { thin: boolean }) {
  if (!thin) return null;
  return (
    <p className="text-sm text-slate-500" role="status">
      Histórico ainda curto — o gráfico mostra o que já observámos. Não inventamos
      certeza com poucos dados.
    </p>
  );
}
