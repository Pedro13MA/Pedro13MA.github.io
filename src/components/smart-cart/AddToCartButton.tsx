"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  addToCart,
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
};

export function AddToCartButton({ product, className, compact }: Props) {
  const { push } = useSnackbar();
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    void cartItemCount().then(setCount);
    return subscribeSmartCart(() => {
      void cartItemCount().then(setCount);
    });
  }, []);

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;
      setBusy(true);
      try {
        await addToCart(productToCartDraft(product));
        const n = await cartItemCount();
        setCount(n);
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
    [busy, product, push],
  );

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
