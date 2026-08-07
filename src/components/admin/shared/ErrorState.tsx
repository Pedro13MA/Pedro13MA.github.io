"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  className?: string;
};

export function ErrorState({
  title = "Algo correu mal",
  description = "Não foi possível carregar esta secção. Tenta novamente mais tarde.",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-[var(--admin-critical)]/25 bg-[var(--admin-critical-soft)] px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mb-3 h-5 w-5 text-[var(--admin-critical)]" />
      <h3 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-[var(--admin-muted)]">{description}</p>
    </div>
  );
}
