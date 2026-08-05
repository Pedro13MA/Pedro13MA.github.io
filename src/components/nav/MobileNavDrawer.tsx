"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MegaMenuModel, NavL1Column } from "@/lib/nav/types";

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  model: MegaMenuModel | null;
};

export function MobileNavDrawer({ id, open, onClose, model }: Props) {
  const [stack, setStack] = useState<NavL1Column | null>(null);

  useEffect(() => {
    if (!open) setStack(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navegação de categorias"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="font-display text-base font-semibold text-slate-900">
            {stack ? stack.label : "Categorias"}
          </p>
          <div className="flex gap-2">
            {stack ? (
              <button
                type="button"
                className="text-sm text-sky-700"
                onClick={() => setStack(null)}
              >
                Voltar
              </button>
            ) : null}
            <button
              type="button"
              className="text-sm text-slate-500"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {!model?.columns?.length && !stack ? (
            <div className="space-y-3 px-3 py-4">
              <p className="text-sm text-slate-600">
                A carregar categorias…
              </p>
              <Link
                href="/categorias/"
                onClick={onClose}
                className="inline-flex text-sm font-medium text-sky-700"
              >
                Ver mapa completo
              </Link>
            </div>
          ) : !stack ? (
            <ul>
              {(model?.columns || []).map((col) => (
                <li key={col.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-slate-800 hover:bg-slate-50"
                    onClick={() => setStack(col)}
                  >
                    {col.label}
                    <span aria-hidden className="text-slate-300">
                      ›
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/categorias/"
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-sky-700"
                >
                  Ver mapa completo
                </Link>
              </li>
              <li>
                <Link
                  href="/mercado/"
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-slate-700"
                >
                  Mercado
                </Link>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <Link
                  href={stack.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 font-medium text-sky-700"
                >
                  Ver {stack.label}
                </Link>
              </li>
              {stack.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-3 text-slate-700 hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {stack.brands.length ? (
                <li className="mt-4 border-t border-slate-100 px-3 pt-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Marcas
                  </p>
                  <ul className="mt-2">
                    {stack.brands.map((b) => (
                      <li key={b.label}>
                        <Link
                          href={b.href}
                          onClick={onClose}
                          className="block py-2 text-sm text-slate-600"
                        >
                          {b.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
