"use client";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  rows?: number;
};

export function LoadingState({ className, rows = 3 }: Props) {
  return (
    <div className={cn("space-y-3", className)} aria-busy aria-label="A carregar">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
        />
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--admin-track)]",
        className,
      )}
    />
  );
}
