"use client";

import Link from "next/link";
import { TELEGRAM_CHANNEL, BRAND_TAGLINE } from "@/lib/constants";
import { CATEGORY_MENU_L1 } from "@/lib/category-slugs";
import { LymiarLogo } from "@/components/ui/LymiarLogo";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { isP32NavigationEnabled } from "@/lib/nav/flags";
import { SiteHeaderP32 } from "@/components/nav/SiteHeaderP32";
import { BottomNavigation } from "@/components/nav/BottomNavigation";

function SiteHeaderLegacy() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-slate-900"
          aria-label="Lymiar — início"
        >
          <LymiarLogo size={36} alt="Lymiar" priority />
          <span className="hidden text-xs font-normal text-sky-700 sm:inline">
            Quando comprar
          </span>
        </Link>
        <nav
          className="flex min-w-0 items-center gap-3 text-sm text-slate-500 sm:gap-4"
          aria-label="Principal"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto sm:gap-4">
            <Link href="/categorias/" className="shrink-0 hover:text-slate-900">
              Categorias
            </Link>
            <Link href="/mercado/" className="shrink-0 hover:text-slate-900">
              Mercado
            </Link>
            <Link href="/catalogo/" className="shrink-0 hover:text-slate-900">
              Catálogo
            </Link>
            {CATEGORY_MENU_L1.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}/`}
                className="hidden shrink-0 hover:text-slate-900 md:inline"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/catalog/"
              className="hidden shrink-0 hover:text-slate-900 lg:inline"
            >
              Explorar
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationBell />
            <UserMenu />
            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:inline-flex"
            >
              Telegram
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteHeader() {
  if (!isP32NavigationEnabled()) {
    return <SiteHeaderLegacy />;
  }
  return (
    <>
      <SiteHeaderP32 />
      <BottomNavigation />
    </>
  );
}

export function SiteFooter() {
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
      title: "Minha Área",
      links: [
        { href: "/entrar/", label: "Entrar" },
        { href: "/perfil/", label: "Perfil" },
        { href: "/notificacoes/", label: "Notificações" },
        { href: "/minha-area/", label: "Resumo" },
        { href: "/timeline/", label: "Timeline" },
        { href: "/favoritos/", label: "Favoritos" },
        { href: "/listas/", label: "Listas" },
        { href: "/alertas/", label: "Alertas" },
        { href: "/projetos/", label: "Projetos" },
        { href: "/carrinho/", label: "Carrinho" },
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

  const padBottom = isP32NavigationEnabled();

  return (
    <footer
      className={`border-t border-slate-200/60 bg-white ${
        padBottom ? "pb-16 md:pb-0" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-xs shrink-0">
            <LymiarLogo size={44} alt="Lymiar" />
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              {BRAND_TAGLINE}
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-600 hover:text-slate-900"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 hover:text-slate-900"
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
        <p className="mt-12 text-xs text-slate-400">
          © {new Date().getFullYear()} Lymiar · Preços observados · Sem previsões
          inventadas
        </p>
      </div>
    </footer>
  );
}
