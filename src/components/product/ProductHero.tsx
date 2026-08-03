"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, GitCompareArrows, Heart, Share2 } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/smart-cart/AddToCartButton";
import { AddToProjectButton } from "@/components/projects/AddToProjectButton";
import { ProductWatchButton } from "@/components/watchlists/WatchButton";
import { AlertRuleModal } from "@/components/user-space/AlertRuleModal";
import { ProductNotifyModal } from "@/components/notifications/ProductNotifyModal";
import { FavoritesListsDrawer } from "@/components/user-space/FavoritesListsDrawer";
import { useSnackbar } from "@/components/user-space/Snackbar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  addToCompare,
  isInCompare,
  removeFromCompare,
  type CompareItem,
} from "@/lib/compare";
import {
  getAlertForProduct,
  getListsForProduct,
  isFavorite,
  snapshotFromProduct,
  subscribeUserSpace,
} from "@/lib/user-space";
import type { Product, ProductCondition } from "@/lib/types";
import {
  computeSavingsEur,
  displayLeafOrBrand,
} from "@/lib/product-display";
import {
  cn,
  DECISION_UI_LABEL,
  formatEUR,
  type DecisionUiKind,
} from "@/lib/utils";
import {
  historySpanDays,
  isAbsoluteHistoricalMin,
  MIN_HISTORY_SPAN_DAYS,
} from "@/lib/product-insights";
import { storeDisplayName } from "@/lib/storeLogos";

type Props = {
  product: Product;
  onOpenCompareDrawer?: () => void;
};

const CONDITION_LABEL: Record<ProductCondition | "USED", string> = {
  NEW: "Novo",
  OUTLET: "Outlet",
  REFURBISHED: "Recondicionado",
  OPEN_BOX: "Caixa aberta",
  USED: "Usado",
};

function resolveDecisionKind(product: Product): DecisionUiKind {
  const span = historySpanDays(product.history);
  if (product.history.length < 5 || span < Math.min(14, MIN_HISTORY_SPAN_DAYS / 2)) {
    return "unknown";
  }
  return product.decision.semaphore;
}

function scoreStars(value: number): string {
  if (value >= 85) return "★★★★★";
  if (value >= 70) return "★★★★☆";
  if (value >= 55) return "★★★☆☆";
  if (value >= 40) return "★★☆☆☆";
  return "★☆☆☆☆";
}

/**
 * Hero marketplace — compacto no mobile (imagem → preço → decisão → comprar).
 */
export function ProductHero({ product, onOpenCompareDrawer }: Props) {
  const { push } = useSnackbar();
  const kind = resolveDecisionKind(product);
  const ui = DECISION_UI_LABEL[kind];
  const condition = (product.condition ?? "NEW") as ProductCondition | "USED";
  const conditionLabel = CONDITION_LABEL[condition] || condition;
  const atMin =
    kind === "buy" &&
    (product.decision.isHistoricalMin ||
      isAbsoluteHistoricalMin(product.currentPrice, product.historicalMin));

  const bestOffer = useMemo(() => {
    const sorted = [...product.offers].sort((a, b) => a.price - b.price);
    return sorted[0] ?? null;
  }, [product.offers]);

  const bestStore =
    product.decision.cheapestStore ||
    bestOffer?.storeName ||
    bestOffer?.store ||
    null;
  const buyUrl = bestOffer?.url || null;

  const categoryLabel = displayLeafOrBrand({
    subcategoryLabel: product.subcategoryLabel,
    leafId: product.leafId,
    category: product.category,
    brand: product.brand,
  });

  const savings = computeSavingsEur({
    current: product.currentPrice,
    avg30d: product.avg30d,
    historicalMax: product.historicalMax,
    originalPrice: product.originalPrice,
  });

  const stockLabel =
    product.inStock === false || bestOffer?.inStock === false
      ? "Indisponível"
      : product.inStock === true || bestOffer?.inStock === true
        ? "Disponível"
        : bestOffer
          ? "Ver stock na loja"
          : null;

  const [fav, setFav] = useState(false);
  const [listNames, setListNames] = useState<string[]>([]);
  const [alertActive, setAlertActive] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [compareMsg, setCompareMsg] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [listsOpen, setListsOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const refreshUserSpace = useCallback(async () => {
    setFav(await isFavorite(product.slug));
    const lists = await getListsForProduct(product.slug);
    setListNames(lists.map((l) => l.name));
    const alert = await getAlertForProduct(product.slug);
    setAlertActive(Boolean(alert?.active));
  }, [product.slug]);

  useEffect(() => {
    void refreshUserSpace();
    setInCompare(isInCompare(product.slug));
    const onCmp = () => setInCompare(isInCompare(product.slug));
    window.addEventListener("limiar:compare-changed", onCmp);
    const unsub = subscribeUserSpace(() => {
      void refreshUserSpace();
    });
    return () => {
      window.removeEventListener("limiar:compare-changed", onCmp);
      unsub();
    };
  }, [product.slug, refreshUserSpace]);

  const snap = snapshotFromProduct(product);

  const toggleCompare = useCallback(() => {
    if (inCompare) {
      removeFromCompare(product.slug);
      setInCompare(false);
      setCompareMsg("Removido da comparação");
      return;
    }
    const item: Omit<CompareItem, "addedAt"> = {
      slug: product.slug,
      ean: product.ean,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      currentPrice: product.currentPrice,
      limiarIndex: product.decision.limiarIndex.value,
      leafId: product.leafId,
      chipsetModel: product.chipsetModel,
      vramSpec: product.vramSpec,
      category: product.category,
    };
    const res = addToCompare(item);
    if (!res.ok && res.reason === "full") {
      setCompareMsg("Máximo de 4 produtos na comparação");
      onOpenCompareDrawer?.();
      return;
    }
    setInCompare(true);
    setCompareMsg(
      res.list.length >= 2
        ? `Adicionado (${res.list.length}/4) — abra a comparação`
        : `Adicionado à comparação (${res.list.length}/4)`,
    );
    onOpenCompareDrawer?.();
  }, [inCompare, onOpenCompareDrawer, product]);

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMsg("Ligação copiada");
      window.setTimeout(() => setShareMsg(null), 2000);
    } catch {
      setShareMsg("Não foi possível partilhar");
    }
  }, [product.name]);

  const indexVal = product.decision.limiarIndex.value;

  return (
    <header className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
      <ProductGallery product={product} />

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {product.brand ? (
            <span className="font-semibold uppercase tracking-wide text-slate-500">
              {product.brand}
            </span>
          ) : null}
          {categoryLabel &&
          categoryLabel.toLowerCase() !== (product.brand || "").toLowerCase() ? (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {categoryLabel}
            </span>
          ) : null}
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
            {conditionLabel}
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
            {formatEUR(product.currentPrice)}
          </p>
          {savings != null && savings >= 1 ? (
            <p className="pb-1 text-sm font-semibold text-emerald-700">
              Poupar {formatEUR(savings)}
            </p>
          ) : null}
        </div>

        <ul className="flex flex-col gap-1 text-sm text-slate-600">
          {bestStore ? (
            <li>
              Loja mais barata:{" "}
              <span className="font-medium text-slate-900">
                {storeDisplayName(bestStore, bestStore)}
              </span>
            </li>
          ) : null}
          {stockLabel ? (
            <li>
              Disponibilidade:{" "}
              <span
                className={cn(
                  "font-medium",
                  stockLabel === "Disponível"
                    ? "text-emerald-700"
                    : stockLabel === "Indisponível"
                      ? "text-rose-700"
                      : "text-slate-700",
                )}
              >
                {stockLabel}
              </span>
            </li>
          ) : null}
          <li>
            Score Limiar:{" "}
            <span className="font-medium text-slate-900">
              {scoreStars(indexVal)} {indexVal}/100
            </span>
          </li>
        </ul>

        <div
          className={cn(
            "inline-flex w-fit max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
            ui.className,
          )}
          role="status"
        >
          {ui.label}
          {atMin ? (
            <span className="text-xs font-medium opacity-90">
              · mínimo histórico
            </span>
          ) : null}
        </div>

        {(fav || listNames.length > 0 || alertActive) && (
          <div className="space-y-0.5 text-sm text-slate-600">
            {fav ? (
              <p>
                <span className="mr-1 text-rose-600" aria-hidden>
                  ❤
                </span>
                Guardado
                {listNames.length ? (
                  <span className="text-slate-500">
                    {" "}
                    · Lista: {listNames.join(", ")}
                  </span>
                ) : null}
              </p>
            ) : null}
            {alertActive ? (
              <p>
                <span className="mr-1" aria-hidden>
                  🔔
                </span>
                Alerta activo{" "}
                <button
                  type="button"
                  className="font-medium text-sky-700 hover:underline"
                  onClick={() => setAlertOpen(true)}
                >
                  Editar alerta
                </button>
              </p>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "h-11 w-full justify-center font-semibold sm:w-auto sm:min-w-[10rem]",
              )}
            >
              Comprar
              <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden />
            </a>
          ) : null}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:grid-cols-none">
            <Button
              type="button"
              variant={inCompare ? "default" : "outline"}
              size="sm"
              className="h-10"
              onClick={toggleCompare}
              aria-pressed={inCompare}
            >
              {inCompare ? (
                <Check className="mr-1 h-4 w-4" />
              ) : (
                <GitCompareArrows className="mr-1 h-4 w-4" />
              )}
              VS
            </Button>
            <Button
              type="button"
              variant={fav ? "default" : "outline"}
              size="sm"
              className="h-10"
              onClick={() => setListsOpen(true)}
              aria-pressed={fav}
            >
              <Heart className={cn("mr-1 h-4 w-4", fav && "fill-current")} />
              Favorito
            </Button>
            <Button
              type="button"
              variant={alertActive ? "default" : "outline"}
              size="sm"
              className="h-10"
              onClick={() => setAlertOpen(true)}
              aria-pressed={alertActive}
            >
              <Bell className="mr-1 h-4 w-4" />
              Alerta
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10"
              onClick={() => setNotifyOpen(true)}
            >
              Receber notificações
            </Button>
            <AddToCartButton product={product} compact className="h-10" />
            <AddToProjectButton product={product} compact className="h-10" />
            <ProductWatchButton product={product} compact className="h-10" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 self-start text-slate-500"
            onClick={share}
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            Partilhar
          </Button>
        </div>

        {compareMsg ? (
          <p className="text-xs text-sky-700">
            {compareMsg}{" "}
            {inCompare ? (
              <Link href="/comparar/" className="font-medium underline">
                Abrir /comparar
              </Link>
            ) : null}
          </p>
        ) : null}
        {shareMsg ? <p className="text-xs text-slate-500">{shareMsg}</p> : null}

        {condition !== "NEW" ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-950/80 sm:text-sm">
            Produto de exposição ou caixa aberta — o preço não mistura com o
            histórico de produtos novos.
          </p>
        ) : null}
      </div>

      <FavoritesListsDrawer
        open={listsOpen}
        onClose={() => setListsOpen(false)}
        product={snap}
        onSaved={(ids) => {
          void refreshUserSpace();
          push(
            ids.length
              ? "Produto adicionado aos favoritos."
              : "Removido das listas.",
          );
        }}
      />
      <AlertRuleModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        product={snap}
        onSaved={() => {
          void refreshUserSpace();
          push("Alerta criado.");
        }}
      />
      <ProductNotifyModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        product={{
          slug: product.slug,
          name: product.name,
          href: `/p/?id=${encodeURIComponent(product.slug)}`,
        }}
      />
    </header>
  );
}
