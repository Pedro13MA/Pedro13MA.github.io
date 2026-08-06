"use client";

import { useState } from "react";
import Link from "next/link";
import type { CategoryChild, CategoryDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  category: CategoryDetail;
  /** Árvore L2→L3 do pai L1 (opcional) para sidebar rica */
  siblings?: CategoryChild[];
};

function NodeList({
  nodes,
  activeSlug,
  depth = 0,
}: {
  nodes: CategoryChild[];
  activeSlug: string;
  depth?: number;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ul
      className={cn(
        "space-y-0.5",
        depth > 0 && "ml-3 border-l border-[var(--hm-line,#dde3ea)] pl-2",
      )}
    >
      {nodes.map((node) => {
        const active = node.slug === activeSlug;
        const hasKids = (node.children_count ?? 0) > 0 && depth < 1;
        const expanded = open[node.slug] ?? active;
        return (
          <li key={node.slug}>
            <div className="flex items-center gap-1">
              {hasKids ? (
                <button
                  type="button"
                  aria-label={expanded ? "Colapsar" : "Expandir"}
                  onClick={() =>
                    setOpen((s) => ({ ...s, [node.slug]: !expanded }))
                  }
                  className="h-6 w-6 shrink-0 text-xs text-[var(--hm-faint,#8b9aab)] hover:text-[var(--hm-ink,#0b1220)]"
                >
                  {expanded ? "▾" : "▸"}
                </button>
              ) : (
                <span className="inline-block w-6" />
              )}
              <Link
                href={`/categoria/${node.slug}/`}
                className={cn(
                  "flex-1 truncate rounded-lg px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--hm-brand-soft,#fff1e8)] font-medium text-[var(--hm-brand-deep,#e2550f)]"
                    : "text-[var(--hm-ink,#0b1220)] hover:bg-[var(--hm-bg-soft,#eef2f6)]",
                )}
              >
                {node.display_name}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CategorySidebar({ category, siblings }: Props) {
  const nodes =
    category.children?.length > 0
      ? category.children
      : siblings?.length
        ? siblings
        : [];

  return (
    <aside
      className={cn(
        "catalog-filters lymiar-sidebar space-y-4",
        "lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:self-start",
        "lg:overflow-y-auto lg:overscroll-contain lg:pr-2",
      )}
    >
      <div>
        <p className="catalog-kicker">Navegação</p>
        <Link
          href="/categorias/"
          className="mt-2 block text-sm font-medium text-[var(--hm-brand-deep,#e2550f)] hover:underline"
        >
          Todas as categorias
        </Link>
      </div>

      {nodes.length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hm-faint,#8b9aab)]">
            {category.level < 3 ? "Subcategorias" : "Relacionadas"}
          </p>
          <NodeList nodes={nodes} activeSlug={category.slug} />
        </div>
      ) : (
        <p className="text-xs text-[var(--hm-faint,#8b9aab)]">Sem subcategorias.</p>
      )}
    </aside>
  );
}
