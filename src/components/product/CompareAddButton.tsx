"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import {
  addToCompare,
  isInCompare,
  productToCompareItem,
  type CompareItem,
} from "@/lib/compare";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  className?: string;
  /** Compact label for cards */
  compact?: boolean;
  onAdded?: (list: CompareItem[]) => void;
  onFull?: () => void;
};

/**
 * Botão «Adicionar ao comparador» — pesquisa, categorias, cards.
 */
export function CompareAddButton({
  product,
  className,
  compact,
  onAdded,
  onFull,
}: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isInCompare(product.slug));
    const sync = () => setActive(isInCompare(product.slug));
    window.addEventListener("limiar:compare-changed", sync);
    return () => window.removeEventListener("limiar:compare-changed", sync);
  }, [product.slug]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (active) return;
      const res = addToCompare(productToCompareItem(product));
      if (!res.ok && res.reason === "full") {
        onFull?.();
        return;
      }
      if (res.ok) {
        setActive(true);
        onAdded?.(res.list);
      }
    },
    [active, onAdded, onFull, product],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={active}
      aria-pressed={active}
      aria-label={
        active ? "Já no comparador" : `Adicionar ${product.name} ao comparador`
      }
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-colors",
        active
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900",
        compact ? "h-8 px-2" : "h-9 px-3",
        className,
      )}
    >
      <GitCompareArrows className="h-3.5 w-3.5" aria-hidden />
      {active ? "No VS" : compact ? "VS" : "Adicionar ao comparador"}
    </button>
  );
}
