"use client";

import Link from "next/link";
import { BreadcrumbNav } from "@/components/nav/BreadcrumbNav";
import type { BreadcrumbItem, NavLinkItem } from "@/lib/nav/types";

export function CategoryHero({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <header className="border-b border-[var(--hm-line,#dde3ea)] bg-[var(--hm-bg-elevated,#fff)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:max-w-7xl">
        <BreadcrumbNav items={breadcrumbs} />
        <p className="catalog-kicker mt-5">Explorar</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--hm-ink,#0b1220)] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-base text-[var(--hm-muted,#5b6b7c)]">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function CategoryCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="catalog-card block p-5 transition hover:border-[var(--hm-brand,#ff6a1a)]/40"
    >
      <p className="font-display text-lg font-semibold text-slate-900">{title}</p>
      {subtitle ? (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      ) : null}
    </Link>
  );
}

export function CategoryGrid({
  items,
}: {
  items: { href: string; title: string; subtitle?: string }[];
}) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.href}>
          <CategoryCard {...item} />
        </li>
      ))}
    </ul>
  );
}

export function CategoryRelated({ items }: { items: NavLinkItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display text-lg font-semibold text-slate-900">
        Categorias relacionadas
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i.slug}>
            <Link
              href={i.href}
              className="rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-white"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CategoryLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
