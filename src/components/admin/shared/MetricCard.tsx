"use client";

import { cn } from "@/lib/utils";
import type { HealthTone, MetricTrend } from "@/types/admin";
import { HealthIndicator } from "./HealthIndicator";

type Props = {
  label: string;
  value: string;
  hint?: string;
  trend?: MetricTrend;
  tone?: HealthTone;
  stale?: boolean;
  unavailable?: boolean;
  className?: string;
};

export function MetricCard({
  label,
  value,
  hint,
  trend,
  tone,
  stale,
  unavailable,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm transition-colors hover:border-[var(--admin-border-strong)]",
        (stale || unavailable) && "opacity-80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--admin-muted)]">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          {stale ? (
            <span className="rounded bg-[var(--admin-warn-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--admin-warn)]">
              stale
            </span>
          ) : null}
          {tone ? <HealthIndicator tone={tone} /> : null}
        </div>
      </div>
      <p
        className={cn(
          "mt-3 font-display text-2xl font-semibold tracking-tight text-[var(--admin-text)]",
          (stale || unavailable) && "text-[var(--admin-muted)]",
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--admin-faint)]">
        <span>{hint}</span>
        {trend && !stale && !unavailable ? (
          <span
            className={cn(
              trend.direction === "up" && "text-[var(--admin-ok)]",
              trend.direction === "down" && "text-[var(--admin-critical)]",
              trend.direction === "flat" && "text-[var(--admin-muted)]",
            )}
          >
            {trend.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
