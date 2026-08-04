"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useSession } from "@/components/auth/SessionProvider";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationsRead,
  type AppNotification,
} from "@/lib/notifications/api";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);

  const reload = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const [c, list] = await Promise.all([
        fetchUnreadCount(),
        fetchNotifications({ status: "unread" }),
      ]);
      setCount(c);
      setItems(list.slice(0, 8));
    } catch {
      /* offline / unauth */
    }
  }, [status]);

  useEffect(() => {
    void reload();
    const t = window.setInterval(() => void reload(), 60000);
    return () => window.clearInterval(t);
  }, [reload]);

  if (status !== "authenticated") return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300",
          open && "ring-2 ring-sky-400/40",
        )}
        aria-label="Notificações"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void reload();
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 180)}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-700 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notificações</p>
            <button
              type="button"
              className="text-xs text-sky-700 hover:underline"
              onClick={() =>
                void markNotificationsRead([], { all: true }).then(reload)
              }
            >
              Marcar todas lidas
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {!items.length ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                Sem notificações novas
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href || "/notificacoes/"}
                    role="menuitem"
                    className="block px-3 py-2.5 hover:bg-slate-50"
                    onClick={() =>
                      void markNotificationsRead([n.id]).then(reload)
                    }
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {n.body}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/notificacoes/"
            className="block border-t border-slate-100 px-3 py-2.5 text-center text-sm font-medium text-sky-700 hover:bg-slate-50"
          >
            Ver todas
          </Link>
        </div>
      ) : null}
    </div>
  );
}
