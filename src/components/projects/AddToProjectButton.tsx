"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderKanban, X } from "lucide-react";
import {
  addProductToProject,
  createProject,
  listProjects,
  subscribeProjects,
} from "@/lib/projects";
import type { Project } from "@/lib/projects/types";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSnackbar } from "@/components/user-space/Snackbar";
import { Button } from "@/components/ui/button";

type Props = {
  product: Product;
  className?: string;
  compact?: boolean;
  /** Prefer this project when known (project detail page). */
  preferredProjectId?: string;
  preferredSlotId?: string;
};

/**
 * Adicionar ao Projeto — picker se houver vários.
 * Reutiliza pesquisa existente via produto já carregado.
 */
export function AddToProjectButton({
  product,
  className,
  compact,
  preferredProjectId,
  preferredSlotId,
}: Props) {
  const { push } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setProjects(await listProjects());
  }, []);

  useEffect(() => {
    void reload();
    return subscribeProjects(() => {
      void reload();
    });
  }, [reload]);

  const addTo = async (projectId: string, slotId?: string) => {
    setBusy(true);
    try {
      const res = await addProductToProject(projectId, product, slotId);
      if (!res.ok && res.reason === "full") {
        push("Projeto sem slots livres. Abra o projeto e troque um item.");
        return;
      }
      if (!res.ok) {
        push("Não foi possível adicionar.");
        return;
      }
      push("Adicionado ao projeto.", {
        action: {
          label: "Ver",
          onClick: () => {
            window.location.href = `/projetos/p/?id=${encodeURIComponent(projectId)}`;
          },
        },
      });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (preferredProjectId) {
      await addTo(preferredProjectId, preferredSlotId);
      return;
    }
    const list = await listProjects();
    setProjects(list);
    if (!list.length) {
      const p = await createProject({
        name: "Novo Projeto",
        templateId: "blank",
      });
      await addTo(p.id);
      return;
    }
    if (list.length === 1) {
      await addTo(list[0].id);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={`Adicionar ${product.name} ao projeto`}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900",
          compact ? "h-8 px-2" : "h-9 px-3",
          className,
        )}
      >
        <FolderKanban className="h-3.5 w-3.5" aria-hidden />
        {compact ? "Projeto" : "Adicionar ao Projeto"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80]"
          role="dialog"
          aria-modal
          aria-label="Escolher projeto"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-1/2 top-[15%] w-[min(22rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Adicionar a
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => void addTo(p.id)}
                  >
                    {p.name}
                    <span className="mt-0.5 block text-xs font-normal text-slate-400">
                      {p.slots.filter((s) => s.product).length}/
                      {p.slots.length} preenchidos
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={async () => {
                const p = await createProject({
                  name: "Novo Projeto",
                  templateId: "blank",
                });
                await addTo(p.id);
              }}
            >
              Novo Projeto
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
