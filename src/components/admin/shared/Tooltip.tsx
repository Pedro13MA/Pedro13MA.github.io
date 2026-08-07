"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Tooltip({ content, children, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-1 text-[11px] text-[var(--admin-text)] shadow-lg">
          {content}
        </span>
      ) : null}
    </span>
  );
}
