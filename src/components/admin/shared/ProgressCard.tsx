"use client";

import { cn } from "@/lib/utils";
import type { HealthTone } from "@/types/admin";

type Props = {
  label: string;
  valueLabel: string;
  pct: number;
  tone?: HealthTone;
  className?: string;
};

export function ProgressCard({
  label,
  valueLabel,
  pct,
  tone = "ok",
  className,
}: Props) {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--admin-muted)]">{label}</span>
        <span className="font-medium text-[var(--admin-text)]">{valueLabel}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--admin-track)]">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "ok" && "bg-[var(--admin-ok)]",
            tone === "warn" && "bg-[var(--admin-warn)]",
            tone === "critical" && "bg-[var(--admin-critical)]",
            tone === "neutral" && "bg-[var(--admin-muted)]",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
