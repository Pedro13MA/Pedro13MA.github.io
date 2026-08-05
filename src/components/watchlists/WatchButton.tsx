"use client";

/**
 * FASE 7.19 — botão Seguir (👁).
 */

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  baselineFromProduct,
  isWatching,
  subscribeWatchlists,
  toggleWatch,
  type WatchBaseline,
  type WatchKind,
  type WatchTarget,
} from "@/lib/watchlists";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSnackbar } from "@/components/user-space/Snackbar";

type Props = {
  kind: WatchKind;
  target: WatchTarget;
  baseline?: WatchBaseline | null;
  className?: string;
  compact?: boolean;
  labelFollow?: string;
  labelFollowing?: string;
};

export function WatchButton({
  kind,
  target,
  baseline,
  className,
  compact,
  labelFollow,
  labelFollowing,
}: Props) {
  const { push } = useSnackbar();
  const [watching, setWatching] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    void isWatching(kind, target.key).then(setWatching);
  }, [kind, target.key]);

  useEffect(() => {
    refresh();
    return subscribeWatchlists(refresh);
  }, [refresh]);

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;
      setBusy(true);
      try {
        const res = await toggleWatch({ kind, target, baseline });
        setWatching(res.watching);
        push(
          res.watching
            ? `A seguir ${target.label}.`
            : `Deixou de seguir ${target.label}.`,
          {
            action: {
              label: "Timeline",
              onClick: () => {
                window.location.href = "/timeline/";
              },
            },
          },
        );
      } finally {
        setBusy(false);
      }
    },
    [baseline, busy, kind, push, target],
  );

  const followLabel =
    labelFollow ||
    (compact
      ? "Seguir"
      : kind === "CATEGORY"
        ? "Seguir categoria"
        : kind === "BRAND"
          ? "Seguir marca"
          : kind === "STORE"
            ? "Seguir loja"
            : kind === "PROJECT"
              ? "Seguir projeto"
              : kind === "SMART_CART"
                ? "Seguir carrinho"
                : "Seguir");
  const followingLabel = labelFollowing || (compact ? "A seguir" : "A seguir");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={watching}
      aria-label={watching ? followingLabel : followLabel}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-colors",
        watching
          ? "border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900",
        compact ? "h-8 px-2" : "h-9 px-3",
        className,
      )}
    >
      {watching ? (
        <EyeOff className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Eye className="h-3.5 w-3.5" aria-hidden />
      )}
      {watching ? followingLabel : followLabel}
    </button>
  );
}

export function ProductWatchButton({
  product,
  className,
  compact,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  return (
    <WatchButton
      kind="PRODUCT"
      target={{
        key: product.slug,
        label: product.name,
        href: `/p/?id=${encodeURIComponent(product.slug)}`,
        imageUrl: product.imageUrl,
      }}
      baseline={baselineFromProduct(product)}
      className={className}
      compact={compact}
    />
  );
}
