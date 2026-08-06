"use client";

import { useEffect, useState } from "react";
import {
  getRecentMetrics,
  isApiMetricsEnabled,
  subscribeMetrics,
  type ApiMetricEntry,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

function fmtMs(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${Math.round(n)} ms`;
}

function displayPath(path: string): string {
  const pathname = path.split("?")[0] ?? path;
  return pathname.replace(/^\/api\/v1/, "") || pathname;
}

function statusTone(entry: ApiMetricEntry): string {
  if (entry.cache === "HIT") return "text-emerald-400";
  if (entry.aborted) return "text-amber-400";
  if (entry.status === "error") return "text-red-400";
  return "text-slate-300";
}

function statusLabel(entry: ApiMetricEntry): string {
  if (entry.aborted) return "ABORT";
  if (entry.status === "error") return "ERR";
  return String(entry.status);
}

function MetricRow({ entry }: { entry: ApiMetricEntry }) {
  const total =
    entry.renderMs != null
      ? entry.networkMs + entry.transferMs + entry.renderMs
      : entry.totalMs;

  return (
    <div className="border-b border-white/10 px-3 py-2.5 text-[11px] leading-relaxed">
      <div className="font-mono text-[10px] uppercase tracking-wide text-white/45">
        {entry.method} {displayPath(entry.path)}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className={cn("font-semibold tracking-wide", statusTone(entry))}>
          {entry.label}
        </span>
        <span className="font-mono text-white/90">{fmtMs(total)}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-white/55">
        <span>Status</span>
        <span className="text-right">{statusLabel(entry)}</span>
        <span>Cache</span>
        <span className="text-right">{entry.cache}</span>
        <span>Dedup</span>
        <span className="text-right">{entry.deduped ? "YES" : "NO"}</span>
        <span>Aborted</span>
        <span className="text-right">{entry.aborted ? "YES" : "NO"}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-white/70">
        <span>Network</span>
        <span className="text-right">{fmtMs(entry.networkMs)}</span>
        <span>Backend</span>
        <span className="text-right">{fmtMs(entry.backendMs)}</span>
        <span>Transfer</span>
        <span className="text-right">{fmtMs(entry.transferMs)}</span>
        <span>Render</span>
        <span className="text-right">{fmtMs(entry.renderMs)}</span>
        <span className="text-white/90">Total</span>
        <span className="text-right text-white/90">{fmtMs(total)}</span>
      </div>
      {entry.error && !entry.aborted && (
        <div className="mt-1 truncate text-red-400/80">{entry.error}</div>
      )}
    </div>
  );
}

export function ApiMetricsPanel() {
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!isApiMetricsEnabled()) return;
    return subscribeMetrics(() => tick((n) => n + 1));
  }, []);

  if (!isApiMetricsEnabled()) return null;

  const entries = getRecentMetrics();

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div className="pointer-events-auto w-[min(92vw,340px)] overflow-hidden rounded-lg border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-md">
          <div className="border-b border-white/10 px-3 py-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/80">
              API Metrics
            </div>
            <div className="text-[10px] text-white/45">
              dev/staging — últimos {entries.length} pedidos
            </div>
          </div>
          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-white/40">
                Sem pedidos ainda
              </div>
            ) : (
              entries.map((e) => <MetricRow key={e.id} entry={e} />)
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto rounded-full border border-white/20 bg-slate-900/90 px-3 py-1.5 text-[11px] font-medium text-white/80 shadow-lg backdrop-blur hover:bg-slate-800"
        aria-expanded={open}
        aria-label="Toggle API metrics panel"
      >
        {open ? "Fechar métricas" : "API metrics"}
      </button>
    </div>
  );
}
