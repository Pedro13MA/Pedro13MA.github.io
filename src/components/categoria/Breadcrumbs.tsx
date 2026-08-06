"use client";

import Link from "next/link";
import type { CategoryBreadcrumb } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  items: CategoryBreadcrumb[];
  className?: string;
};

export function Breadcrumbs({ items, className }: Props) {
  if (!items?.length) return null;

  const crumbs = items.filter((i) => i.display_name);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm text-[var(--hm-muted,#5b6b7c)]", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((item, i) => {
          const last = i === crumbs.length - 1;
          const href =
            item.path ||
            (!item.slug ? "/" : `/categoria/${item.slug}/`);
          const isHome =
            href === "/" || item.display_name === "Início";
          const linkHref = isHome && !item.path ? "/" : href;
          return (
            <li key={`${item.slug || "home"}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? (
                <span className="text-[var(--hm-line,#dde3ea)]" aria-hidden>
                  /
                </span>
              ) : null}
              {last ? (
                <span className="font-medium text-[var(--hm-ink,#0b1220)]">
                  {item.display_name}
                </span>
              ) : (
                <Link
                  href={linkHref}
                  className="hover:text-[var(--hm-brand-deep,#e2550f)]"
                >
                  {item.display_name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
