"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#inteligencia", label: "Inteligência" },
  { href: "#categorias", label: "Categorias" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass-nav" : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Button href={TELEGRAM_CHANNEL} external className="text-sm px-5 py-2.5">
              Entrar no Telegram
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <button
            type="button"
            className="md:hidden p-2 text-zinc-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden bg-[#0A0A0B]/98 backdrop-blur-xl flex flex-col pt-20 px-6">
          <div className="flex flex-col gap-6 text-lg">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Button
              href={TELEGRAM_CHANNEL}
              external
              className="w-full mt-4"
              onClick={() => setOpen(false)}
            >
              Entrar no Telegram
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
