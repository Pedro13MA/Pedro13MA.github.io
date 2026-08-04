"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Heart } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/smart-cart/AddToCartButton";
import { AlertRuleModal } from "@/components/user-space/AlertRuleModal";
import { FavoritesListsDrawer } from "@/components/user-space/FavoritesListsDrawer";
import { useSnackbar } from "@/components/user-space/Snackbar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getAlertForProduct,
  isFavorite,
  snapshotFromProduct,
  subscribeUserSpace,
} from "@/lib/user-space";
import type { Product } from "@/lib/types";
import {
  cn,
  formatEUR,
} from "@/lib/utils";
import { storeDisplayName } from "@/lib/storeLogos";
import { displayLeafOrBrand } from "@/lib/product-display";

type Props = {
  product: Product;
  onOpenCompareDrawer?: () => void;
};

function deliveryLabel(shippingInfo?: string | null) {
  const v = shippingInfo?.trim();
  return v || "—";
}

export function ProductHero({ product }: Props) {
  const { push } = useSnackbar();

  const categoryLabel = displayLeafOrBrand({
    subcategoryLabel: product.subcategoryLabel,
    leafId: product.leafId,
    category: product.category,
    brand: product.brand,
  });

  const bestOffer = useMemo(() => {
    const sorted = [...(product.offers ?? [])].sort((a, b) => a.price - b.price);
    return sorted[0] ?? null;
  }, [product.offers]);

  const bestStore =
    bestOffer?.storeName ||
    bestOffer?.store ||
    null;

  const buyUrl = bestOffer?.url || null;

  const [fav, setFav] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const refreshUserSpace = useCallback(async () => {
    setFav(await isFavorite(product.slug));
    const alert = await getAlertForProduct(product.slug);
    setAlertActive(Boolean(alert?.active));
  }, [product.slug]);

  useEffect(() => {
    void refreshUserSpace();
    const unsub = subscribeUserSpace(() => {
      void refreshUserSpace();
    });
    return () => {
      unsub();
    };
  }, [product.slug, refreshUserSpace]);

  const snap = snapshotFromProduct(product);

  return (
    <>
      <header className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        <ProductGallery product={product} showThumbnails={false} />

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            {product.brand ? (
              <span className="font-semibold uppercase tracking-wide text-slate-500">
                {product.brand}
              </span>
            ) : null}
            {categoryLabel ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {categoryLabel}
              </span>
            ) : null}
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            {product.name}
          </h1>

          <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
            {formatEUR(product.currentPrice)}
          </p>

          <div className="space-y-1 text-sm text-slate-600">
            {bestStore ? (
              <p className="flex flex-wrap items-baseline gap-1">
                <span className="text-slate-500">Loja mais barata:</span>
                <span className="font-medium text-slate-900">
                  {storeDisplayName(bestStore, bestStore)}
                </span>
              </p>
            ) : null}

            <p className="flex flex-wrap items-baseline gap-1">
              <span className="text-slate-500">Entrega:</span>
              <span className="font-medium text-slate-900">
                {deliveryLabel(bestOffer?.shippingInfo)}
              </span>
            </p>

            <p className="flex flex-wrap items-baseline gap-1">
              <span className="text-slate-500">Portes:</span>
              <span className="font-medium text-slate-900">
                {bestOffer?.shippingDetails?.shippingCost?.trim() || "—"}
              </span>
            </p>
          </div>

          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "h-11 w-full justify-center font-semibold",
              )}
            >
              Comprar
            </a>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={fav ? "accent" : "outline"}
              size="default"
              className="h-11 w-full font-semibold"
              onClick={() => setListOpen(true)}
              aria-pressed={fav}
            >
              <Heart
                className={cn("mr-2 h-4 w-4", fav && "fill-current")}
                aria-hidden
              />
              Favorito
            </Button>

            <AddToCartButton
              product={product}
              compact
              className="h-11 w-full"
            />

            <div className="col-span-2">
              <Button
                type="button"
                variant={alertActive ? "accent" : "outline"}
                size="default"
                className="h-11 w-full font-semibold"
                onClick={() => setAlertOpen(true)}
                aria-pressed={alertActive}
              >
                <Bell className="mr-2 h-4 w-4" aria-hidden />
                Alerta
              </Button>
            </div>
          </div>
        </div>
      </header>

      <FavoritesListsDrawer
        open={listOpen}
        onClose={() => setListOpen(false)}
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
        variant="product"
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        product={snap}
        onSaved={() => {
          void refreshUserSpace();
          push("Alerta guardado.");
        }}
      />
    </>
  );
}

