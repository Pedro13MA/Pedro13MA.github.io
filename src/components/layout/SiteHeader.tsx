import Link from "next/link";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-zinc-50">
          Limiar
          <span className="ml-2 text-xs font-normal text-teal-400/90">Price Intelligence</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-400">
          <a href="#oportunidades" className="hidden hover:text-zinc-100 sm:inline">
            Oportunidades
          </a>
          <a href="#cupoes" className="hidden hover:text-zinc-100 sm:inline">
            Cupões
          </a>
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-200 hover:border-teal-500/40 hover:text-teal-300"
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
    <footer className="mt-20 border-t border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display text-zinc-300">Limiar</span> — decisão de compra com
          dados reais.
        </p>
        <p>Mocks alinhados ao motor Python/SQLite · V10.4</p>
      </div>
    </footer>
  );
}
