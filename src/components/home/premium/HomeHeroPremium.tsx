"use client";

import { useMemo, useState } from "react";
import { HomeSearchBar } from "@/components/home/premium/HomeSearchBar";
import { useHomeDeals } from "@/components/home/premium/HomeDealsProvider";
import type { Product } from "@/lib/types";

const PILLS = [
  "Histórico de preços",
  "Análise inteligente",
  "Cupões",
  "Alertas",
  "Comparação",
  "Timeline",
] as const;

function ProductShot({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  if (!product.imageUrl || failed) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-50 text-xs text-slate-400">
        {product.name.slice(0, 18)}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.imageUrl}
      alt=""
      loading="lazy"
      className="aspect-square w-full rounded-2xl object-contain bg-white p-3 ring-1 ring-slate-100"
      onError={() => setFailed(true)}
    />
  );
}

export function HomeHeroPremium() {
  const { dealsNow, loading } = useHomeDeals();
  const shots = useMemo(
    () => dealsNow.filter((p) => p.imageUrl).slice(0, 6),
    [dealsNow],
  );

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:max-w-7xl lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div className="home-fade order-2 lg:order-1">
          <p className="text-sm font-semibold tracking-wide text-blue-600">
            O Bloomberg dos preços de tecnologia
          </p>
          <h1 className="mt-4 font-display text-[2.25rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
            Vale a pena comprar hoje?
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
            Não é um site de promoções. Não é um comparador. É uma plataforma que
            responde a uma única pergunta — com histórico observado, não com
            marketing.
          </p>
          <div className="mt-8 sm:mt-10">
            <HomeSearchBar autoFocus />
          </div>
          <ul className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
            {PILLS.map((label) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 sm:text-sm"
              >
                <span className="text-green-600" aria-hidden>
                  ✔
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="home-fade order-1 lg:order-2">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {(shots.length
              ? shots
              : loading
                ? Array.from({ length: 6 }).map((_, i) => ({
                    ean: `ph-${i}`,
                    name: "Produto",
                    imageUrl: null,
                  }))
                : []
            ).map((p, i) => (
              <div
                key={"ean" in p ? p.ean : i}
                className={i === 0 || i === 5 ? "sm:translate-y-4" : ""}
              >
                {"slug" in p ? (
                  <ProductShot product={p as Product} />
                ) : (
                  <div className="aspect-square animate-pulse rounded-2xl bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
