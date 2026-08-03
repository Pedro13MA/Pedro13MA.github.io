"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearCompare,
  readCompareList,
  removeFromCompare,
  type CompareItem,
} from "@/lib/compare";
import { formatEUR } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CompareDrawer({ open, onClose }: Props) {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(readCompareList());
    const sync = () => setItems(readCompareList());
    window.addEventListener("limiar:compare-changed", sync);
    return () => window.removeEventListener("limiar:compare-changed", sync);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal aria-label="Comparação">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Comparar ({items.length}/4)
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

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!items.length ? (
            <p className="text-sm text-slate-500">
              Ainda não há produtos. Use «VS Comparar» nas fichas.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.slug}
                className="flex gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatEUR(item.currentPrice)} · Índice {item.limiarIndex}
                  </p>
                  <button
                    type="button"
                    className="mt-1 text-xs text-rose-700 hover:underline"
                    onClick={() => setItems(removeFromCompare(item.slug))}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 border-t border-slate-200 p-4">
          {items.length >= 2 ? (
            <Link
              href="/comparar/"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-sky-700 text-sm font-semibold text-white hover:bg-sky-800"
              onClick={onClose}
            >
              Abrir comparação
            </Link>
          ) : (
            <p className="text-center text-xs text-slate-400">
              Adicione pelo menos 2 produtos para comparar.
            </p>
          )}
          {items.length ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                clearCompare();
                setItems([]);
              }}
            >
              Limpar tudo
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
