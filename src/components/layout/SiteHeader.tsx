import Link from "next/link";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-slate-900"
        >
          Limiar
          <span className="ml-2 text-xs font-normal text-sky-700">Price Intelligence</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-500">
          <Link href="/#comprar-agora" className="hidden hover:text-slate-900 sm:inline">
            Comprar Agora
          </Link>
          <Link href="/#esperar" className="hidden hover:text-slate-900 lg:inline">
            Esperar
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
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display font-semibold text-slate-900">Limiar</span> — a plataforma
          que diz quando vale realmente a pena comprar.
        </p>
        <p>Mocks alinhados ao motor Python/SQLite · V10.4</p>
      </div>
    </footer>
  );
}
