"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/SessionProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

/** Conta no header light da homepage. */
export function HomeAccountMenu() {
  const { status, user, signOut } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" aria-hidden />
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <Link
        href="/entrar/"
        className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-blue-300 hover:text-blue-600"
      >
        Entrar
      </Link>
    );
  }

  const initial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onBlur={() => window.setTimeout(() => setOpen(false), 180)}
          className={cn(
            "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800",
            open && "ring-2 ring-blue-500/30",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Menu da conta"
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <Link
              href="/minha-area/"
              role="menuitem"
              className="block px-3 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
            >
              Minha Área
            </Link>
            <Link
              href="/perfil/"
              role="menuitem"
              className="block px-3 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
            >
              Perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50"
              onMouseDown={() => void signOut()}
            >
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
