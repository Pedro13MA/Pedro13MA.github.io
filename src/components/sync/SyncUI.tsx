"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { SyncService } from "@/lib/sync/sync-service";
import { SyncStatus } from "@/lib/sync/sync-status";
import type { MergeChoice, SyncStatusSnapshot } from "@/lib/sync/types";
import { Button } from "@/components/ui/button";

export function MergeLocalDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return SyncService.onMergeNeeded((needed) => setOpen(needed));
  }, []);

  if (!open) return null;

  const choose = async (choice: MergeChoice) => {
    setBusy(true);
    try {
      await SyncService.applyMerge(choice);
      setOpen(false);
    } catch {
      /* SyncStatus mostra erro */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2
          id="merge-title"
          className="font-display text-xl font-bold text-slate-900"
        >
          Dados neste dispositivo
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Encontrámos dados guardados neste dispositivo. Como queres proceder?
          Nunca apagamos automaticamente.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() => void choose("keep_both")}
          >
            Manter ambos (recomendado)
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void choose("replace_cloud")}
          >
            Substituir cloud pelos dados locais
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void choose("ignore_local")}
          >
            Ignorar dados locais
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatAgo(ts: number | null): string {
  if (!ts) return "ainda não";
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 60) return "há poucos segundos";
  if (sec < 3600) return `há ${Math.floor(sec / 60)} minutos`;
  if (sec < 86400) return `há ${Math.floor(sec / 3600)} horas`;
  return `há ${Math.floor(sec / 86400)} dias`;
}

export function SyncStatusCard() {
  const { status: authStatus } = useSession();
  const [snap, setSnap] = useState<SyncStatusSnapshot>(SyncStatus.get());

  useEffect(() => SyncStatus.subscribe(setSnap), []);

  if (authStatus !== "authenticated") return null;

  const label =
    snap.state === "synced"
      ? "✔ Tudo sincronizado"
      : snap.state === "syncing"
        ? "A sincronizar…"
        : snap.state === "offline"
          ? "Offline — alterações em fila"
          : snap.state === "pending_merge"
            ? "À espera da tua escolha de merge"
            : snap.state === "error"
              ? "Erro de sincronização"
              : "Sincronização";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Sincronização
          </h2>
          <p className="mt-1 text-sm text-slate-600">{label}</p>
          <p className="mt-1 text-xs text-slate-400">
            Última sincronização: {formatAgo(snap.lastSyncAt)}
            {snap.pendingOps > 0
              ? ` · ${snap.pendingOps} operação(ões) em fila`
              : ""}
          </p>
          {snap.devices.length > 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              Dispositivos:{" "}
              {snap.devices.map((d) => d.label || d.id).join(" · ")}
            </p>
          ) : null}
          {snap.error ? (
            <p className="mt-2 text-xs text-red-600">{snap.error}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={snap.state === "syncing"}
          onClick={() => void SyncService.syncNow()}
        >
          Sincronizar agora
        </Button>
      </div>
    </section>
  );
}

/** Arranca sync após login. */
export function SyncBootstrap() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      void SyncService.startAfterLogin();
    } else if (status === "unauthenticated") {
      void SyncService.deactivateToLocal();
    }
  }, [status]);

  return <MergeLocalDialog />;
}

export function CloudSyncedBadge({
  label = "Cloud",
}: {
  label?: string;
}) {
  const [snap, setSnap] = useState(SyncStatus.get());
  useEffect(() => SyncStatus.subscribe(setSnap), []);
  if (snap.state !== "synced" && snap.state !== "syncing") return null;
  return (
    <span className="inline-flex items-center rounded-lg border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
      {snap.state === "syncing" ? "A sincronizar" : label}
    </span>
  );
}

export function CloudFavoriteIcon({ synced }: { synced?: boolean }) {
  const [snap, setSnap] = useState(SyncStatus.get());
  useEffect(() => SyncStatus.subscribe(setSnap), []);
  const show = synced ?? snap.state === "synced";
  if (!show) return null;
  return (
    <span
      className="ml-1 inline-block text-sky-600"
      title="Sincronizado na cloud"
      aria-label="Sincronizado na cloud"
    >
      ☁
    </span>
  );
}
