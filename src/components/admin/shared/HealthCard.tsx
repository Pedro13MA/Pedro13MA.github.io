"use client";

import { cn } from "@/lib/utils";
import type { HealthTone } from "@/types/admin";
import { HealthIndicator } from "./HealthIndicator";

type Props = {
  label: string;
  value: string;
  pct?: number;
  tone?: HealthTone;
  stale?: boolean;
  unavailable?: boolean;
  className?: string;
};

export function HealthCard({
  label,
  value,
  pct,
  tone = "neutral",
  stale,
  unavailable,
  className,
}: Props) {
  const width = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm",
        (stale || unavailable) && "opacity-80",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--admin-muted)]">{label}</p>
        <div className="flex items-center gap-1.5">
          {stale ? (
            <span className="rounded bg-[var(--admin-warn-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--admin-warn)]">
              stale
            </span>
          ) : null}
          <HealthIndicator tone={tone} />
        </div>
      </div>
      <p
        className={cn(
          "mt-2 font-display text-lg font-semibold text-[var(--admin-text)]",
          (stale || unavailable) && "text-[var(--admin-muted)]",
        )}
      >
        {value}
      </p>
      {pct != null && !stale && !unavailable ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--admin-track)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              tone === "ok" && "bg-[var(--admin-ok)]",
              tone === "warn" && "bg-[var(--admin-warn)]",
              tone === "critical" && "bg-[var(--admin-critical)]",
              tone === "neutral" && "bg-[var(--admin-muted)]",
            )}
            style={{ width: `${width}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
