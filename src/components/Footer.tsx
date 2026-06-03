import Link from "next/link";
import { Send } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import { VERSION } from "@/lib/constants";

const columns = [
  {
    title: "Produto",
    links: [
      { href: "#como-funciona", label: "Como funciona" },
      { href: "#inteligencia", label: "Inteligência" },
      { href: "#categorias", label: "Categorias" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: TELEGRAM_CHANNEL, label: "Canal Telegram", external: true },
      { href: "#faq", label: "FAQ" },
      { href: TELEGRAM_CHANNEL, label: "Alertas", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacidade" },
      { href: "#", label: "Termos" },
      { href: "#", label: "Afiliados" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16 pb-28 md:pb-16">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              Feito com inteligência, não com spam.
            </p>
            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors min-h-[44px]"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium tracking-widest uppercase text-zinc-500">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
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
        <p className="mt-12 pt-8 border-t border-white/[0.06] text-sm text-zinc-600 text-center md:text-left">
          © 2026 Spotter Intelligence Hub · Pedro Martins · Lisboa, Portugal · {VERSION}
        </p>
      </div>
    </footer>
  );
}
