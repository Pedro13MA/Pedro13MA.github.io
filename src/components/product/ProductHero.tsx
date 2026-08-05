"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Heart } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/smart-cart/AddToCartButton";
import { AlertRuleModal } from "@/components/user-space/AlertRuleModal";
import { FavoritesListsDrawer } from "@/components/user-space/FavoritesListsDrawer";
import { useSnackbar } from "@/components/user-space/Snackbar";
import { buttonVariants } from "@/components/ui/button";
import {
  getAlertForProduct,
  isFavorite,
  snapshotFromProduct,
  subscribeUserSpace,
} from "@/lib/user-space";
import type { Product } from "@/lib/types";
import { cn, formatEUR } from "@/lib/utils";
import { storeDisplayName } from "@/lib/storeLogos";
import { displayLeafOrBrand } from "@/lib/product-display";

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

  const categoryLabel = displayLeafOrBrand({
    subcategoryLabel: product.subcategoryLabel,
    leafId: product.leafId,
    taxonomyPath: product.taxonomyPath,
    category: product.category,
    brand: product.brand,
  });

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
  const [heartPulse, setHeartPulse] = useState(false);
  const [bellPulse, setBellPulse] = useState(false);

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
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        <ProductGallery
          product={product}
          showThumbnails={false}
          className="[&>button]:h-64 sm:[&>button]:h-80 md:[&>button]:h-[30rem]"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand ? (
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {product.brand}
              </p>
            ) : null}
            {categoryLabel &&
            categoryLabel.toLowerCase() !== (product.brand || "").toLowerCase() ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {categoryLabel}
              </span>
            ) : null}
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-[2.5rem] md:leading-tight">
            {product.name}
          </h1>

          <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-5xl">
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
                "mt-1 h-12 w-full justify-center text-base font-semibold sm:max-w-xs",
              )}
            >
              Comprar
            </a>
          ) : null}

          <div className="grid grid-cols-3 gap-2 sm:max-w-md">
            <button
              type="button"
              aria-pressed={fav}
              onClick={() => {
                setListOpen(true);
                if (!fav) {
                  setHeartPulse(true);
                  window.setTimeout(() => setHeartPulse(false), 450);
                }
              }}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition-all duration-200",
                fav
                  ? "border-rose-300 bg-rose-100 text-rose-900 shadow-sm"
                  : "border-rose-200/80 bg-rose-50 text-rose-800 hover:border-rose-300 hover:bg-rose-100",
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 shrink-0",
                  fav && "fill-current",
                  heartPulse && "lymiar-anim-heart",
                )}
                aria-hidden
              />
              {fav ? "Guardado" : "Favorito"}
            </button>

            <AddToCartButton
              product={product}
              heroTone
              className="h-11 w-full"
            />

            <button
              type="button"
              aria-pressed={alertActive}
              onClick={() => {
                setAlertOpen(true);
                setBellPulse(true);
                window.setTimeout(() => setBellPulse(false), 550);
              }}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition-all duration-200",
                alertActive
                  ? "border-amber-300 bg-amber-100 text-amber-950 shadow-sm"
                  : "border-amber-200/80 bg-amber-50 text-amber-900 hover:border-amber-300 hover:bg-amber-100",
              )}
            >
              <Bell
                className={cn(
                  "h-4 w-4 shrink-0",
                  bellPulse && "lymiar-anim-bell",
                )}
                aria-hidden
              />
              {alertActive ? "A seguir" : "Alerta"}
            </button>
          </div>
        </div>
      </header>

      <FavoritesListsDrawer
        open={listOpen}
        onClose={() => setListOpen(false)}
        product={snap}
        onSaved={(ids) => {
          void refreshUserSpace();
          if (ids.length) {
            setHeartPulse(true);
            window.setTimeout(() => setHeartPulse(false), 450);
          }
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
          setBellPulse(true);
          window.setTimeout(() => setBellPulse(false), 550);
          push("Alerta guardado.");
        }}
      />
    </>
  );
}
