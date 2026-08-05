"use client";

import Link from "next/link";
import type { NavL1Column, NavLinkItem } from "@/lib/nav/types";

type Props = {
  column: NavL1Column;
  onNavigate?: () => void;
};

export function MegaMenuColumn({ column, onNavigate }: Props) {
  return (
    <div className="min-w-[11rem]">
      <Link
        href={column.href}
        onClick={onNavigate}
        className="font-display text-sm font-semibold text-slate-900 hover:text-sky-700"
      >
        {column.label}
      </Link>
      <ul className="mt-3 space-y-1.5">
        {column.items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block text-sm hover:text-sky-700 ${
                item.popular ? "font-medium text-slate-800" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {column.seeAll ? (
        <Link
          href={column.seeAll.href}
          onClick={onNavigate}
          className="mt-3 inline-block text-xs font-medium text-sky-700 hover:underline"
        >
          {column.seeAll.label} →
        </Link>
      ) : null}
    </div>
  );
}

export function MegaMenuQuickLinks({
  links,
  onNavigate,
}: {
  links: NavLinkItem[];
  onNavigate?: () => void;
}) {
  if (!links.length) return null;
  return (
    <div className="min-w-[10rem] border-l border-slate-100 pl-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Atalhos
      </p>
      <ul className="mt-3 space-y-1.5">
        {links.map((l) => (
          <li key={`ql-${l.slug}`}>
            <Link
              href={l.href}
              onClick={onNavigate}
              className="block text-sm text-slate-600 hover:text-sky-700"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MegaMenuBrands({
  brands,
  onNavigate,
}: {
  brands: { label: string; href: string }[];
  onNavigate?: () => void;
}) {
  if (!brands.length) return null;
  return (
    <div className="min-w-[9rem] border-l border-slate-100 pl-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Marcas
      </p>
      <ul className="mt-3 space-y-1.5">
        {brands.map((b) => (
          <li key={b.label}>
            <Link
              href={b.href}
              onClick={onNavigate}
              className="block text-sm text-slate-600 hover:text-sky-700"
            >
              {b.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-400">Contexto · não são categorias</p>
    </div>
  );
}
