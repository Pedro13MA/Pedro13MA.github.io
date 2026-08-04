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
import { cn, formatEUR } from "@/lib/utils";
import { storeDisplayName } from "@/lib/storeLogos";

type Props = {
  product: Product;
};

function humanDelivery(shippingInfo?: string | null): string {
  const v = shippingInfo?.trim();
  if (!v) return "Consultar loja";
  if (/varies|n\/a|unknown|tbd/i.test(v)) return "Consultar loja";
  return v;
}

function humanShippingCost(raw?: string | null): string {
  const v = raw?.trim();
  if (!v) return "Depende da encomenda";
  if (/varies|n\/a|unknown|tbd/i.test(v)) return "Depende da encomenda";
  return v;
}

export function ProductHero({ product }: Props) {
  const { push } = useSnackbar();

  const bestOffer = useMemo(() => {
    const sorted = [...(product.offers ?? [])].sort((a, b) => a.price - b.price);
    return sorted[0] ?? null;
  }, [product.offers]);

  const bestStore = bestOffer?.storeName || bestOffer?.store || null;
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
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <ProductGallery product={product} showThumbnails={false} />

        <div className="flex flex-col gap-4">
          {product.brand ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {product.brand}
            </p>
          ) : null}

          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-[2.5rem] md:leading-tight">
            {product.name}
          </h1>

          <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
            {formatEUR(product.currentPrice)}
          </p>

          <div className="space-y-1.5 text-sm text-slate-600">
            {bestStore ? (
              <p>
                <span className="text-slate-500">Loja mais barata · </span>
                <span className="font-medium text-slate-900">
                  {storeDisplayName(bestStore, bestStore)}
                </span>
              </p>
            ) : null}
            <p>
              <span className="text-slate-500">Entrega · </span>
              <span className="font-medium text-slate-900">
                {humanDelivery(bestOffer?.shippingInfo)}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Portes · </span>
              <span className="font-medium text-slate-900">
                {humanShippingCost(bestOffer?.shippingDetails?.shippingCost)}
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
                "mt-1 h-11 w-full justify-center font-semibold sm:max-w-xs",
              )}
            >
              Comprar
            </a>
          ) : null}

          <div className="grid grid-cols-3 gap-2 sm:max-w-md">
            <Button
              type="button"
              variant={fav ? "accent" : "secondary"}
              size="default"
              className="h-11 w-full px-2 font-semibold"
              onClick={() => setListOpen(true)}
              aria-pressed={fav}
            >
              <Heart
                className={cn("h-4 w-4 shrink-0", fav && "fill-current")}
                aria-hidden
              />
              Favorito
            </Button>

            <AddToCartButton
              product={product}
              compact
              className="h-11 w-full justify-center"
            />

            <Button
              type="button"
              variant={alertActive ? "accent" : "secondary"}
              size="default"
              className="h-11 w-full px-2 font-semibold"
              onClick={() => setAlertOpen(true)}
              aria-pressed={alertActive}
            >
              <Bell className="h-4 w-4 shrink-0" aria-hidden />
              Alerta
            </Button>
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
