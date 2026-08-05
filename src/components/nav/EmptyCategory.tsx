"use client";

import Link from "next/link";
import type { NavLinkItem } from "@/lib/nav/types";

type Props = {
  title: string;
  description?: string;
  parentHref?: string;
  parentLabel?: string;
  related?: NavLinkItem[];
};

export function EmptyCategory({
  title,
  description,
  parentHref,
  parentLabel,
  related = [],
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
      <h2 className="font-display text-xl font-semibold text-slate-900">
        Ainda não há produtos em {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description ||
          "Estamos a cobrir esta categoria. Experimenta categorias próximas ou pesquisa."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {parentHref ? (
          <Link
            href={parentHref}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            {parentLabel || "Ver categoria pai"}
          </Link>
        ) : null}
        <Link
          href="/search/"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Pesquisar
        </Link>
        <Link
          href="/categorias/"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Todas as categorias
        </Link>
      </div>
      {related.length ? (
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {related.map((r) => (
            <li key={r.slug}>
              <Link
                href={r.href}
                className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200 hover:bg-white"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
