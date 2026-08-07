"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
  /** Visual-only shortcut hint */
  shortcut?: string;
};

export function SearchBox({
  value,
  onChange,
  onFocus,
  placeholder = "Pesquisar…",
  className,
  shortcut = "⌘K",
}: Props) {
  return (
    <label
      className={cn(
        "relative flex w-full max-w-md items-center",
        className,
      )}
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--admin-faint)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] pl-9 pr-14 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-faint)] focus:border-[var(--admin-brand)]/40 focus:ring-1 focus:ring-[var(--admin-brand)]/20"
      />
      {shortcut ? (
        <kbd className="pointer-events-none absolute right-2 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-1.5 py-0.5 text-[10px] text-[var(--admin-faint)]">
          {shortcut}
        </kbd>
      ) : null}
    </label>
  );
}
