"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  open: boolean;
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

/**
 * Lightbox acessível — teclado ← → ESC, zoom, swipe mobile.
 */
export function ProductImageLightbox({
  images,
  alt,
  open,
  index,
  onClose,
  onIndexChange,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const safeIndex = images.length
    ? ((index % images.length) + images.length) % images.length
    : 0;

  const go = useCallback(
    (delta: number) => {
      if (images.length < 2) return;
      onIndexChange((safeIndex + delta + images.length) % images.length);
      setZoom(1);
    },
    [images.length, onIndexChange, safeIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.25));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, go]);

  useEffect(() => {
    if (open) setZoom(1);
  }, [open, index]);

  if (!open || !images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-slate-950/95"
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de imagens"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <p className="truncate text-sm">
          {safeIndex + 1} / {images.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10"
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            aria-label="Reduzir zoom"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[safeIndex]}
          alt={`${alt} — imagem ${safeIndex + 1}`}
          className={cn(
            "max-h-full max-w-full object-contain transition-transform duration-200",
            zoom > 1 && "cursor-zoom-out",
          )}
          style={{ transform: `scale(${zoom})` }}
          onClick={() => setZoom((z) => (z > 1 ? 1 : 1.5))}
          draggable={false}
        />
      </div>

      {images.length > 1 ? (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                onIndexChange(i);
                setZoom(1);
              }}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2",
                i === safeIndex ? "border-sky-400" : "border-transparent opacity-70",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-contain bg-white"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
