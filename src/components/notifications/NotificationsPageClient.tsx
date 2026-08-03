"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  fetchNotifications,
  groupNotificationsByPeriod,
  markNotificationsRead,
  sendTestNotification,
  type AppNotification,
} from "@/lib/notifications/api";

type Tab = "all" | "unread" | "read" | "archived";

function NotificationsBody() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        tab === "unread"
          ? { status: "unread" as const }
          : tab === "read"
            ? { status: "read" as const }
            : tab === "archived"
              ? { archived: true }
              : {};
      const list = await fetchNotifications({ ...params, q: q || undefined });
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const groups = useMemo(() => groupNotificationsByPeriod(items), [items]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Notificações
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Apenas alterações observadas — sem previsões.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/notificacoes/preferencias/"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Preferências
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void sendTestNotification().then(reload)}
          >
            Testar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Recebidas"],
            ["unread", "Não lidas"],
            ["read", "Lidas"],
            ["archived", "Arquivadas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white"
                : "rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar…"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ) : !items.length ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          Ainda não há notificações.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.period} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {g.label}
              </h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {g.items.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={n.href || "#"}
                          className="font-medium text-slate-900 hover:text-sky-800"
                          onClick={() =>
                            n.status === "unread"
                              ? void markNotificationsRead([n.id]).then(reload)
                              : undefined
                          }
                        >
                          {n.title}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">{n.body}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(n.createdAt).toLocaleString("pt-PT")}
                          {n.status === "unread" ? " · não lida" : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        {n.status === "unread" ? (
                          <button
                            type="button"
                            className="text-xs text-sky-700"
                            onClick={() =>
                              void markNotificationsRead([n.id]).then(reload)
                            }
                          >
                            Lida
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="text-xs text-slate-500"
                          onClick={() =>
                            void markNotificationsRead([n.id], {
                              archive: true,
                            }).then(reload)
                          }
                        >
                          Arquivar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export function NotificationsPageClient() {
  return (
    <>
      <SiteHeader />
      <ProtectedRoute>
        <NotificationsBody />
      </ProtectedRoute>
      <SiteFooter />
    </>
  );
}
