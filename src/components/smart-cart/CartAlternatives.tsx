"use client";

import { useEffect, useMemo, useState } from "react";
import { searchProducts, summaryToProduct } from "@/lib/api";
import { replaceCartItem } from "@/lib/smart-cart";
import type { CartItem } from "@/lib/smart-cart/types";
import type { Product } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  item: CartItem;
  onReplaced: () => void;
};

/**
 * Alternativas — fetch lazy só ao expandir (sem polling).
 */
export function CartAlternatives({ item, onReplaced }: Props) {
  const [open, setOpen] = useState(false);
  const [alts, setAlts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const q =
      item.chipsetModel ||
      (item.brand ? `${item.brand} ${item.leafId || ""}` : item.name);
    searchProducts(q.trim(), {
      limit: 12,
      sortBy: "price_asc",
      brand: item.brand || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        const list = (res.results || [])
          .map(summaryToProduct)
          .filter((p) => p.slug !== item.slug)
          .filter((p) => p.inStock !== false)
          .slice(0, 6);
        setAlts(list);
      })
      .catch(() => {
        if (!cancelled) setAlts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, item]);

  const ranked = useMemo(() => {
    const best = item.offers.length
      ? Math.min(...item.offers.map((o) => o.price))
      : item.priceAtAdd;
    return alts
      .map((p) => {
        const save = best - p.currentPrice;
        const sameChip =
          item.chipsetModel &&
          p.chipsetModel &&
          item.chipsetModel.toLowerCase() === p.chipsetModel.toLowerCase();
        return { p, save, sameChip };
      })
      .sort((a, b) => {
        if (a.sameChip !== b.sameChip) return a.sameChip ? -1 : 1;
        return a.p.currentPrice - b.p.currentPrice;
      });
  }, [alts, item]);

  return (
    <div className="mt-2">
      <button
        type="button"
        className="text-xs font-medium text-sky-700 hover:underline"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Ocultar alternativas" : "Ver alternativas / troca inteligente"}
      </button>
      {open ? (
        <div className="mt-2 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          {loading ? (
            <p className="text-xs text-slate-400">A carregar…</p>
          ) : null}
          {!loading && !ranked.length ? (
            <p className="text-xs text-slate-400">Sem alternativas observadas.</p>
          ) : null}
          {ranked.map(({ p, save, sameChip }) => (
            <div
              key={p.slug}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {formatEUR(p.currentPrice)}
                  {sameChip ? " · Mesmo chipset" : ""}
                  {p.decision.limiarIndex.value
                    ? ` · Score ${p.decision.limiarIndex.value}`
                    : ""}
                  {save > 1 ? (
                    <span className="text-emerald-700">
                      {" "}
                      · Poupa {formatEUR(save)}
                    </span>
                  ) : null}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={async () => {
                  await replaceCartItem(item.id, p);
                  onReplaced();
                }}
              >
                Trocar
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
