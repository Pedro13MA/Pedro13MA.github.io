"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ADMIN_NAV } from "@/services/admin/navigation";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Command palette — navigation only in Phase 1. */
export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ADMIN_NAV;
    return ADMIN_NAV.filter(
      (n) => n.label.toLowerCase().includes(query) || n.href.includes(query),
    );
  }, [q]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          /* parent opens via state — this listens only when mounted open */
        }
      }
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] px-3">
          <Search className="h-4 w-4 text-[var(--admin-faint)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ir para página…"
            className="h-12 w-full bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-faint)]"
          />
        </div>
        <ul className="max-h-72 overflow-auto p-2 admin-scroll">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-hover)]",
                )}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
              >
                <span>{item.label}</span>
                <span className="text-[11px] text-[var(--admin-faint)]">{item.href}</span>
              </button>
            </li>
          ))}
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-[var(--admin-faint)]">
              Sem resultados
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
