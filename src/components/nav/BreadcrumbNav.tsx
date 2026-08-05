"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/nav/types";

type Props = {
  items: BreadcrumbItem[];
  className?: string;
  separator?: "slash" | "chevron";
};

export function BreadcrumbNav({
  items,
  className,
  separator = "chevron",
}: Props) {
  if (!items?.length) return null;
  const crumbs = items.filter((i) => i.label);
  const sep = separator === "slash" ? "/" : "›";

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-slate-500", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((item, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? (
                <span className="text-slate-300" aria-hidden>
                  {sep}
                </span>
              ) : null}
              {last || !item.href ? (
                <span className="font-medium text-slate-800" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-sky-700">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
