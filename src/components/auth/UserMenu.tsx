"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/SessionProvider";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { status, user, signOut } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-full bg-slate-200"
        aria-hidden
      />
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <Link
        href="/entrar/"
        className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm transition-all hover:border-slate-300"
      >
        Entrar
      </Link>
    );
  }

  const initial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 180)}
        className={cn(
          "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm",
          open && "ring-2 ring-sky-400/50",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu da conta"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span aria-hidden>{initial}</span>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.name || "Conta"}
            </p>
            {user.email ? (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            ) : null}
          </div>
          <Link
            href="/minha-area/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Minha Área
          </Link>
          <Link
            href="/favoritos/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Favoritos
          </Link>
          <Link
            href="/projetos/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Projetos
          </Link>
          <Link
            href="/carrinho/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Carrinho
          </Link>
          <Link
            href="/notificacoes/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Notificações
          </Link>
          <Link
            href="/alertas/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Alertas
          </Link>
          <Link
            href="/timeline/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Timeline
          </Link>
          <Link
            href="/perfil/"
            role="menuitem"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            onClick={() => void signOut()}
          >
            Terminar sessão
          </button>
        </div>
      ) : null}
    </div>
  );
}
