"use client";

import { cn } from "@/lib/utils";

type Tab = { id: string; label: string };

type Props = {
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-1",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              active
                ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm"
                : "text-[var(--admin-muted)] hover:text-[var(--admin-text)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
