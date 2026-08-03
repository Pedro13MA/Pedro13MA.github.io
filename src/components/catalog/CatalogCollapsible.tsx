"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  readCatalogSectionOpen,
  writeCatalogSectionOpen,
} from "@/lib/catalog-ui";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: number | null;
};

/**
 * Secção colapsável da sidebar do Catálogo — estado em localStorage.
 */
export function CatalogCollapsible({
  id,
  title,
  children,
  defaultOpen = true,
  className,
  badge,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(readCatalogSectionOpen(id, defaultOpen));
  }, [id, defaultOpen]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      writeCatalogSectionOpen(id, next);
      return next;
    });
  }, [id]);

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
          {badge != null && badge > 0 ? (
            <span className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal text-sky-800">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="text-xs text-slate-400" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? <div className="space-y-2">{children}</div> : null}
    </div>
  );
}
