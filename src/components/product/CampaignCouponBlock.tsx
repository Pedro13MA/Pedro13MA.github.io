"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { copyCouponCode } from "@/lib/coupon-utils";
import { cn, formatEUR } from "@/lib/utils";

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
    <div
      className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 px-4 py-4 shadow-sm sm:px-5"
    >
      <p className="text-sm font-bold text-amber-900">
        🔥 {campaign.title}
      </p>
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

export function CouponPriceBlock({ product }: Props) {
  const [copied, setCopied] = useState(false);
  const coupon = product.activeCoupon;
  const listPrice = product.listPrice ?? product.currentPrice;
  const effective = product.effectivePrice;
  const hasCouponPrice =
    effective != null && effective < listPrice && coupon?.code;

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

  if (!hasCouponPrice) return null;

  return (
    <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
        Preço final com cupão
      </p>
      <div className="mt-1 flex flex-wrap items-end gap-3">
        <p className="font-display text-3xl font-bold text-emerald-700">
          {formatEUR(effective!)}
        </p>
        <p className="text-lg text-slate-400 line-through">{formatEUR(listPrice)}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold text-emerald-900 ring-1 ring-emerald-200">
          {coupon!.code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            copied
              ? "bg-emerald-600 text-white"
              : "bg-emerald-600 text-white hover:bg-emerald-700",
          )}
        >
          {copied ? "Copiado ✓" : "Copiar código"}
        </button>
        {coupon?.affiliateUrl ? (
          <a
            href={coupon.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
          >
            Ir à loja
          </a>
        ) : null}
      </div>
      {coupon?.title ? (
        <p className="mt-2 text-xs text-emerald-900/80">{coupon.title}</p>
      ) : null}
    </div>
  );
}
