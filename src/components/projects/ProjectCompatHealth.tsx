"use client";

import { useMemo } from "react";
import { evaluateProjectCompatibility } from "@/lib/compatibility";
import type { CompatStatus, SlotCompatResult } from "@/lib/compatibility";
import type { Project } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const STATUS_UI: Record<
  CompatStatus,
  { label: string; symbol: string; className: string }
> = {
  compatible: {
    label: "Compatível",
    symbol: "✔",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  warning: {
    label: "Aviso",
    symbol: "⚠",
    className: "text-amber-800 bg-amber-50 border-amber-200",
  },
  incompatible: {
    label: "Incompatível",
    symbol: "✖",
    className: "text-rose-700 bg-rose-50 border-rose-200",
  },
  unknown: {
    label: "Desconhecido",
    symbol: "?",
    className: "text-slate-600 bg-slate-50 border-slate-200",
  },
  empty: {
    label: "Vazio",
    symbol: "·",
    className: "text-slate-400 bg-white border-slate-100",
  },
};

type Props = {
  project: Project;
  sticky?: boolean;
};

/**
 * Saúde do Projeto — Compatibility Engine v1 (só aconselha).
 */
export function ProjectCompatHealth({ project, sticky }: Props) {
  const result = useMemo(
    () => evaluateProjectCompatibility(project),
    [project],
  );

  const overall = STATUS_UI[result.status];
  const filled =
    result.counts.compatible +
    result.counts.warning +
    result.counts.incompatible +
    result.counts.unknown;
  const totalSlots = filled + result.counts.empty;

  const issues = result.slots.flatMap((s) =>
    [...s.errors.map((m) => ({ slot: s.label, m, bad: true })), ...s.warnings.slice(0, 1).map((m) => ({ slot: s.label, m, bad: false }))],
  );

  return (
    <section
      aria-label="Saúde do projeto"
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        sticky && "sticky top-14 z-30",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Saúde do Projeto
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {result.providerId
              ? `Motor ${result.providerId} — nunca bloqueia; dados em falta → Desconhecido.`
              : "Sem regras para este template (extensível)."}
          </p>
        </div>
        <div
          className={cn(
            "rounded-xl border px-4 py-2 text-center",
            overall.className,
          )}
          role="status"
        >
          <p className="font-display text-3xl font-bold tabular-nums">
            {result.overallScore}%
          </p>
          <p className="text-xs font-semibold">{overall.label}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Slots completos" value={`${filled} / ${totalSlots}`} />
        <MiniStat label="Avisos" value={String(result.counts.warning)} />
        <MiniStat
          label="Erros"
          value={String(result.counts.incompatible)}
        />
        <MiniStat label="Desconhecido" value={String(result.counts.unknown)} />
      </dl>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {result.slots
          .filter((s) => s.status !== "empty")
          .map((s) => (
            <SlotRow key={s.slotId} slot={s} />
          ))}
      </ul>

      {issues.length ? (
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notas
          </p>
          {issues.slice(0, 8).map((i, idx) => (
            <p
              key={`${i.slot}-${idx}`}
              className={cn(
                "text-sm",
                i.bad ? "text-rose-700" : "text-slate-600",
              )}
            >
              <span className="font-medium">{i.slot}:</span> {i.m}
            </p>
          ))}
        </div>
      ) : null}

      {project.compatibilityHistory && project.compatibilityHistory.length > 1 ? (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Evolução da compatibilidade
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
            {project.compatibilityHistory.slice(-5).map((h) => (
              <li key={h.date} className="flex justify-between gap-2">
                <span>
                  {new Date(h.date).toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span>
                  {h.score}% · {h.warnings} avisos · {h.errors} erros
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function SlotRow({ slot }: { slot: SlotCompatResult }) {
  const ui = STATUS_UI[slot.status];
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        ui.className,
      )}
    >
      <span className="font-bold" aria-hidden>
        {ui.symbol}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{slot.label}</span>
        <span className="text-xs opacity-80"> · {ui.label}</span>
        {slot.suggestions[0] ? (
          <span className="mt-0.5 block text-xs opacity-90">
            {slot.suggestions[0]}
          </span>
        ) : null}
      </span>
      {slot.score != null ? (
        <span className="tabular-nums text-xs font-semibold">{slot.score}</span>
      ) : null}
    </li>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="font-display text-lg font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

/** Badge compacto para sticky mobile. */
export function CompatScoreBadge({ project }: { project: Project }) {
  const result = useMemo(
    () => evaluateProjectCompatibility(project),
    [project],
  );
  const ui = STATUS_UI[result.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
        ui.className,
      )}
    >
      {ui.symbol} {result.overallScore}%
    </span>
  );
}
