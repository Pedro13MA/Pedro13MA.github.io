"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Promotion } from "@/lib/types";
import { storeLogoUrl } from "@/lib/coupon-stores";
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
  opportunityCount?: number | null;
};

const COPIED_MS = 3000;

function StoreLogo({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const badge = STORE_BADGE_STYLES[slug] ?? STORE_BADGE_STYLES.default;
  if (failed) {
    return (
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase",
          badge.bg,
          badge.text,
        )}
        aria-hidden
      >
        {name.slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={storeLogoUrl(slug)}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

export function CouponCard({ promotion, opportunityCount }: Props) {
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
  const conditions = promotion.conditions?.trim() || promotion.description?.trim() || "";
  const detailHref =
    code && storeKey
      ? `/cupoes/${encodeURIComponent(storeKey)}/${encodeURIComponent(code.toUpperCase())}/`
      : storeKey
        ? `/cupoes/${encodeURIComponent(storeKey)}/`
        : null;

  const handleCopy = useCallback(async () => {
    if (!code) return;
    const ok = await copyCouponCode(code);
    if (ok) setCopied(true);
  }, [code]);

  const ctaLabel =
    opportunityCount != null && opportunityCount > 0
      ? `Ver ${opportunityCount} produtos elegíveis`
      : "Ver produtos elegíveis";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
        "border-slate-200/90 hover:border-sky-300 hover:shadow-md",
        badge.ring,
      )}
    >
      <div className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", badge.bg)} />

      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <StoreLogo slug={storeKey} name={promotion.storeName} />
            <p className="truncate text-sm font-semibold text-slate-900">
              {promotion.storeName}
            </p>
          </div>
          {discount ? (
            <span className="shrink-0 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200/80">
              {discount}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
          {title}
        </h3>

        <p className="mt-1.5 text-xs font-medium text-slate-500">{validity}</p>

        {conditions ? (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
            {conditions}
          </p>
        ) : null}

        {code ? (
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 w-full rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-left transition hover:bg-amber-100/80"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/80">
              {copied ? "Copiado ✓" : "Copiar código"}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-wide text-amber-900">
              {code}
            </p>
          </button>
        ) : (
          <p className="mt-4 text-xs text-slate-400">
            Sem código — campanha automática na loja
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          {detailHref ? (
            <Link
              href={detailHref}
              className={cn(
                "block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                "bg-sky-600 text-white hover:bg-sky-700",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
              )}
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
