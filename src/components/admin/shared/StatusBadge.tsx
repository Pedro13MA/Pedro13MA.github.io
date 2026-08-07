"use client";

import { cn } from "@/lib/utils";
import type { HealthTone } from "@/types/admin";

const TONE: Record<HealthTone, string> = {
  ok: "bg-[var(--admin-ok-soft)] text-[var(--admin-ok)] border-[var(--admin-ok)]/20",
  warn: "bg-[var(--admin-warn-soft)] text-[var(--admin-warn)] border-[var(--admin-warn)]/20",
  critical:
    "bg-[var(--admin-critical-soft)] text-[var(--admin-critical)] border-[var(--admin-critical)]/20",
  neutral: "bg-[var(--admin-surface-2)] text-[var(--admin-muted)] border-[var(--admin-border)]",
};

type Props = {
  tone?: HealthTone;
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ tone = "neutral", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
