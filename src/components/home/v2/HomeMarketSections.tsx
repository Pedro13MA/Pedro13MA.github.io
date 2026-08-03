"use client";

import Link from "next/link";
import type {
  HomepageCategoryCard,
  HomepageMarketSummary,
  MarketplaceBrandListItem,
  MarketplaceStoreListItem,
} from "@/lib/api";
import {
  HomeEmpty,
  HomeScroller,
  HomeSection,
} from "@/components/home/v2/HomeShared";
import { formatEUR } from "@/lib/utils";

export function HomeCategories({ items }: { items: HomepageCategoryCard[] }) {
  return (
    <HomeSection
      id="categorias"
      title="Categorias"
      subtitle="Explora por área — com contagens e preço médio observados."
      href="/categorias/"
    >
      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${encodeURIComponent(c.slug)}/`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/40"
            >
              <p className="font-display text-lg font-bold text-slate-900">
                {c.displayName}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {c.products} produtos
                {c.avgPrice != null ? ` · média ${formatEUR(c.avgPrice)}` : ""}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <HomeEmpty message="Categorias indisponíveis." />
      )}
    </HomeSection>
  );
}

export function HomeBrands({ items }: { items: MarketplaceBrandListItem[] }) {
  return (
    <HomeSection
      title="Marcas populares"
      subtitle="Marcas com mais produtos no catálogo observado."
      href="/mercado/marcas/"
    >
      {items.length ? (
        <HomeScroller>
          {items.map((b) => (
            <Link
              key={b.slug}
              href={`/mercado/marca/?id=${encodeURIComponent(b.slug)}`}
              className="w-36 shrink-0 snap-start rounded-xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm hover:border-slate-300"
            >
              <p className="font-display text-sm font-bold text-slate-900">
                {b.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">{b.products} produtos</p>
            </Link>
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem marcas para listar." />
      )}
    </HomeSection>
  );
}

export function HomeStores({ items }: { items: MarketplaceStoreListItem[] }) {
  return (
    <HomeSection
      title="Lojas"
      subtitle="Lojas com ofertas observadas no Limiar."
      href="/mercado/lojas/"
    >
      {items.length ? (
        <HomeScroller>
          {items.map((s) => (
            <Link
              key={s.slug}
              href={`/mercado/loja/?id=${encodeURIComponent(s.slug)}`}
              className="w-40 shrink-0 snap-start rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm hover:border-slate-300"
            >
              <p className="font-display text-sm font-bold text-slate-900">
                {s.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {s.products} produtos
                {s.avgPrice != null ? ` · ${formatEUR(s.avgPrice)}` : ""}
              </p>
            </Link>
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem lojas para listar." />
      )}
    </HomeSection>
  );
}

export function HomeMarket({ summary }: { summary: HomepageMarketSummary }) {
  const cells = [
    { label: "Produtos", value: summary.products.toLocaleString("pt-PT") },
    { label: "Marcas", value: summary.brands.toLocaleString("pt-PT") },
    { label: "Lojas", value: String(summary.stores) },
    {
      label: "Preço médio",
      value: summary.avgPrice != null ? formatEUR(summary.avgPrice) : "—",
    },
    {
      label: "Promoções",
      value: String(summary.promotionsActive),
    },
    {
      label: "Cupões",
      value: String(summary.couponsActive),
    },
    {
      label: "Classificados",
      value:
        summary.classifiedPct != null ? `${summary.classifiedPct}%` : "—",
    },
  ];
  return (
    <HomeSection
      title="Mercado"
      subtitle="Resumo factual do catálogo observado."
      href="/mercado/"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {c.label}
            </p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums text-slate-900">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}

export function HomeStats({ summary }: { summary: HomepageMarketSummary }) {
  return (
    <HomeSection title="Estatísticas" subtitle="Cobertura observada do Limiar.">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-6 sm:px-8">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li className="text-sm text-slate-600">
            <span className="font-display text-2xl font-bold text-slate-900">
              {summary.products.toLocaleString("pt-PT")}
            </span>
            <br />
            produtos
          </li>
          <li className="text-sm text-slate-600">
            <span className="font-display text-2xl font-bold text-slate-900">
              {summary.brands.toLocaleString("pt-PT")}
            </span>
            <br />
            marcas
          </li>
          <li className="text-sm text-slate-600">
            <span className="font-display text-2xl font-bold text-slate-900">
              {summary.stores}
            </span>
            <br />
            lojas
          </li>
          <li className="text-sm text-slate-600">
            <span className="font-display text-2xl font-bold text-slate-900">
              {summary.classifiedPct != null
                ? `${summary.classifiedPct}%`
                : "—"}
            </span>
            <br />
            classificados (leaf)
          </li>
        </ul>
      </div>
    </HomeSection>
  );
}
