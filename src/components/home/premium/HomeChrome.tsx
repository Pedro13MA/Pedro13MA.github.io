"use client";

import Link from "next/link";
import { TELEGRAM_CHANNEL, BRAND_TAGLINE } from "@/lib/constants";
import { CATEGORY_MENU_L1 } from "@/lib/category-slugs";
import { LymiarLogo } from "@/components/ui/LymiarLogo";
import { HomeAccountMenu } from "@/components/home/premium/HomeAccountMenu";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:max-w-7xl">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Lymiar — início">
          <LymiarLogo size={40} alt="Lymiar" priority className="rounded-xl ring-1 ring-slate-200" />
          <span className="hidden font-display text-base font-semibold text-slate-900 sm:inline">
            Lymiar
          </span>
        </Link>
        <nav
          className="flex min-w-0 items-center gap-3 text-sm text-slate-500 sm:gap-5"
          aria-label="Principal"
        >
          <div className="hidden items-center gap-5 md:flex">
            <Link href="/categorias/" className="hover:text-blue-600">
              Categorias
            </Link>
            <Link href="/mercado/" className="hover:text-blue-600">
              Mercado
            </Link>
            <Link href="/catalogo/" className="hover:text-blue-600">
              Catálogo
            </Link>
            <Link href="/search/" className="hover:text-blue-600">
              Pesquisa
            </Link>
          </div>
          <HomeAccountMenu />
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-slate-500 hover:text-blue-600 lg:inline"
          >
            Telegram
          </a>
        </nav>
      </div>
    </header>
  );
}

export function HomeFooter() {
  const columns = [
    {
      title: "Produto",
      links: [
        { href: "/categorias/", label: "Categorias" },
        { href: "/mercado/", label: "Mercado" },
        { href: "/catalog/", label: "Explorar" },
        { href: "/#cupoes", label: "Cupões" },
      ],
    },
    {
      title: "Área",
      links: [
        { href: "/entrar/", label: "Entrar" },
        { href: "/minha-area/", label: "Resumo" },
        { href: "/favoritos/", label: "Favoritos" },
        { href: "/comparar/", label: "Comparador" },
      ],
    },
    {
      title: "Categorias",
      links: CATEGORY_MENU_L1.slice(0, 4).map((c) => ({
        href: `/categoria/${c.slug}/`,
        label: c.label,
      })),
    },
    {
      title: "Canal",
      links: [{ href: TELEGRAM_CHANNEL, label: "Telegram", external: true }],
    },
  ] as const;

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <LymiarLogo size={48} alt="Lymiar" className="rounded-xl ring-1 ring-slate-200" />
            <p className="mt-5 text-[15px] leading-relaxed text-slate-500">
              {BRAND_TAGLINE}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              O Bloomberg dos preços de tecnologia.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] text-slate-600 hover:text-blue-600"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[15px] text-slate-600 hover:text-blue-600"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-14 border-t border-slate-200 pt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} Lymiar · Preços observados · Sem previsões inventadas
        </p>
      </div>
    </footer>
  );
}
