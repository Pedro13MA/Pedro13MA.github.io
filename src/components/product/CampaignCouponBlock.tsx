"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { copyCouponCode } from "@/lib/coupon-utils";
import { cn } from "@/lib/utils";

type Props = { product: Product };

export function ActiveCampaignBanner({ product }: Props) {
  const campaign = product.activeCampaign;
  if (!campaign) return null;

  const endLabel = campaign.endDate
    ? new Date(campaign.endDate).toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 px-4 py-4 shadow-sm sm:px-5">
      <p className="text-sm font-bold text-amber-900">🔥 {campaign.title}</p>
      {campaign.rulesSummary ? (
        <p className="mt-1 text-sm text-amber-950/85">{campaign.rulesSummary}</p>
      ) : campaign.description ? (
        <p className="mt-1 text-sm text-amber-950/85">{campaign.description}</p>
      ) : null}
      {endLabel ? (
        <p className="mt-2 text-xs text-amber-800/80">Válida até {endLabel}</p>
      ) : null}
      {campaign.couponCode ? (
        <p className="mt-2 text-xs font-medium text-amber-900">
          Código: <span className="font-mono font-bold">{campaign.couponCode}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Banner informativo — sem cálculo de preço com cupão. */
export function StoreCouponsInfoBanner({ product }: Props) {
  const coupon = product.activeCoupon;
  const available =
    product.storeCouponsAvailable ||
    Boolean(coupon?.code) ||
    Boolean(product.offers?.some((o) => o.couponCode));

  if (!available) return null;

  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/70 px-4 py-3">
      <p className="text-sm font-semibold text-sky-950">
        🎟️ Existem campanhas disponíveis nesta loja
      </p>
      <p className="mt-1 text-xs text-sky-900/75">
        Os cupões são informativos e não alteram o preço Limiar. Consulta condições na
        loja.
      </p>
      {coupon?.code ? (
        <p className="mt-2 text-xs text-sky-900">
          Ex.: <span className="font-mono font-bold">{coupon.code}</span>
          {coupon.discountPct != null ? ` · ${coupon.discountPct}%` : ""}
          {coupon.title ? ` — ${coupon.title}` : ""}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Prefer StoreCouponsInfoBanner — sem preço estimado. */
export function CouponPriceBlock({ product }: Props) {
  const [copied, setCopied] = useState(false);
  const coupon = product.activeCoupon;

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!coupon?.code) return;
    const ok = await copyCouponCode(coupon.code);
    if (ok) setCopied(true);
  }, [coupon?.code]);

  if (!coupon?.code) return null;

  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">
        Campanha disponível
      </p>
      <p className="mt-1 text-sm text-sky-950">
        {coupon.title || "Cupão na loja"} — aplica condições da loja
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold text-sky-900 ring-1 ring-sky-200">
          {coupon.code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            copied
              ? "bg-sky-600 text-white"
              : "bg-sky-600 text-white hover:bg-sky-700",
          )}
        >
          {copied ? "Copiado ✓" : "Copiar código"}
        </button>
      </div>
    </div>
  );
}

/** Removido: smart basket misturava cupão com poupança estimada. */
export function SmartBasketBanner(_props: Props) {
  return null;
}
