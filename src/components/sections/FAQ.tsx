"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

const items = [
  {
    q: "O Spotter é gratuito?",
    a: "Sim. O canal Telegram é gratuito. Monetização via links de afiliado — sem custo para ti.",
  },
  {
    q: "Como recebo alertas personalizados?",
    a: "Abre o bot no Telegram e usa /alertar [produto]. Recebes DM privada quando o Spotter deteta match.",
  },
  {
    q: "Posso confiar nos descontos?",
    a: "Cada deal passa por validação de histórico de preços e deteção de falsas promoções. Se o desconto não é real, não publicamos.",
  },
  {
    q: "Que lojas monitorizam?",
    a: "Feeds oficiais de afiliados: Amazon, PCComponentes, Worten, FNAC, MediaMarkt, Eneba, entre outras.",
  },
  {
    q: "Com que frequência publicam?",
    a: "Depende da qualidade do mercado. Preferimos silêncio a spam — só deals que valem a pena.",
  },
  {
    q: "Isto é um site de cupões?",
    a: "Não. É um motor de price intelligence com curadoria automática. A diferença é a validação.",
  },
  {
    q: "Há app ou website de deals?",
    a: "Por agora, tudo acontece no Telegram. Dashboard web está no roadmap.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#111113]/50">
      <div className="mx-auto max-w-[800px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>PERGUNTAS FREQUENTES</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Ainda com dúvidas?
          </h2>
        </FadeIn>

        <div className="mt-12 space-y-3">
          {items.map((item, i) => (
            <FadeIn key={item.q} delay={i * 0.05}>
              <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-zinc-900/30">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 p-5 text-left min-h-[44px]"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-zinc-500 shrink-0 transition-transform",
                      open === i && "rotate-180"
                    )}
                  />
                </button>
                {open === i && (
                  <p className="px-5 pb-5 text-zinc-400 leading-relaxed -mt-1">{item.a}</p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
