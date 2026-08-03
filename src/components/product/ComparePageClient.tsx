"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  detailToProduct,
  getProductBySlug,
} from "@/lib/api";
import {
  clearCompare,
  readCompareList,
  removeFromCompare,
  type CompareItem,
} from "@/lib/compare";
import { buildSpecRows } from "@/lib/product-content";
import type { Product } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";

type Loaded = {
  item: CompareItem;
  product: Product | null;
};

export function ComparePageClient() {
  const [rows, setRows] = useState<Loaded[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const list = readCompareList();
    if (!list.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      list.map(async (item) => {
        try {
          const detail = await getProductBySlug(item.slug);
          return { item, product: detailToProduct(detail) };
        } catch {
          return { item, product: null };
        }
      }),
    ).then((res) => {
      if (!cancelled) {
        setRows(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const specKeys = useMemo(() => {
    const keys = new Set<string>();
    const labels = new Map<string, string>();
    for (const row of rows) {
      if (!row.product) continue;
      for (const s of buildSpecRows(row.product)) {
        keys.add(s.key);
        labels.set(s.key, s.label);
      }
    }
    return [...keys].map((key) => ({ key, label: labels.get(key) || key }));
  }, [rows]);

  const refresh = () => {
    const list = readCompareList();
    setRows((prev) =>
      list.map((item) => {
        const found = prev.find((p) => p.item.slug === item.slug);
        return found || { item, product: null };
      }),
    );
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Comparar produtos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Até 4 produtos lado a lado — dados do catálogo Limiar.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                clearCompare();
                setRows([]);
              }}
            >
              Limpar
            </Button>
            <Link
              href="/catalog/"
              className="inline-flex h-9 items-center rounded-xl bg-slate-900 px-3 text-sm font-medium text-white"
            >
              Catálogo
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        ) : rows.length < 2 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold text-slate-900">
              Precisa de pelo menos 2 produtos
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Use «VS Comparar» nas páginas de produto.
            </p>
            <Link
              href="/catalog/"
              className="mt-6 inline-flex h-10 items-center rounded-xl bg-sky-700 px-4 text-sm font-medium text-white"
            >
              Ir ao catálogo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Atributo
                  </th>
                  {rows.map((row) => (
                    <th key={row.item.slug} className="min-w-[12rem] px-4 py-3 text-left">
                      <div className="flex h-20 items-center justify-center rounded-lg bg-white p-2">
                        {row.item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.item.imageUrl}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 font-medium text-slate-900 line-clamp-2">
                        {row.item.name}
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-xs text-rose-700 hover:underline"
                        onClick={() => {
                          removeFromCompare(row.item.slug);
                          refresh();
                        }}
                      >
                        Remover
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CmpRow label="Preço" values={rows.map((r) => formatEUR(r.item.currentPrice))} />
                <CmpRow
                  label="Score Limiar"
                  values={rows.map((r) => `${r.item.limiarIndex}/100`)}
                />
                <CmpRow
                  label="Marca"
                  values={rows.map((r) => r.item.brand || "—")}
                />
                <CmpRow
                  label="Lojas"
                  values={rows.map((r) =>
                    r.product ? String(r.product.offers.length) : "—",
                  )}
                />
                <CmpRow
                  label="Mín. histórico"
                  values={rows.map((r) =>
                    r.product ? formatEUR(r.product.historicalMin) : "—",
                  )}
                />
                {specKeys.map((sk) => (
                  <CmpRow
                    key={sk.key}
                    label={sk.label}
                    values={rows.map((r) => {
                      if (!r.product) return "—";
                      const hit = buildSpecRows(r.product).find((s) => s.key === sk.key);
                      return hit?.value || "—";
                    })}
                  />
                ))}
                <tr className="border-t border-slate-100">
                  <td className="sticky left-0 bg-white px-4 py-3 text-slate-500">
                    Ficha
                  </td>
                  {rows.map((r) => (
                    <td key={r.item.slug} className="px-4 py-3">
                      <Link
                        href={`/p/?id=${encodeURIComponent(r.item.slug)}`}
                        className="text-sky-700 hover:underline"
                      >
                        Ver produto
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function CmpRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-slate-100">
      <th
        scope="row"
        className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-slate-500"
      >
        {label}
      </th>
      {values.map((v, i) => (
        <td key={`${label}-${i}`} className="px-4 py-3 font-medium text-slate-900">
          {v}
        </td>
      ))}
    </tr>
  );
}
