"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CloudFavoriteIcon } from "@/components/sync/SyncUI";
import { Button } from "@/components/ui/button";
import { useSnackbar } from "@/components/user-space/Snackbar";
import {
  getFavorites,
  getLists,
  removeFavorite,
  subscribeUserSpace,
  upsertFavoriteInLists,
} from "@/lib/user-space";
import type { Favorite, SavedList } from "@/lib/user-space/types";
import { storeDisplayName } from "@/lib/storeLogos";
import { formatEUR } from "@/lib/utils";

type SortKey = "recent" | "price" | "score" | "name";

export function FavoritesPageClient() {
  const searchParams = useSearchParams();
  const listFromUrl = searchParams.get("list") || "all";
  const { push } = useSnackbar();
  const [items, setItems] = useState<Favorite[]>([]);
  const [lists, setLists] = useState<SavedList[]>([]);
  const [sort, setSort] = useState<SortKey>("recent");
  const [listFilter, setListFilter] = useState<string>(listFromUrl);

  useEffect(() => {
    setListFilter(listFromUrl);
  }, [listFromUrl]);

  const reload = async () => {
    setItems(await getFavorites());
    setLists(await getLists());
  };

  useEffect(() => {
    void reload();
    return subscribeUserSpace(() => {
      void reload();
    });
  }, []);

  const sorted = useMemo(() => {
    let list = [...items];
    if (listFilter !== "all") {
      list = list.filter((f) => f.listIds.includes(listFilter));
    }
    list.sort((a, b) => {
      if (sort === "price") return a.currentPrice - b.currentPrice;
      if (sort === "score") return b.limiarIndex - a.limiarIndex;
      if (sort === "name") return a.name.localeCompare(b.name, "pt");
      return b.savedAt - a.savedAt;
    });
    return list;
  }, [items, sort, listFilter]);

  const remove = async (fav: Favorite) => {
    const snapshot = { ...fav };
    await removeFavorite(fav.slug);
    push("Removido dos favoritos.", {
      action: {
        label: "Anular",
        onClick: () => {
          void upsertFavoriteInLists(snapshot, snapshot.listIds);
        },
      },
    });
  };

  return (
    <>
      <SiteHeader />
      <ProtectedRoute>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Favoritos
              <CloudFavoriteIcon />
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Guardados na tua conta — sincronização cloud activa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Todas as listas</option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="recent">Mais recentes</option>
              <option value="price">Preço</option>
              <option value="score">Score</option>
              <option value="name">Nome</option>
            </select>
          </div>
        </div>

        {!sorted.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold text-slate-900">
              Ainda sem favoritos
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Use ♡ nas fichas de produto para guardar.
            </p>
            <Link
              href="/catalog/"
              className="mt-6 inline-flex h-10 items-center rounded-xl bg-sky-700 px-4 text-sm font-medium text-white"
            >
              Ir ao catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((fav) => (
              <li
                key={fav.slug}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <Link
                  href={`/p/?id=${encodeURIComponent(fav.slug)}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                    {fav.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fav.imageUrl}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{fav.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatEUR(fav.currentPrice)} · Índice {fav.limiarIndex}
                      {fav.cheapestStore
                        ? ` · ${storeDisplayName(fav.cheapestStore)}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Guardado{" "}
                      {new Date(fav.savedAt).toLocaleDateString("pt-PT")}
                      {fav.updatedAt !== fav.savedAt
                        ? ` · actualizado ${new Date(fav.updatedAt).toLocaleDateString("pt-PT")}`
                        : ""}
                    </p>
                  </div>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void remove(fav)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
      </ProtectedRoute>
      <SiteFooter />
    </>
  );
}
