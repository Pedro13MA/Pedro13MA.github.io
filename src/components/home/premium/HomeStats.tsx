"use client";

/**
 * Contagens de catálogo — só exactas, sem arredondar com “+”.
 * Não usadas na homepage (métricas de vaidade confundem transparência).
 * Mantido para eventual página Mercado / sobre o catálogo.
 */
import { useEffect, useState } from "react";
import { getHome, type HomepageMarketSummary } from "@/lib/api";

function formatExact(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  return new Intl.NumberFormat("pt-PT").format(Math.trunc(n));
}

export function HomeStats() {
  const [summary, setSummary] = useState<HomepageMarketSummary | null>(null);

  useEffect(() => {
    let c = false;
    getHome()
      .then((d) => {
        if (!c) setSummary(d.marketSummary);
      })
      .catch(() => {
        if (!c) setSummary(null);
      });
    return () => {
      c = true;
    };
  }, []);

  if (!summary) return null;

  const items = [
    { value: formatExact(summary.products), label: "Produtos observados" },
    { value: formatExact(summary.stores), label: "Lojas" },
    { value: formatExact(summary.brands), label: "Marcas" },
    { value: formatExact(summary.categories), label: "Categorias" },
  ];

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={
                i < items.length - 1
                  ? "lg:border-r lg:border-slate-200 lg:pr-6"
                  : ""
              }
            >
              <p className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-slate-400">
          Contagens exactas do catálogo no momento do pedido — sem arredondar.
        </p>
      </div>
    </section>
  );
}
