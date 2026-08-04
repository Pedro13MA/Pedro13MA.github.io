"use client";

import { useMemo, useState } from "react";
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
      alt={`Logo ${name}`}
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

function offerScore(price: number, best: number, worst: number): number {
  if (!(best > 0) || worst <= best) return 100;
  const t = (worst - price) / (worst - best);
  return Math.round(Math.max(0, Math.min(100, t * 100)));
}

function shippingDays(offer: Offer): number | null {
  const d = offer.shippingDetails;
  if (d?.estimatedDaysMin != null) return d.estimatedDaysMin;
  const info = offer.shippingInfo || "";
  const m = info.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return Number(m[1]);
  const single = info.match(/(\d+)\s*dias?/i);
  return single ? Number(single[1]) : null;
}

function deliveryLabel(offer: Offer): string {
  return (
    offer.shippingInfo?.trim() ||
    (offer.shippingDetails
      ? `${offer.shippingDetails.estimatedDaysMin}–${offer.shippingDetails.estimatedDaysMax} dias${
          offer.shippingDetails.supportsPickup ? " · levantamento" : ""
        }`
      : "—")
  );
}

function shippingCostLabel(offer: Offer): string {
  return offer.shippingDetails?.shippingCost?.trim() || "—";
}

/**
 * Tabela Onde comprar — desktop tabela; mobile cards compactos.
 */
export function StoreCompareTable({ offers }: Props) {
  const sorted = useMemo(
    () => [...offers].sort((a, b) => a.price - b.price),
    [offers],
  );

  const meta = useMemo(() => {
    if (!sorted.length) return null;
    const best = sorted[0].price;
    const worst = sorted[sorted.length - 1].price;
    let fastestIdx = -1;
    let fastestDays = Infinity;
    sorted.forEach((o, i) => {
      const d = shippingDays(o);
      if (d != null && d < fastestDays) {
        fastestDays = d;
        fastestIdx = i;
      }
    });
    // Maior confiança: stock + score preço (melhor preço com stock)
    let trustIdx = 0;
    let trustScore = -1;
    sorted.forEach((o, i) => {
      const stock = stockStatus(o);
      const score =
        offerScore(o.price, best, worst) +
        (stock.label === "Disponível" ? 25 : 0) +
        (o.couponCode || o.couponLabel ? 5 : 0);
      if (score > trustScore) {
        trustScore = score;
        trustIdx = i;
      }
    });
    return { best, worst, fastestIdx, trustIdx };
  }, [sorted]);

  if (!sorted.length || !meta) {
    return (
      <p className="text-sm text-slate-500">
        Sem ofertas de loja para este produto neste momento.
      </p>
    );
  }

  const { best, worst } = meta;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sorted.map((offer, idx) => {
        const slug = offer.slug || offer.store || "";
        const name = storeDisplayName(slug || offer.storeName, offer.storeName);
        const stock = stockStatus(offer);
        const score = offerScore(offer.price, best, worst);

        return (
          <li
            key={`${offer.store}-${offer.url}`}
            className={cn(
              "rounded-xl border border-slate-200/80 bg-white p-3",
              idx === 0 && "border-emerald-200 bg-emerald-50/30",
            )}
          >
            <div className="flex items-start gap-3">
              <StoreCellLogo
                name={name}
                slug={slug}
                logoFromOffer={offer.logoUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{name}</p>
                  </div>
                  <p className="font-display text-lg font-bold tabular-nums text-slate-900">
                    {formatEUR(offer.price)}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className={stock.className}>{stock.label}</span>
                  <span>Entrega: {deliveryLabel(offer)}</span>
                  <span>Portes: {shippingCostLabel(offer)}</span>
                  <span>Score {score}</span>
                </div>

                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "mt-3 w-full justify-center font-semibold",
                  )}
                >
                  Comprar
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
