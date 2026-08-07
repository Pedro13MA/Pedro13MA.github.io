"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  card: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function HoverCard({ card, children, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 shadow-2xl">
          {card}
        </span>
      ) : null}
    </span>
  );
}
