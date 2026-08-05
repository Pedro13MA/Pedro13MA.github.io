"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { MegaMenuModel, NavL1Column } from "@/lib/nav/types";
import {
  MegaMenuBrands,
  MegaMenuColumn,
  MegaMenuQuickLinks,
} from "@/components/nav/MegaMenuParts";

type Props = {
  model: MegaMenuModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerId: string;
};

export function MegaMenu({ model, open, onOpenChange, triggerId }: Props) {
  const panelId = useId();
  const [activeId, setActiveId] = useState(model.columns[0]?.id ?? "");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active: NavL1Column | undefined =
    model.columns.find((c) => c.id === activeId) || model.columns[0];

  const clearClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(() => onOpenChange(false), 160);
  };

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        document.getElementById(triggerId)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, triggerId]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (document.getElementById(triggerId)?.contains(t)) return;
      close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close, triggerId]);

  if (!model.columns.length) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 hidden lg:block"
      onMouseEnter={() => {
        clearClose();
        onOpenChange(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <div
        ref={panelRef}
        id={panelId}
        role="menu"
        aria-labelledby={triggerId}
        hidden={!open}
        className={`border-b border-slate-200 bg-white shadow-lg ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto flex max-w-6xl gap-2 px-4 py-3 sm:px-6">
          <div
            className="flex shrink-0 flex-col gap-0.5 border-r border-slate-100 pr-3"
            role="tablist"
            aria-label="Categorias principais"
          >
            {model.columns.map((col) => {
              const selected = col.id === active?.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`rounded-lg px-3 py-2 text-left text-sm ${
                    selected
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setActiveId(col.id)}
                  onFocus={() => setActiveId(col.id)}
                >
                  {col.label}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-1 gap-6 overflow-x-auto py-2 pl-4">
            {active ? (
              <>
                <MegaMenuColumn column={active} onNavigate={close} />
                <MegaMenuQuickLinks
                  links={model.quickLinks}
                  onNavigate={close}
                />
                <MegaMenuBrands brands={active.brands} onNavigate={close} />
              </>
            ) : null}
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
            <Link
              href={model.allCategoriesHref}
              onClick={close}
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              Ver todas as categorias →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MegaMenuTrigger({
  id,
  open,
  onOpenChange,
  label = "Categorias",
}: {
  id: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      className="shrink-0 text-sm text-slate-600 hover:text-slate-900"
      onClick={() => onOpenChange(!open)}
      onMouseEnter={() => onOpenChange(true)}
    >
      {label}
      <span className="ml-0.5 text-slate-400" aria-hidden>
        ▾
      </span>
    </button>
  );
}
