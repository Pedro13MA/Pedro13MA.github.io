"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  getCategory,
  type CategoryChild,
  type CategorySummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  activeSlug: string;
  onSelect: (slug: string) => void;
  className?: string;
};

type TreeNode = {
  slug: string;
  display_name: string;
  level: number;
  children_count: number;
  children?: TreeNode[];
};

function toNode(c: CategorySummary | CategoryChild): TreeNode {
  return {
    slug: c.slug,
    display_name: c.display_name,
    level: c.level,
    children_count: c.children_count ?? 0,
  };
}

/**
 * Árvore Taxonomy v2 — L1 via /categorias; filhos lazy via /categorias/{slug}.
 * Sem hardcode de categorias.
 */
export function CatalogCategoryTree({
  activeSlug,
  onSelect,
  className,
}: Props) {
  const [roots, setRoots] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCategories()
      .then((res) => {
        if (cancelled) return;
        setRoots(res.categories.map(toNode));
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha a carregar categorias");
          setRoots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-expand path até ao slug activo
  useEffect(() => {
    if (!activeSlug || !roots.length) return;
    let cancelled = false;

    (async () => {
      try {
        const detail = await getCategory(activeSlug);
        if (cancelled) return;
        const path = (
          detail.taxonomy_path?.length
            ? detail.taxonomy_path
            : detail.breadcrumbs?.map((b) => b.slug).filter(Boolean) || []
        ).filter(Boolean);

        const nextOpen: Record<string, boolean> = {};
        for (const slug of path) {
          if (slug !== activeSlug) nextOpen[slug] = true;
        }
        // Expandir também o pai directo se for leaf
        for (const slug of path.slice(0, -1)) nextOpen[slug] = true;
        setExpanded((prev) => ({ ...prev, ...nextOpen }));

        // Prefetch filhos dos nós do path (exceto leaf)
        for (const slug of path) {
          if (slug === activeSlug && path[path.length - 1] === activeSlug) {
            // leaf: ainda assim carregar pai já coberto; skip leaf children fetch unless needed
          }
          const res = await getCategory(slug);
          if (cancelled) return;
          const kids = (res.children || []).map(toNode);
          if (kids.length) {
            setRoots((prev) => attachChildren(prev, slug, kids));
          }
        }
      } catch {
        /* ignore — árvore L1 ainda útil */
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao slug activo / L1 ready
  }, [activeSlug, roots.length > 0]);

  const ensureChildren = useCallback(async (slug: string) => {
    const res = await getCategory(slug);
    const kids = (res.children || []).map(toNode);
    setRoots((prev) => attachChildren(prev, slug, kids));
    return kids;
  }, []);

  const toggleExpand = useCallback(
    async (node: TreeNode) => {
      const willOpen = !expanded[node.slug];
      setExpanded((s) => ({ ...s, [node.slug]: willOpen }));
      if (willOpen && node.children_count > 0 && !node.children?.length) {
        try {
          await ensureChildren(node.slug);
        } catch {
          /* ignore */
        }
      }
    },
    [ensureChildren, expanded],
  );

  if (loading) {
    return (
      <p className="text-xs text-slate-400" role="status">
        A carregar categorias…
      </p>
    );
  }

  if (error) {
    return <p className="text-xs text-amber-700">{error}</p>;
  }

  if (!roots.length) {
    return <p className="text-xs text-slate-400">Sem categorias activas.</p>;
  }

  return (
    <ul className={cn("space-y-0.5", className)} data-testid="catalog-category-tree">
      {roots.map((node) => (
        <TreeItem
          key={node.slug}
          node={node}
          depth={0}
          activeSlug={activeSlug}
          expanded={expanded}
          onToggle={toggleExpand}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function TreeItem({
  node,
  depth,
  activeSlug,
  expanded,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  activeSlug: string;
  expanded: Record<string, boolean>;
  onToggle: (node: TreeNode) => void;
  onSelect: (slug: string) => void;
}) {
  const active = node.slug === activeSlug;
  const hasKids = node.children_count > 0 || (node.children?.length ?? 0) > 0;
  const isOpen = Boolean(expanded[node.slug]);

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-0.5",
          depth > 0 && "ml-2 border-l border-slate-100 pl-1.5",
        )}
      >
        {hasKids ? (
          <button
            type="button"
            aria-label={isOpen ? "Colapsar" : "Expandir"}
            onClick={() => onToggle(node)}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-xs text-slate-400 hover:text-slate-700"
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="inline-block w-7" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.slug)}
          className={cn(
            "min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
            active
              ? "bg-sky-50 font-medium text-sky-900"
              : "text-slate-700 hover:bg-slate-50",
          )}
        >
          {node.display_name}
        </button>
      </div>
      {hasKids && isOpen && node.children?.length ? (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeItem
              key={child.slug}
              node={child}
              depth={depth + 1}
              activeSlug={activeSlug}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function attachChildren(
  nodes: TreeNode[],
  parentSlug: string,
  children: TreeNode[],
): TreeNode[] {
  return nodes.map((n) => {
    if (n.slug === parentSlug) {
      return { ...n, children, children_count: children.length || n.children_count };
    }
    if (n.children?.length) {
      return { ...n, children: attachChildren(n.children, parentSlug, children) };
    }
    return n;
  });
}
