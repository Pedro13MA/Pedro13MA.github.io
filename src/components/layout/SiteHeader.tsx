import Link from "next/link";
import { TELEGRAM_CHANNEL, BRAND_TAGLINE } from "@/lib/constants";
import { LimiarLogo } from "@/components/ui/LimiarLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-slate-900"
        >
          <LimiarLogo size={28} />
          <span>
            Limiar
            <span className="ml-2 hidden text-xs font-normal text-sky-700 sm:inline">
              Quando comprar
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-500">
          <Link href="/catalog/" className="hover:text-slate-900">
            Catálogo
          </Link>
          <Link href="/#comprar-agora" className="hidden hover:text-slate-900 sm:inline">
            Oportunidades
          </Link>
          <Link href="/#como-funciona" className="hidden hover:text-slate-900 lg:inline">
            Como funciona
          </Link>
          <Link href="/#cupoes" className="hidden hover:text-slate-900 sm:inline">
            Cupões
          </Link>
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >
            Telegram
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const columns = [
    {
      title: "Produtos",
      links: [
        { href: "/catalog/?section=deals", label: "Melhores oportunidades" },
        { href: "/#comprar-agora", label: "Comprar agora" },
        { href: "/#esperar", label: "Vale a pena esperar" },
        { href: "/catalog/", label: "Catálogo" },
      ],
    },
    {
      title: "Lojas",
      links: [
        { href: "/#lojas", label: "Lojas monitorizadas" },
        { href: "/#cupoes", label: "Hub de cupões" },
        { href: "/cupoes/worten/", label: "Cupões Worten" },
      ],
    },
    {
      title: "Ferramentas",
      links: [
        { href: "/#como-funciona", label: "Como funciona" },
        { href: "/#alertas", label: "Alertas" },
        { href: TELEGRAM_CHANNEL, label: "Telegram", external: true },
      ],
    },
    {
      title: "Empresa",
      links: [
        { href: "/#porque-limiar", label: "Porque o Limiar" },
        { href: "/", label: "Início" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/", label: "Privacidade" },
        { href: "/", label: "Termos" },
      ],
    },
  ] as const;

  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <LimiarLogo size={28} />
              <p className="font-display font-semibold text-slate-900">Limiar</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{BRAND_TAGLINE}</p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-600 transition hover:text-slate-900"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 transition hover:text-slate-900"
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

        <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} Limiar · Preços observados · Sem previsões inventadas
        </p>
      </div>
    </footer>
  );
}
