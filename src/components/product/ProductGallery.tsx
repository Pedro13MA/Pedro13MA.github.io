"use client";

import { useState } from "react";
import { ProductImageLightbox } from "@/components/product/ProductImageLightbox";
import { collectImageUrls } from "@/lib/product-content";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  className?: string;
};

export function ProductGallery({ product, className }: Props) {
  const images = collectImageUrls(product);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div
        className={cn(
          "flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 sm:h-72 md:h-[28rem]",
          className,
        )}
      >
        Sem imagem
      </div>
    );
  }

  const main = images[Math.min(active, images.length - 1)];

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:h-72 sm:p-6 md:h-[28rem]"
        aria-label="Abrir imagem em ecrã completo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
          loading="eager"
        />
      </button>

      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                onDoubleClick={() => {
                  setActive(i);
                  setLightbox(true);
                }}
                className={cn(
                  "flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-white p-1",
                  i === active
                    ? "border-sky-500 ring-1 ring-sky-200"
                    : "border-slate-200 hover:border-slate-300",
                )}
                aria-label={`Miniatura ${i + 1}`}
                aria-current={i === active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ProductImageLightbox
        images={images}
        alt={product.name}
        open={lightbox}
        index={active}
        onClose={() => setLightbox(false)}
        onIndexChange={setActive}
      />
    </div>
  );
}
