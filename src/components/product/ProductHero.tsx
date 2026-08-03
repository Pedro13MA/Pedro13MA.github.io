"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, GitCompareArrows, Heart, Share2 } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Button } from "@/components/ui/button";
import {
  addToCompare,
  isInCompare,
  removeFromCompare,
  type CompareItem,
} from "@/lib/compare";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import type { Product, ProductCondition } from "@/lib/types";
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

const FAV_KEY = "limiar.favorites.v1";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Hero premium — galeria + decisão + acções (favorito, alerta, VS).
 */
export function ProductHero({ product, onOpenCompareDrawer }: Props) {
  const kind = resolveDecisionKind(product);
  const ui = DECISION_UI_LABEL[kind];
  const condition = (product.condition ?? "NEW") as ProductCondition | "USED";
  const conditionLabel = CONDITION_LABEL[condition] || condition;
  const atMin =
    kind === "buy" &&
    (product.decision.isHistoricalMin ||
      isAbsoluteHistoricalMin(product.currentPrice, product.historicalMin));
  const bestStore =
    product.decision.cheapestStore ||
    product.offers[0]?.storeName ||
    product.offers[0]?.store ||
    null;
  const leafLabel =
    product.subcategoryLabel ||
    product.leafId?.replace(/_/g, " ") ||
    product.category;

  const [fav, setFav] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [compareMsg, setCompareMsg] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    setFav(readFavorites().includes(product.slug));
    setInCompare(isInCompare(product.slug));
    const onCmp = () => setInCompare(isInCompare(product.slug));
    window.addEventListener("limiar:compare-changed", onCmp);
    return () => window.removeEventListener("limiar:compare-changed", onCmp);
  }, [product.slug]);

  const toggleFav = useCallback(() => {
    const list = readFavorites();
    const next = fav
      ? list.filter((s) => s !== product.slug)
      : [...list, product.slug];
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setFav(!fav);
  }, [fav, product.slug]);

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
        ? "Adicionado — abra a comparação"
        : "Adicionado à comparação",
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
    <header className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <ProductGallery product={product} />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {product.brand ? (
            <span className="font-semibold uppercase tracking-wide text-slate-500">
              {product.brand}
            </span>
          ) : null}
          {leafLabel ? (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {leafLabel}
            </span>
          ) : null}
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
            {conditionLabel}
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {product.name}
        </h1>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Desde
          </p>
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-slate-900 md:text-5xl">
            {formatEUR(product.currentPrice)}
          </p>
        </div>

        <div
          className={cn(
            "inline-flex w-fit max-w-full flex-col gap-1 rounded-xl border px-3.5 py-2.5",
            ui.className,
          )}
          role="status"
        >
          <span className="text-sm font-semibold">
            <span className="mr-1.5 tracking-tight" aria-hidden>
              {scoreStars(indexVal)}
            </span>
            {ui.label}
          </span>
          <span className="text-xs opacity-90">
            Índice Limiar {indexVal}/100
            {bestStore
              ? ` · ${storeDisplayName(bestStore, bestStore)}`
              : ""}
          </span>
        </div>

        {atMin ? (
          <p className="text-sm font-medium text-orange-800">
            Perto do mínimo histórico observado
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={fav ? "default" : "outline"}
            size="sm"
            onClick={toggleFav}
            aria-pressed={fav}
          >
            <Heart className={cn("mr-1.5 h-4 w-4", fav && "fill-current")} />
            Favorito
          </Button>
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50",
            )}
          >
            <Bell className="mr-1.5 h-4 w-4" />
            Alerta
          </a>
          <Button
            type="button"
            variant={inCompare ? "default" : "outline"}
            size="sm"
            onClick={toggleCompare}
            aria-pressed={inCompare}
          >
            {inCompare ? (
              <Check className="mr-1.5 h-4 w-4" />
            ) : (
              <GitCompareArrows className="mr-1.5 h-4 w-4" />
            )}
            VS Comparar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={share}>
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
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-sm text-amber-950/80">
            Produto de exposição ou caixa aberta — o preço não mistura com o
            histórico de produtos novos.
          </p>
        ) : null}
      </div>
    </header>
  );
}
