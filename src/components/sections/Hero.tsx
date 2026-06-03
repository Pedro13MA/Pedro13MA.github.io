"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TelegramMockup } from "@/components/TelegramMockup";
import { FadeIn } from "@/components/motion/FadeIn";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-mesh gradient-mesh-animated noise-overlay">
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 md:px-6 pt-28 pb-24 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <FadeIn>
              <h1 className="font-display font-semibold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] text-white tracking-[-0.03em]">
                A inteligência que encontra{" "}
                <span className="text-gradient">descontos reais</span> — antes de tu os veres.
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-6 text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl">
                O Spotter monitoriza milhares de produtos em tempo real, valida cada oportunidade com
                scoring avançado e entrega-te apenas o que vale a pena. Directamente no Telegram.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button href={TELEGRAM_CHANNEL} external className="w-full sm:w-auto">
                  Entrar no canal
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button href="#como-funciona" variant="secondary" className="w-full sm:w-auto">
                  Ver como funciona
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" aria-hidden="true" />
                  Activo 24/7
                </li>
                <li>Feeds oficiais UE</li>
                <li>Só deals validados</li>
                <li>Alertas personalizados</li>
              </ul>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} className="relative lg:pl-8">
            <PipelineNodes />
            <div className="relative mx-auto max-w-md lg:max-w-none lg:rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <TelegramMockup theme="premium" className="relative z-10" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function PipelineNodes() {
  return (
    <svg
      className="absolute -left-4 top-1/2 -translate-y-1/2 w-24 h-48 text-indigo-500/20 hidden lg:block pointer-events-none"
      aria-hidden="true"
    >
      <circle cx="12" cy="24" r="4" fill="currentColor" />
      <circle cx="12" cy="120" r="4" fill="currentColor" />
      <line x1="12" y1="28" x2="60" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="116" x2="60" y2="80" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="80" r="6" fill="#6366f1" opacity="0.5" />
    </svg>
  );
}
