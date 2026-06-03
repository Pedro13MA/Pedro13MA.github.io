"use client";

import { useState } from "react";
import {
  Database,
  TrendingDown,
  Shield,
  Brain,
  Layers,
  Send,
} from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";

const steps = [
  {
    num: "01",
    name: "Ingestão",
    desc: "Feeds oficiais de afiliados (Awin, Amazon PA-API)",
    detail: "Modo compliance — sem scraping de lojas; apenas fontes autorizadas UE/PT.",
    icon: Database,
  },
  {
    num: "02",
    name: "Price Intelligence",
    desc: "Histórico cross-store, z-score, volatilidade",
    detail: "Compara cada preço com histórico real em SQLite para validar se o desconto é genuíno.",
    icon: TrendingDown,
  },
  {
    num: "03",
    name: "Trust Gate",
    desc: "Rating, reviews, marcas verificadas",
    detail: "Rejeita genéricos suspeitos; prioriza FBA, marcas conhecidas e reputação Amazon.",
    icon: Shield,
  },
  {
    num: "04",
    name: "Decision Engine",
    desc: "Scoring 0–100, tiers S/A/B",
    detail: "Deteção de falsos descontos; caps por categoria; cada publish ou skip é registado.",
    icon: Brain,
  },
  {
    num: "05",
    name: "Revenue Mix",
    desc: "Selecção inteligente por ciclo",
    detail: "Maximiza qualidade e diversidade do feed — não só o maior desconto percentual.",
    icon: Layers,
  },
  {
    num: "06",
    name: "Telegram",
    desc: "Publicação curada por categoria",
    detail: "Routing para Tech, PC, Mobile, Casa, Quedas de Preço e Super Ofertas.",
    icon: Send,
  },
];

export function Pipeline() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="como-funciona" className="py-24 md:py-32 bg-[#111113]/50">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>PIPELINE DE DECISÃO</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Seis camadas de inteligência antes de cada publicação.
          </h2>
        </FadeIn>

        <div className="mt-16 relative">
          <div
            className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-white/[0.06]"
            aria-hidden="true"
          >
            <div className="h-full w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
          </div>

          <div role="list" className="grid lg:grid-cols-6 gap-8 lg:gap-4 relative">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.08}>
                <div
                  role="listitem"
                  className="relative lg:text-center group cursor-pointer"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive(active === i ? null : i)}
                >
                  <div className="lg:mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 lg:relative lg:z-10">
                    <step.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-xs text-zinc-500">{step.num}</span>
                  <h3 className="font-display mt-1 font-semibold text-white text-sm">{step.name}</h3>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                  {active === i && (
                    <p className="mt-3 text-xs text-indigo-300/90 leading-relaxed lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:w-48 lg:top-full lg:mt-4 lg:bg-zinc-900 lg:p-3 lg:rounded-lg lg:border lg:border-white/[0.06]">
                      {step.detail}
                    </p>
                  )}
                  <div className="lg:hidden absolute left-5 top-14 bottom-0 w-px bg-white/[0.06] -z-10" aria-hidden="true" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <p className="mt-12 font-mono text-sm text-zinc-500 text-center">
          Cada decisão gera um log auditável — publish ou skip, sempre explicável.
        </p>
      </div>
    </section>
  );
}
