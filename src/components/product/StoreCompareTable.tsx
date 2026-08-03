"use client";

import { useState } from "react";
import type { Offer } from "@/lib/types";
import { storeDisplayName, storeLogoUrl } from "@/lib/storeLogos";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatEUR } from "@/lib/utils";

type Props = { offers: Offer[] };

function StoreCellLogo({
  name,
  slug,
  logoFromOffer,
}: {
  name: string;
  slug: string;
  logoFromOffer?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const src = logoFromOffer || storeLogoUrl(slug || name);
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  if (failed || !src) {
    return (
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600"
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

function stockStatus(offer: Offer): {
  label: string;
  className: string;
} {
  if (offer.inStock === false || offer.stockStatus === "out_of_stock") {
    return { label: "Esgotado", className: "text-rose-700" };
  }
  if (offer.inStock === true || offer.stockStatus === "in_stock") {
    return { label: "Disponível", className: "text-emerald-700" };
  }
  return { label: "Stock n/d", className: "text-slate-500" };
}

/**
 * Tabela: Logo + Loja | Preço | Cupão | Comprar.
 * Preço permanece visível mesmo esgotado (comparação).
 */
export function StoreCompareTable({ offers }: Props) {
  const sorted = [...offers].sort((a, b) => {
    const pa =
      a.effectivePrice != null && a.effectivePrice < a.price ? a.effectivePrice : a.price;
    const pb =
      b.effectivePrice != null && b.effectivePrice < b.price ? b.effectivePrice : b.price;
    return pa - pb;
  });

  if (!sorted.length) {
    return (
      <p className="text-sm text-slate-500">
        Sem ofertas de loja para este produto neste momento.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-[#FAFAFA] text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 font-semibold">Loja</th>
            <th className="px-4 py-3 font-semibold">Preço</th>
            <th className="px-4 py-3 font-semibold">Cupão</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Comprar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((offer) => {
            const hasCouponPrice =
              offer.effectivePrice != null &&
              offer.effectivePrice > 0 &&
              offer.effectivePrice < offer.price;
            const hasCoupon =
              Boolean(offer.couponCode) ||
              Boolean(offer.couponLabel) ||
              hasCouponPrice;
            const couponLabel =
              offer.couponCode ||
              offer.couponLabel ||
              (hasCouponPrice ? "Cupão aplicável" : null);
            const savings = hasCouponPrice ? offer.price - offer.effectivePrice! : 0;
            const slug = offer.slug || offer.store || "";
            const name = storeDisplayName(slug || offer.storeName, offer.storeName);
            const stock = stockStatus(offer);

            return (
              <tr
                key={`${offer.store}-${offer.url}`}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <StoreCellLogo
                      name={name}
                      slug={slug}
                      logoFromOffer={offer.logoUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{name}</p>
                      <p className={cn("mt-0.5 text-xs font-medium", stock.className)}>
                        {stock.label}
                      </p>
                      {hasCoupon ? (
                        <p className="mt-0.5 text-xs font-medium text-sky-700">
                          Cupão disponível
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <p
                    className={cn(
                      "font-display text-lg font-bold tabular-nums",
                      stock.label === "Esgotado" ? "text-slate-700" : "text-slate-900",
                    )}
                  >
                    {formatEUR(offer.price)}
                  </p>
                  {hasCouponPrice ? (
                    <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                      <p>Cupão: −{formatEUR(savings)}</p>
                      <p className="font-medium text-emerald-800">
                        Preço final: {formatEUR(offer.effectivePrice!)}
                      </p>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-4 align-middle text-slate-600">
                  {couponLabel ? (
                    <span className="inline-flex max-w-[10rem] truncate rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs">
                      {offer.couponCode || couponLabel}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 align-middle text-right">
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "font-semibold",
                      stock.label === "Esgotado" && "opacity-80",
                    )}
                  >
                    Comprar
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
