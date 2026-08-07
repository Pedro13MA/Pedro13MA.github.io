"use client";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: Props) {
  return (
    <header className={cn("mb-8", className)}>
      {breadcrumb?.length ? (
        <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--admin-faint)]">
          {breadcrumb.join(" / ")}
        </p>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-[var(--admin-muted)]">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
    </header>
  );
}
