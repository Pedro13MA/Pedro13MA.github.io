"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { searchProducts, summaryToProduct } from "@/lib/api";
import {
  addToCompare,
  COMPARE_MAX,
  isInCompare,
  productToCompareItem,
  readCompareList,
} from "@/lib/compare";
import type { Product } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

/**
 * Pesquisa para adicionar produtos ao comparador (sem reload).
 */
export function CompareAddSearch({ open, onClose, onAdded }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    setCount(readCompareList().length);
    setMsg(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      setLoading(true);
      searchProducts(term, { limit: 12, sortBy: "limiar_desc" })
        .then((res) => {
          if (cancelled) return;
          setResults((res.results || []).map(summaryToProduct));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q, open]);

  const add = useCallback(
    (product: Product) => {
      if (isInCompare(product.slug)) {
        setMsg("Já está no comparador");
        return;
      }
      const res = addToCompare(productToCompareItem(product));
      if (!res.ok && res.reason === "full") {
        setMsg(`Máximo de ${COMPARE_MAX} produtos`);
        return;
      }
      if (res.ok) {
        setCount(res.list.length);
        setMsg("Adicionado");
        onAdded();
        if (res.list.length >= COMPARE_MAX) onClose();
      }
    },
    [onAdded, onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal
      aria-label="Adicionar produto ao comparador"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-[10%] w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Adicionar produto ({count}/{COMPARE_MAX})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar produto…"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none ring-sky-500 focus:ring-2"
              aria-label="Pesquisar produtos"
            />
          </label>
          {msg ? <p className="mt-2 text-xs text-sky-700">{msg}</p> : null}
        </div>

        <ul className="max-h-80 overflow-y-auto border-t border-slate-100 px-2 pb-3">
          {loading ? (
            <li className="px-3 py-6 text-center text-sm text-slate-400">
              A pesquisar…
            </li>
          ) : null}
          {!loading && q.trim().length >= 2 && !results.length ? (
            <li className="px-3 py-6 text-center text-sm text-slate-400">
              Sem resultados
            </li>
          ) : null}
          {results.map((p) => {
            const inList = isInCompare(p.slug);
            return (
              <li key={p.slug}>
                <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatEUR(p.currentPrice)} · Índice{" "}
                      {p.decision.limiarIndex.value}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={inList ? "outline" : "default"}
                    disabled={inList}
                    onClick={() => add(p)}
                  >
                    {inList ? "Já está" : "Adicionar"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
