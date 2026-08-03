"use client";

/**
 * FASE 7.19 / 8.0 — /minha-area dashboard (protegida + guest CTA).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import {
  getWatchStats,
  listWatches,
  subscribeWatchlists,
  unfollow,
  WATCH_KIND_LABEL,
  type WatchItem,
  type WatchStats,
} from "@/lib/watchlists";
import { getAlerts, getFavorites, loadUserSpace } from "@/lib/user-space";
import { listProjects } from "@/lib/projects";
import { cartItemCount, subscribeSmartCart } from "@/lib/smart-cart";
import { formatEUR } from "@/lib/utils";
import { useSession } from "@/components/auth/SessionProvider";
import { LoadingAuth } from "@/components/auth/LoadingAuth";
import { SyncStatusCard } from "@/components/sync/SyncUI";

type Counts = {
  favorites: number;
  alerts: number;
  lists: number;
  projects: number;
  cartItems: number;
};

function StatLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string | number;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/40"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-900">
        {value}
      </p>
    </Link>
  );
}

function GuestMinhaArea() {
  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">
        Minha Área
      </h1>
      <p className="text-sm leading-relaxed text-slate-500">
        Entra para acederes ao teu perfil, favoritos, alertas, projetos, carrinho
        e timeline. Com conta, os dados sincronizam entre dispositivos.
      </p>
      <ul className="space-y-2 text-left text-sm text-slate-600">
        <li>· Guardar favoritos e listas</li>
        <li>· Gerir alertas de preço</li>
        <li>· Projetos e carrinho inteligente</li>
        <li>· Timeline do que segues</li>
      </ul>
      <Link
        href="/entrar/"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-base font-medium text-white shadow-sm hover:bg-slate-800 sm:w-auto"
      >
        Entrar
      </Link>
    </main>
  );
}

function AuthenticatedMinhaArea() {
  const [counts, setCounts] = useState<Counts>({
    favorites: 0,
    alerts: 0,
    lists: 0,
    projects: 0,
    cartItems: 0,
  });
  const [stats, setStats] = useState<WatchStats | null>(null);
  const [watches, setWatches] = useState<WatchItem[]>([]);

  const reload = async () => {
    const [space, favs, alerts, projects, cart, wstats, wlist] =
      await Promise.all([
        loadUserSpace(),
        getFavorites(),
        getAlerts(),
        listProjects(),
        cartItemCount(),
        getWatchStats(),
        listWatches(true),
      ]);
    setCounts({
      favorites: favs.length,
      alerts: alerts.filter((a) => a.active !== false).length,
      lists: space.lists?.length ?? 0,
      projects: projects.length,
      cartItems: cart,
    });
    setStats(wstats);
    setWatches(wlist);
  };

  useEffect(() => {
    void reload();
    const u1 = subscribeWatchlists(() => {
      void reload();
    });
    const u2 = subscribeSmartCart(() => {
      void cartItemCount().then((n) =>
        setCounts((c) => ({ ...c, cartItems: n })),
      );
    });
    return () => {
      u1();
      u2();
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Minha Área
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Favoritos, alertas, projetos, carrinho e timeline — sincronizados na
          cloud quando estás autenticado.
        </p>
      </div>

      <SyncStatusCard />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatLink href="/perfil/" label="Perfil" value="→" />
        <StatLink href="/notificacoes/" label="Notificações" value="→" />
        <StatLink href="/favoritos/" label="Favoritos" value={counts.favorites} />
        <StatLink href="/alertas/" label="Alertas" value={counts.alerts} />
        <StatLink href="/projetos/" label="Projetos" value={counts.projects} />
        <StatLink href="/carrinho/" label="Carrinho" value={counts.cartItems} />
        <StatLink
          href="/timeline/"
          label="Timeline"
          value={stats?.eventsThisWeek ?? 0}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Watchlists
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Produtos</p>
            <p className="font-display text-xl font-bold">
              {stats?.products ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Categorias</p>
            <p className="font-display text-xl font-bold">
              {stats?.categories ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Marcas / Lojas</p>
            <p className="font-display text-xl font-bold">
              {(stats?.brands ?? 0) + (stats?.stores ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Preço total acompanhado</p>
            <p className="font-display text-xl font-bold">
              {stats ? formatEUR(stats.followedValueEur) : "—"}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Eventos esta semana:{" "}
          <span className="font-medium text-slate-800">
            {stats?.eventsThisWeek ?? 0}
          </span>
          {" · "}
          Projetos seguidos: {stats?.projects ?? 0}
          {" · "}
          Carrinho: {stats?.smartCarts ?? 0}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-slate-900">
            A seguir
          </h2>
          <Link
            href="/timeline/"
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            Ver timeline
          </Link>
        </div>
        {!watches.length ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            Ainda não segue nada. Use o botão Seguir nas páginas de produto,
            categoria, marca, loja, projeto ou carrinho.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {watches.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="text-xs text-slate-400">
                    {WATCH_KIND_LABEL[w.kind]}
                  </p>
                  <Link
                    href={w.target.href}
                    className="font-medium text-slate-900 hover:text-sky-800 hover:underline"
                  >
                    {w.target.label}
                  </Link>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  onClick={() =>
                    void unfollow(w.kind, w.target.key).then(reload)
                  }
                >
                  Deixar de seguir
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export function MinhaAreaPageClient() {
  const { status } = useSession();

  return (
    <>
      <SiteHeader />
      {status === "loading" ? (
        <LoadingAuth />
      ) : status === "authenticated" ? (
        <AuthenticatedMinhaArea />
      ) : (
        <GuestMinhaArea />
      )}
      <SiteFooter />
    </>
  );
}
