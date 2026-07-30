import type { Offer } from "@/lib/types";
import { StoreOfferCard } from "@/components/product/StoreOfferCard";

type Props = { offers: Offer[] };

/**
 * Comparação multi-loja: grelha de cards (desktop) / pilha (mobile).
 * Usa apenas ofertas reais da API Limiar — sem dados mock.
 */
export function StoreCompareTable({ offers }: Props) {
  const sorted = [...offers].sort((a, b) => a.price - b.price);
  const bestStore = sorted[0]?.store;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((offer) => (
        <StoreOfferCard
          key={`${offer.store}-${offer.url}`}
          offer={offer}
          isBestPrice={offer.store === bestStore}
        />
      ))}
    </div>
  );
}
