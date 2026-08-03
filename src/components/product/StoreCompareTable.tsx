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

function stockStatus(offer: Offer): { label: string; className: string } {
  if (offer.inStock === false || offer.stockStatus === "out_of_stock") {
    return { label: "Esgotado", className: "text-rose-700" };
  }
  if (offer.inStock === true || offer.stockStatus === "in_stock") {
    return { label: "Disponível", className: "text-emerald-700" };
  }
  return { label: "Stock n/d", className: "text-slate-500" };
}

/** Score da oferta: preço relativo (melhor = 100). */
function offerScore(price: number, best: number, worst: number): number {
  if (!(best > 0) || worst <= best) return 100;
  const t = (worst - price) / (worst - best);
  return Math.round(Math.max(0, Math.min(100, t * 100)));
}

/**
 * Tabela Onde comprar — loja, preço, estado, entrega, cupão, score, comprar.
 */
export function StoreCompareTable({ offers }: Props) {
  const sorted = [...offers].sort((a, b) => a.price - b.price);

  if (!sorted.length) {
    return (
      <p className="text-sm text-slate-500">
        Sem ofertas de loja para este produto neste momento.
      </p>
    );
  }

  const best = sorted[0].price;
  const worst = sorted[sorted.length - 1].price;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-[#FAFAFA] text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 font-semibold">Loja</th>
            <th className="px-4 py-3 font-semibold">Preço</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Entrega</th>
            <th className="px-4 py-3 font-semibold">Cupão</th>
            <th className="px-4 py-3 font-semibold">Score</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Comprar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((offer, idx) => {
            const hasCoupon =
              Boolean(offer.couponCode) || Boolean(offer.couponLabel);
            const couponLabel = offer.couponCode || offer.couponLabel || null;
            const slug = offer.slug || offer.store || "";
            const name = storeDisplayName(slug || offer.storeName, offer.storeName);
            const stock = stockStatus(offer);
            const score = offerScore(offer.price, best, worst);
            const shipping =
              offer.shippingInfo?.trim() ||
              (offer.shippingDetails
                ? `${offer.shippingDetails.estimatedDaysMin}–${offer.shippingDetails.estimatedDaysMax} dias${
                    offer.shippingDetails.shippingCost
                      ? ` · ${offer.shippingDetails.shippingCost}`
                      : ""
                  }`
                : "—");

            return (
              <tr
                key={`${offer.store}-${offer.url}`}
                className={cn(
                  "border-b border-slate-100 last:border-0",
                  idx === 0 && "bg-emerald-50/40",
                )}
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
                      {idx === 0 ? (
                        <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
                          Melhor preço
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <p className="font-display text-lg font-bold tabular-nums text-slate-900">
                    {formatEUR(offer.price)}
                  </p>
                </td>
                <td className="px-4 py-4 align-middle">
                  <span className={cn("text-xs font-medium", stock.className)}>
                    {stock.label}
                  </span>
                </td>
                <td className="max-w-[10rem] px-4 py-4 align-middle text-xs text-slate-600">
                  <span className="line-clamp-2">{shipping}</span>
                </td>
                <td className="px-4 py-4 align-middle text-slate-600">
                  {couponLabel ? (
                    <span className="inline-flex max-w-[9rem] truncate rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs">
                      {couponLabel}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 align-middle">
                  <span className="tabular-nums font-semibold text-slate-800">
                    {score}
                  </span>
                  {hasCoupon ? (
                    <span className="ml-1 text-[10px] text-sky-700">+cupão</span>
                  ) : null}
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
