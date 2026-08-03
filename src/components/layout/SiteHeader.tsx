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
          <Link href="/#decisoes" className="hidden hover:text-slate-900 sm:inline">
            Decisões
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
      title: "Produto",
      links: [
        { href: "/#decisoes", label: "Decisões" },
        { href: "/catalog/", label: "Catálogo" },
        { href: "/#cupoes", label: "Cupões" },
      ],
    },
    {
      title: "Limiar",
      links: [
        { href: "/#comprar-agora", label: "Comprar agora" },
        { href: "/#esperar", label: "Esperar" },
      ],
    },
    {
      title: "Canal",
      links: [{ href: TELEGRAM_CHANNEL, label: "Telegram", external: true }],
    },
  ] as const;

  return (
    <footer className="border-t border-slate-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <LimiarLogo size={28} />
              <p className="font-display font-semibold text-slate-900">Limiar</p>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              {BRAND_TAGLINE}
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-12">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] text-slate-600 transition-colors duration-150 hover:text-slate-900"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[15px] text-slate-600 transition-colors duration-150 hover:text-slate-900"
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

        <p className="mt-14 border-t border-slate-100 pt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} Limiar · Preços observados · Sem previsões inventadas
        </p>
      </div>
    </footer>
  );
}
