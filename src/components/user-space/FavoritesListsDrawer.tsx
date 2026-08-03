"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createList,
  getFavorites,
  getLists,
  upsertFavoriteInLists,
} from "@/lib/user-space";
import {
  SYSTEM_FAVORITES_LIST_ID,
  type ProductSnapshot,
  type SavedList,
} from "@/lib/user-space/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  product: ProductSnapshot;
  onSaved?: (listIds: string[]) => void;
};

export function FavoritesListsDrawer({
  open,
  onClose,
  product,
  onSaved,
}: Props) {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const [allLists, favs] = await Promise.all([getLists(), getFavorites()]);
      if (cancelled) return;
      setLists(allLists);
      const fav = favs.find((f) => f.slug === product.slug);
      const ids = new Set(fav?.listIds?.length ? fav.listIds : [SYSTEM_FAVORITES_LIST_ID]);
      setSelected(ids);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, product.slug]);

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const ids = [...selected];
      await upsertFavoriteInLists(product, ids);
      onSaved?.(ids);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const addList = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const list = await createList(newName);
      setLists(await getLists());
      setSelected((prev) => new Set(prev).add(list.id));
      setNewName("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal aria-label="Adicionar a listas">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Adicionar a
            </h2>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-4">
          {lists.map((list) => {
            const on = selected.has(list.id);
            return (
              <button
                key={list.id}
                type="button"
                onClick={() => toggle(list.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  on ? "bg-sky-50 text-sky-900" : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border text-[11px]",
                    on
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-300 bg-white text-transparent",
                  )}
                >
                  ✓
                </span>
                {list.name}
                {list.system ? (
                  <span className="ml-auto text-[10px] uppercase text-slate-400">
                    sistema
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              + Nova lista
            </p>
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex.: PC Gaming"
                className="h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void addList();
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={creating || !newName.trim()}
                onClick={() => void addList()}
              >
                Criar
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <Button
            type="button"
            className="w-full"
            disabled={saving}
            onClick={() => void save()}
          >
            {selected.size
              ? `Guardar (${selected.size})`
              : "Remover de todas as listas"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
