"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/user-space/Snackbar";
import {
  createList,
  deleteList,
  getFavorites,
  getLists,
  renameList,
  subscribeUserSpace,
} from "@/lib/user-space";
import {
  SYSTEM_FAVORITES_LIST_ID,
  type Favorite,
  type SavedList,
} from "@/lib/user-space/types";

export function ListsPageClient() {
  const { push } = useSnackbar();
  const [lists, setLists] = useState<SavedList[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [newName, setNewName] = useState("");

  const reload = async () => {
    setLists(await getLists());
    setFavorites(await getFavorites());
  };

  useEffect(() => {
    void reload();
    return subscribeUserSpace(() => {
      void reload();
    });
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const list of lists) map.set(list.id, 0);
    for (const fav of favorites) {
      for (const id of fav.listIds) {
        map.set(id, (map.get(id) || 0) + 1);
      }
    }
    return map;
  }, [lists, favorites]);

  return (
    <>
      <SiteHeader />
      <ProtectedRoute>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Listas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Organize produtos em listas pessoais (PC Gaming, Natal, …).
        </p>

        <div className="mt-6 flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nova lista…"
            className="h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                void createList(newName).then(() => {
                  setNewName("");
                  push("Lista criada.");
                  void reload();
                });
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              if (!newName.trim()) return;
              void createList(newName).then(() => {
                setNewName("");
                push("Lista criada.");
                void reload();
              });
            }}
          >
            Criar
          </Button>
        </div>

        <ul className="mt-6 space-y-2">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{list.name}</p>
                <p className="text-xs text-slate-400">
                  {counts.get(list.id) || 0} produto
                  {(counts.get(list.id) || 0) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/favoritos/?list=${encodeURIComponent(list.id)}`}
                  className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Ver
                </Link>
                {!list.system && list.id !== SYSTEM_FAVORITES_LIST_ID ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const name = window.prompt("Novo nome", list.name);
                        if (name) void renameList(list.id, name).then(reload);
                      }}
                    >
                      Renomear
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Eliminar «${list.name}»?`)) {
                          void deleteList(list.id).then(() => {
                            push("Lista eliminada.");
                            void reload();
                          });
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </main>
      </ProtectedRoute>
      <SiteFooter />
    </>
  );
}
