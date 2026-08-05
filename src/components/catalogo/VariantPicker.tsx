"use client";

/**
 * FASE 7.21 — selector de variantes canónicas.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  CanonicalGroupDetail,
  CanonicalVariantCard,
} from "@/lib/api";
import { cn, formatEUR } from "@/lib/utils";

type Props = {
  group: CanonicalGroupDetail;
  onResolved?: (variant: CanonicalVariantCard) => void;
  /** Se true, navega para a ficha ao resolver. */
  navigateOnResolve?: boolean;
};

export function VariantPicker({
  group,
  onResolved,
  navigateOnResolve = true,
}: Props) {
  const attrs = group.variableAttributes || [];
  const [selected, setSelected] = useState<Record<string, string>>({});

  const match = useMemo(() => {
    const keys = Object.keys(selected);
    if (!keys.length) return null;
    const hits = (group.variants || []).filter((v) =>
      keys.every((k) => (v.selection || {})[k] === selected[k]),
    );
    if (hits.length === 1) return hits[0];
    // Se só falta um atributo e há um único candidato parcial
    if (hits.length === 0) return null;
    return hits.length === 1 ? hits[0] : null;
  }, [group.variants, selected]);

  const candidates = useMemo(() => {
    const keys = Object.keys(selected);
    if (!keys.length) return group.variants || [];
    return (group.variants || []).filter((v) =>
      keys.every((k) => (v.selection || {})[k] === selected[k]),
    );
  }, [group.variants, selected]);

  const pick = (key: string, value: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const resolve = (v: CanonicalVariantCard) => {
    onResolved?.(v);
    if (navigateOnResolve && typeof window !== "undefined") {
      window.location.href = `/p/?id=${encodeURIComponent(v.slug)}`;
    }
  };

  return (
    <div className="space-y-5">
      {attrs.map((attr) => (
        <div key={attr.key}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {attr.label}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {attr.options.map((opt) => {
              const active = selected[attr.key] === opt;
              const stillPossible = (group.variants || []).some((v) => {
                const sel = { ...selected, [attr.key]: opt };
                return Object.entries(sel).every(
                  ([k, val]) => (v.selection || {})[k] === val,
                );
              });
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={!stillPossible && !active}
                  onClick={() => pick(attr.key, opt)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-sky-400 bg-sky-50 text-sky-900"
                      : stillPossible
                        ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {match ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">
            Variante encontrada
          </p>
          <p className="mt-1 text-sm text-slate-600">{match.name}</p>
          {match.currentPrice != null ? (
            <p className="mt-1 font-display text-lg font-bold">
              {formatEUR(match.currentPrice)}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => resolve(match)}
            className="mt-3 inline-flex h-10 items-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800"
          >
            Ver ficha
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {Object.keys(selected).length
            ? `${candidates.length} variante(s) compatível(is) — continua a escolher.`
            : "Escolhe as opções para encontrar a variante exacta."}
        </p>
      )}

      {!attrs.length ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {(group.variants || []).map((v) => (
            <li key={v.slug}>
              <Link
                href={`/p/?id=${encodeURIComponent(v.slug)}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-900">
                  {v.name}
                </span>
                {v.currentPrice != null ? (
                  <span className="text-sm font-bold tabular-nums">
                    {formatEUR(v.currentPrice)}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
