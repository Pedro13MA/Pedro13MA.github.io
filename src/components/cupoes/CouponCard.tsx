"use client";

import { useCallback, useEffect, useState } from "react";
import type { Promotion } from "@/lib/types";
import {
  copyCouponCode,
  formatCouponDiscount,
  formatCouponTitle,
  formatCouponValidity,
  normalizeCouponStoreSlug,
  STORE_BADGE_STYLES,
} from "@/lib/coupon-utils";
import { cn } from "@/lib/utils";

type Props = {
  promotion: Promotion;
};

const COPIED_MS = 3000;

export function CouponCard({ promotion }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(t);
  }, [copied]);

  const storeKey = normalizeCouponStoreSlug(promotion.storeSlug);
  const badge = STORE_BADGE_STYLES[storeKey] ?? STORE_BADGE_STYLES.default;
  const discount = formatCouponDiscount(promotion);
  const title = formatCouponTitle(promotion);
  const validity = formatCouponValidity(promotion);
  const code = promotion.code?.trim() || "";
  const affiliateUrl = promotion.url?.trim() || "";

  const handleAction = useCallback(async () => {
    if (code) {
      const ok = await copyCouponCode(code);
      if (ok) setCopied(true);
    }
    if (affiliateUrl) {
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    }
  }, [code, affiliateUrl]);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-dashed bg-white shadow-sm transition-all",
        "border-sky-200/90 hover:border-sky-400 hover:shadow-md",
        badge.ring,
      )}
    >
      <div className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", badge.bg)} />

      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase",
                badge.bg,
                badge.text,
              )}
              aria-hidden
            >
              {promotion.storeName.slice(0, 2)}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">
              {promotion.storeName}
            </p>
          </div>
          {discount ? (
            <span
              className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200/80"
            >
              {discount}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
          {title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{validity}</p>

        {code ? (
          <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/80">
              Código
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-wide text-amber-900">
              {code}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-400">Sem código — desconto automático na loja</p>
        )}

        <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleAction}
            disabled={!affiliateUrl}
            className={cn(
              "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
              copied
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-500",
            )}
          >
            {copied ? "Copiado! ✓" : code ? "Copiar e Ir para a Loja" : "Ir para a Loja"}
          </button>
        </div>
      </div>
    </article>
  );
}
