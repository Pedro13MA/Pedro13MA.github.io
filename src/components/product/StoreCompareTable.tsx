import type { Offer } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatEUR } from "@/lib/utils";

type Props = { offers: Offer[] };

/**
 * Tabela directa: Loja | Preço | Cupão | Comprar.
 * Preço loja e preço com cupão ficam separados.
 */
export function StoreCompareTable({ offers }: Props) {
  const sorted = [...offers].sort((a, b) => {
    const pa = a.effectivePrice != null && a.effectivePrice < a.price ? a.effectivePrice : a.price;
    const pb = b.effectivePrice != null && b.effectivePrice < b.price ? b.effectivePrice : b.price;
    return pa - pb;
  });

  if (!sorted.length) {
    return (
      <p className="text-sm text-slate-500">Sem ofertas de loja para este produto neste momento.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
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
            const couponLabel =
              offer.couponCode ||
              offer.couponLabel ||
              (hasCouponPrice ? "Cupão aplicável" : null);
            const savings = hasCouponPrice ? offer.price - offer.effectivePrice! : 0;

            return (
              <tr
                key={`${offer.store}-${offer.url}`}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-4 align-middle">
                  <p className="font-medium text-slate-900">{offer.storeName}</p>
                  {offer.inStock === false ? (
                    <p className="mt-0.5 text-xs text-rose-700">Esgotado</p>
                  ) : null}
                </td>
                <td className="px-4 py-4 align-middle">
                  <p className="font-display text-lg font-bold tabular-nums text-slate-900">
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
