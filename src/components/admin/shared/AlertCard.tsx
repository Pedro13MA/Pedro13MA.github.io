"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AlertItem } from "@/types/admin";
import { StatusBadge } from "./StatusBadge";

type Props = {
  alert: AlertItem;
  className?: string;
};

export function AlertCard({ alert, className }: Props) {
  const body = (
    <div
      className={cn(
        "rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm transition-colors",
        alert.href && "hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-surface-2)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={alert.tone === "ok" ? "ok" : alert.tone}>
              {alert.tone === "critical" ? "Critical" : alert.tone === "warn" ? "Warning" : "Info"}
            </StatusBadge>
            {alert.timeLabel ? (
              <span className="text-[11px] text-[var(--admin-faint)]">{alert.timeLabel}</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-medium text-[var(--admin-text)]">{alert.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--admin-muted)]">
            {alert.description}
          </p>
        </div>
      </div>
    </div>
  );

  if (alert.href) {
    return <Link href={alert.href}>{body}</Link>;
  }
  return body;
}
