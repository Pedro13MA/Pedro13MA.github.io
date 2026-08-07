"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertItem } from "@/types/admin";
import { StatusBadge } from "./StatusBadge";

type Props = {
  items?: AlertItem[];
  className?: string;
};

export function NotificationDropdown({ items = [], className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const count = items.length;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
        aria-label="Notificações"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--admin-brand)] px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl">
          <div className="border-b border-[var(--admin-border)] px-3 py-2 text-xs font-medium text-[var(--admin-muted)]">
            Notificações
          </div>
          <ul className="max-h-72 overflow-auto admin-scroll">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-[var(--admin-faint)]">
                Sem notificações
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-[var(--admin-border)] px-3 py-3 last:border-0"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <StatusBadge tone={item.tone === "ok" ? "ok" : item.tone}>
                      {item.tone}
                    </StatusBadge>
                    <span className="text-[10px] text-[var(--admin-faint)]">
                      {item.timeLabel}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--admin-text)]">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
                    {item.description}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
