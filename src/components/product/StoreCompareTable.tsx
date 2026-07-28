import type { Offer } from "@/lib/types";
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
          const coupon = sanitizeCouponCode(offer.couponCode, offer.originalPrice);
          const prior =
            offer.originalPrice != null && offer.originalPrice > offer.price
              ? offer.originalPrice
              : null;
          return (
            <TableRow key={offer.store}>
              <TableCell className="font-semibold text-slate-900">
                {offer.storeName}
                {offer.store === best ? (
                  <Badge variant="teal" className="ml-2">
                    Melhor
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell>
                <span className="font-bold text-slate-900">{formatEUR(offer.price)}</span>
              </TableCell>
              {showPriorPrice ? (
                <TableCell>
                  {prior != null ? (
                    <span className="text-sm text-slate-400 line-through">
                      {formatEUR(prior)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
              ) : null}
              <TableCell>
                {coupon ? (
                  <code className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-800">
                    {coupon}
                  </code>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {offer.inStock === false ? (
                  <span className="text-rose-700">Esgotado</span>
                ) : (
                  <span className="text-emerald-700">Disponível</span>
                )}
              </TableCell>
              <TableCell className="text-right">
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
