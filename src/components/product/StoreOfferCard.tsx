"use client";

import { useState } from "react";
import type { Offer, PaymentMethod, StockStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatEUR } from "@/lib/utils";

export type StoreOfferCardProps = {
  offer: Offer;
  /** Destaca automaticamente o melhor preço actual. */
  isBestPrice?: boolean;
  className?: string;
};

function isInstallmentMethod(method: PaymentMethod): boolean {
  const id = method.id.toLowerCase();
  const label = method.label.toLowerCase();
  return (
    id.includes("klarna") ||
    id.includes("affirm") ||
    id.includes("sequra") ||
    label.includes("klarna") ||
    label.includes("prestações") ||
    label.includes("3x") ||
    label.includes("4x")
  );
}

function stockLabel(status: StockStatus | null | undefined, inStock?: boolean | null): {
  text: string;
  className: string;
} {
  const resolved =
    status ??
    (inStock === true ? "in_stock" : inStock === false ? "out_of_stock" : "unknown");
  if (resolved === "in_stock") {
    return { text: "Em stock", className: "text-emerald-700" };
  }
  if (resolved === "out_of_stock") {
    return { text: "Esgotado", className: "text-rose-700" };
  }
  return { text: "Stock n/d", className: "text-slate-500" };
}

function StoreLogo({
  name,
  logoUrl,
  size,
}: {
  name: string;
  logoUrl?: string | null;
  size: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  if (!logoUrl || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-display font-bold text-slate-600",
          dim,
          size === "sm" ? "text-sm" : "text-base",
        )}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      width={size === "sm" ? 36 : 44}
      height={size === "sm" ? 36 : 44}
      className={cn(
        "shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1.5",
        dim,
      )}
      onError={() => setFailed(true)}
    />
  );
}

function PaymentBadges({ methods }: { methods: PaymentMethod[] }) {
  if (!methods.length) {
    return <p className="text-xs text-slate-400">Métodos não disponíveis</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {methods.map((m) => {
        const installment = isInstallmentMethod(m);
        return (
          <span
            key={`${m.id}-${m.label}`}
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
              installment
                ? "border-sky-200 bg-sky-50 text-sky-800"
                : "border-slate-200 bg-slate-50 text-slate-700",
            )}
          >
            {m.label}
          </span>
        );
      })}
    </div>
  );
}

function ShippingSection({ offer }: { offer: Offer }) {
  const details = offer.shippingDetails;
  const summary = offer.shippingInfo;

  let body: string;
  if (details) {
    const days = `${details.estimatedDaysMin}–${details.estimatedDaysMax} dias úteis`;
    const pickup = details.supportsPickup ? " · Levantamento em loja" : "";
    const cost =
      details.shippingCost && details.shippingCost !== "varies"
        ? ` · ${details.shippingCost}`
        : "";
    body = `${days}${pickup}${cost}`;
  } else if (summary) {
    body = summary.startsWith("Entrega") ? summary : `Entrega ${summary}`;
  } else {
    body = "Informação de entrega indisponível";
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Entrega
      </p>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}

export function StoreOfferCard({ offer, isBestPrice = false, className }: StoreOfferCardProps) {
  const prior =
    offer.originalPrice != null && offer.originalPrice > offer.price
      ? offer.originalPrice
      : null;
  const stock = stockLabel(offer.stockStatus, offer.inStock);
  const methods = offer.paymentMethods || [];

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow",
        isBestPrice
          ? "border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_8px_24px_-12px_rgba(16,185,129,0.45)]"
          : "border-slate-200/90 shadow-sm hover:shadow-md",
        className,
      )}
    >
      {isBestPrice ? (
        <div className="absolute right-3 top-3 z-10">
          <Badge variant="buy" className="shadow-sm">
            Melhor preço
          </Badge>
        </div>
      ) : null}

      {/* Mobile layout */}
      <div className="flex flex-col gap-4 p-4 md:hidden">
        <div className="flex items-start gap-3 pr-24">
          <StoreLogo name={offer.storeName} logoUrl={offer.logoUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-slate-900">
              {offer.storeName}
            </h3>
            <p className={cn("mt-0.5 text-xs font-medium", stock.className)}>{stock.text}</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p
              className={cn(
                "font-display text-2xl font-bold tracking-tight",
                isBestPrice ? "text-emerald-700" : "text-slate-900",
              )}
            >
              {formatEUR(offer.price)}
            </p>
            {prior != null ? (
              <p className="mt-0.5 text-sm text-slate-400 line-through">{formatEUR(prior)}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Pagamento
          </p>
          <PaymentBadges methods={methods} />
        </div>

        <ShippingSection offer={offer} />

        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "w-full font-semibold",
            isBestPrice && "bg-emerald-700 hover:bg-emerald-800",
          )}
        >
          Ver oferta
        </a>
      </div>

      {/* Desktop layout */}
      <div className="hidden h-full flex-col md:flex">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 pr-28">
          <StoreLogo name={offer.storeName} logoUrl={offer.logoUrl} size="md" />
          <h3 className="truncate font-display text-lg font-bold text-slate-900">
            {offer.storeName}
          </h3>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-5 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Preço actual
            </p>
            <p
              className={cn(
                "mt-1 font-display text-3xl font-bold tracking-tight",
                isBestPrice ? "text-emerald-700" : "text-slate-900",
              )}
            >
              {formatEUR(offer.price)}
            </p>
            {prior != null ? (
              <p className="mt-1 text-sm text-slate-400">
                Anterior{" "}
                <span className="line-through">{formatEUR(prior)}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Sem preço anterior</p>
            )}
            <p className={cn("mt-2 text-sm font-medium", stock.className)}>{stock.text}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pagamento
            </p>
            <PaymentBadges methods={methods} />
          </div>

          <ShippingSection offer={offer} />

          <div className="mt-auto pt-1">
            <a
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "w-full font-semibold",
                isBestPrice && "bg-emerald-700 hover:bg-emerald-800",
              )}
            >
              Ver oferta
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
