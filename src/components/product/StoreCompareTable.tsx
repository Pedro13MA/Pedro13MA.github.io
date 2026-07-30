import type { Offer, PaymentMethod } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatEUR } from "@/lib/utils";

type Props = { offers: Offer[] };

/** Nunca tratar PVPR / valor monetário como cupão. */
function sanitizeCouponCode(
  code: string | null | undefined,
  originalPrice?: number | null,
): string | null {
  if (!code) return null;
  const trimmed = code.trim();
  if (!trimmed) return null;
  const numeric = trimmed.replace(/€/g, "").replace(/\s/g, "").replace(",", ".");
  if (/^\d+(\.\d{1,2})?$/.test(numeric)) {
    const asNum = Number(numeric);
    if (originalPrice != null && Math.abs(asNum - originalPrice) < 0.02) return null;
    // Qualquer código que seja só um preço → não é cupão
    return null;
  }
  return trimmed;
}

/** Prestações / BNPL — destaque suave (pill). */
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

function PaymentMethodBadges({ methods }: { methods: PaymentMethod[] }) {
  if (!methods.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {methods.map((m) => {
        const installment = isInstallmentMethod(m);
        return (
          <span
            key={`${m.id}-${m.label}`}
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide",
              installment
                ? "border-violet-200 bg-violet-50 text-violet-800"
                : "border-emerald-100 bg-emerald-50/80 text-emerald-800",
            )}
            title={m.label}
          >
            {m.label}
          </span>
        );
      })}
    </div>
  );
}

export function StoreCompareTable({ offers }: Props) {
  const sorted = [...offers].sort((a, b) => a.price - b.price);
  const best = sorted[0]?.store;
  const showPriorPrice = sorted.some(
    (o) => o.originalPrice != null && o.originalPrice > o.price,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loja</TableHead>
          <TableHead>Preço</TableHead>
          {showPriorPrice ? <TableHead>Preço anterior</TableHead> : null}
          <TableHead>Cupão</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((offer) => {
          const displayPrice = offer.price;
          const coupon = sanitizeCouponCode(offer.couponCode, offer.originalPrice);
          const prior =
            offer.originalPrice != null && offer.originalPrice > displayPrice
              ? offer.originalPrice
              : null;
          return (
            <TableRow key={offer.store}>
              <TableCell className="align-top font-semibold text-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{offer.storeName}</span>
                  {offer.store === best ? (
                    <Badge variant="teal">Melhor</Badge>
                  ) : null}
                </div>
                <PaymentMethodBadges methods={offer.paymentMethods || []} />
                {offer.shippingInfo ? (
                  <p className="mt-1 text-[11px] font-normal text-slate-500">
                    Entrega {offer.shippingInfo}
                  </p>
                ) : null}
              </TableCell>
              <TableCell className="align-top">
                <span className="font-bold text-slate-900">{formatEUR(displayPrice)}</span>
              </TableCell>
              {showPriorPrice ? (
                <TableCell className="align-top">
                  {prior != null ? (
                    <span className="text-sm text-slate-400 line-through">
                      {formatEUR(prior)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
              ) : null}
              <TableCell className="align-top">
                {coupon ? (
                  <code className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-800">
                    {coupon}
                  </code>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell className="align-top">
                {offer.inStock === false ? (
                  <span className="text-rose-700">Esgotado</span>
                ) : (
                  <span className="text-emerald-700">Disponível</span>
                )}
              </TableCell>
              <TableCell className="align-top text-right">
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "min-h-9")}
                >
                  Ver oferta
                </a>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
