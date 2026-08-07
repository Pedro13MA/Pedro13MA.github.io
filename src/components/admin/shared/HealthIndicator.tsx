"use client";

import { cn } from "@/lib/utils";
import type { HealthTone } from "@/types/admin";

const DOT: Record<HealthTone, string> = {
  ok: "bg-[var(--admin-ok)]",
  warn: "bg-[var(--admin-warn)]",
  critical: "bg-[var(--admin-critical)]",
  neutral: "bg-[var(--admin-faint)]",
};

type Props = {
  tone?: HealthTone;
  label?: string;
  className?: string;
  size?: "sm" | "md";
};

export function HealthIndicator({
  tone = "neutral",
  label,
  className,
  size = "sm",
}: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "rounded-full",
          size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
          DOT[tone],
        )}
        aria-hidden
      />
      {label ? (
        <span className="text-xs text-[var(--admin-muted)]">{label}</span>
      ) : null}
    </span>
  );
}
