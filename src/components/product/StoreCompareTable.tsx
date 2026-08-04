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
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600"
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
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1.5"
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
  return { label: "Consultar loja", className: "text-slate-500" };
}

function humanOrFallback(
  value: string | null | undefined,
  fallback: string,
): string {
  const v = value?.trim();
  if (!v) return fallback;
  if (/varies|n\/a|unknown|tbd|null|undefined/i.test(v)) return fallback;
  return v;
}

function deliveryLabel(offer: Offer): string {
  const fromInfo = humanOrFallback(offer.shippingInfo, "");
  if (fromInfo) return fromInfo;
  if (offer.shippingDetails) {
    const min = offer.shippingDetails.estimatedDaysMin;
    const max = offer.shippingDetails.estimatedDaysMax;
    if (min != null && max != null) {
      return `${min}–${max} dias${
        offer.shippingDetails.supportsPickup ? " · levantamento" : ""
      }`;
    }
  }
  return "Consultar loja";
}

function shippingCostLabel(offer: Offer): string {
  return humanOrFallback(
    offer.shippingDetails?.shippingCost,
    "Depende da encomenda",
  );
}

/** Cartões “Onde comprar” — visual tipo marketplace. */
export function StoreCompareTable({ offers }: Props) {
  const sorted = useMemo(
    () => [...offers].sort((a, b) => a.price - b.price),
    [offers],
  );

  const meta = useMemo(() => {
    if (!sorted.length) return null;
    return true;
  }, [sorted]);

  if (!sorted.length || !meta) {
    return (
      <p className="text-sm text-slate-500">
        Sem ofertas de loja para este produto neste momento.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sorted.map((offer, idx) => {
        const slug = offer.slug || offer.store || "";
        const name = storeDisplayName(slug || offer.storeName, offer.storeName);
        const stock = stockStatus(offer);

        return (
          <li
            key={`${offer.store}-${offer.url}`}
            className={cn(
              "rounded-2xl border border-slate-200/80 bg-white p-4",
              idx === 0 && "border-emerald-200 bg-emerald-50/40",
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
                  <p className="font-medium text-slate-900">{name}</p>
                  <p className="font-display text-lg font-bold tabular-nums text-slate-900">
                    {formatEUR(offer.price)}
                  </p>
                </div>

                {idx === 0 ? (
                  <p className="mt-1 text-xs font-semibold text-amber-700">
                    ⭐ Melhor oferta
                  </p>
                ) : null}

                <dl className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="inline text-slate-400">Disponibilidade · </dt>
                    <dd className={cn("inline font-medium", stock.className)}>
                      {stock.label}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">Entrega · </dt>
                    <dd className="inline">{deliveryLabel(offer)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="inline text-slate-400">Portes · </dt>
                    <dd className="inline">{shippingCostLabel(offer)}</dd>
                  </div>
                </dl>

                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "mt-4 w-full justify-center font-semibold",
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
