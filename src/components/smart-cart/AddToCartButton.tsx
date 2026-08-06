"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  addToCart,
  getActiveConfig,
  productToCartDraft,
  subscribeSmartCart,
  cartItemCount,
} from "@/lib/smart-cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSnackbar } from "@/components/user-space/Snackbar";

type Props = {
  product: Product;
  className?: string;
  compact?: boolean;
  /** Estilo do hero da página de produto (FASE 8.4.2). */
  heroTone?: boolean;
};

export function AddToCartButton({
  product,
  className,
  compact,
  heroTone,
}: Props) {
  const { push } = useSnackbar();
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [inCart, setInCart] = useState(false);
  const [pulse, setPulse] = useState(false);

  const refresh = useCallback(async () => {
    const [n, cfg] = await Promise.all([cartItemCount(), getActiveConfig()]);
    setCount(n);
    setInCart(cfg.items.some((i) => i.slug === product.slug));
  }, [product.slug]);

  useEffect(() => {
    void refresh();
    return subscribeSmartCart(() => {
      void refresh();
    });
  }, [refresh]);

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;
      setBusy(true);
      try {
        await addToCart(productToCartDraft(product));
        await refresh();
        setPulse(true);
        window.setTimeout(() => setPulse(false), 500);
        push("Adicionado ao carrinho inteligente.", {
          action: {
            label: "Ver",
            onClick: () => {
              window.location.href = "/carrinho/";
            },
          },
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, product, push, refresh],
  );

  if (heroTone) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={`Adicionar ${product.name} ao carrinho (${count} itens)`}
        aria-pressed={inCart}
        className={cn(
          "pdp-action-btn",
          inCart && "pdp-action-btn--on",
          className,
        )}
      >
        <ShoppingBag
          className={cn("h-4 w-4 shrink-0", pulse && "lymiar-anim-cart")}
          aria-hidden
        />
        {inCart ? "No carrinho" : "Carrinho"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={`Adicionar ${product.name} ao carrinho (${count} itens)`}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900",
        compact ? "h-8 px-2" : "h-9 px-3",
        className,
      )}
    >
      <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
      {compact ? "Carrinho" : "Adicionar ao carrinho"}
    </button>
  );
}
