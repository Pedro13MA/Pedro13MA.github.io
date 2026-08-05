"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  fetchNotificationPreferences,
  registerPushDevice,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notifications/api";

const SCOPE_LABELS: Record<string, string> = {
  product: "Produto",
  category: "Categoria",
  brand: "Marca",
  store: "Loja",
  projects: "Projetos",
  cart: "Carrinho",
  watchlists: "Watchlists",
  promotions: "Promoções",
  coupons: "Cupões",
  market: "Mercado",
};

function PreferencesBody() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void fetchNotificationPreferences()
      .then(setPrefs)
      .catch(() => setPrefs(null));
  }, []);

  if (!prefs) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  const save = async () => {
    const next = await saveNotificationPreferences(prefs);
    setPrefs(next);
    setMsg("Preferências guardadas.");
  };

  const enableBrowser = async () => {
    if (!("Notification" in window)) {
      setMsg("Este browser não suporta notificações.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setMsg("Permissão recusada.");
      return;
    }
    new Notification("Lymiar", {
      body: "Notificações do browser activas. Só eventos observados.",
    });
    setPrefs((p) =>
      p
        ? {
            ...p,
            channels: { ...p.channels, browser: true },
          }
        : p,
    );
    setMsg("Browser notifications activas.");
  };

  const enablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMsg("Web Push não disponível neste browser.");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register("/sw-notifications.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: undefined,
      });
      await registerPushDevice(sub.toJSON());
      setPrefs((p) =>
        p ? { ...p, channels: { ...p.channels, push: true } } : p,
      );
      setMsg("Web Push registado.");
    } catch {
      // Sem VAPID key pública — guardamos intenção browser-only
      setMsg(
        "Web Push requer chave VAPID no servidor. Preferência Push marcada; subscription quando configurada.",
      );
      setPrefs((p) =>
        p ? { ...p, channels: { ...p.channels, push: true } } : p,
      );
    }
  };

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-xs text-slate-400">
          <Link href="/notificacoes/" className="hover:underline">
            Notificações
          </Link>{" "}
          / Preferências
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
          Preferências
        </h1>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-display text-lg font-semibold">Canais</h2>
        {(["email", "push", "browser"] as const).map((ch) => (
          <label key={ch} className="flex items-center justify-between gap-2 text-sm">
            <span className="capitalize">{ch === "push" ? "Web Push" : ch}</span>
            <input
              type="checkbox"
              checked={!!prefs.channels[ch]}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  channels: { ...prefs.channels, [ch]: e.target.checked },
                })
              }
            />
          </label>
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void enableBrowser()}>
            Activar browser
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => void enablePush()}>
            Activar Web Push
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-display text-lg font-semibold">Âmbito</h2>
        {Object.keys(SCOPE_LABELS).map((key) => (
          <label key={key} className="flex items-center justify-between gap-2 text-sm">
            <span>{SCOPE_LABELS[key]}</span>
            <input
              type="checkbox"
              checked={!!prefs.scopes[key]}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  scopes: { ...prefs.scopes, [key]: e.target.checked },
                })
              }
            />
          </label>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-display text-lg font-semibold">Frequência</h2>
        <select
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={prefs.frequency}
          onChange={(e) =>
            setPrefs({ ...prefs, frequency: e.target.value })
          }
        >
          <option value="immediate">Imediato</option>
          <option value="daily">Resumo diário</option>
          <option value="weekly">Resumo semanal</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.quietHours.enabled}
            onChange={(e) =>
              setPrefs({
                ...prefs,
                quietHours: { ...prefs.quietHours, enabled: e.target.checked },
              })
            }
          />
          Silenciar horários
        </label>
        {prefs.quietHours.enabled ? (
          <div className="flex gap-2">
            <input
              type="time"
              value={prefs.quietHours.start}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  quietHours: { ...prefs.quietHours, start: e.target.value },
                })
              }
              className="rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
            />
            <input
              type="time"
              value={prefs.quietHours.end}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  quietHours: { ...prefs.quietHours, end: e.target.value },
                })
              }
              className="rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
            />
          </div>
        ) : null}
      </section>

      <Button type="button" onClick={() => void save()}>
        Guardar
      </Button>
      {msg ? <p className="text-sm text-slate-500">{msg}</p> : null}
    </main>
  );
}

export function NotificationPreferencesClient() {
  return (
    <>
      <SiteHeader />
      <ProtectedRoute>
        <PreferencesBody />
      </ProtectedRoute>
      <SiteFooter />
    </>
  );
}
