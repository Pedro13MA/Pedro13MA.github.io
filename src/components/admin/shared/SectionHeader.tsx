"use client";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ title, description, action, className }: Props) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="font-display text-sm font-semibold tracking-tight text-[var(--admin-text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-[var(--admin-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
