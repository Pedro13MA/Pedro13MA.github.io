import { Ban, Megaphone, Clock } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";

const problems = [
  {
    icon: Ban,
    title: "Promoções falsas",
    text: 'Preços "originais" inflacionados para simular -70%',
  },
  {
    icon: Megaphone,
    title: "Canais spam",
    text: "Centenas de links por dia, zero curadoria",
  },
  {
    icon: Clock,
    title: "Oportunidades perdidas",
    text: "Os melhores deals desaparecem em minutos",
  },
];

export function ProblemSolution() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>O PROBLEMA</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            O mercado de deals está cheio de ruído.
          </h2>
        </FadeIn>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <article className="bg-zinc-900/50 border border-white/[0.06] rounded-xl p-6 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 h-full">
                <p.icon className="w-8 h-8 text-zinc-500 mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-zinc-400 leading-relaxed">{p.text}</p>
              </article>
            </FadeIn>
          ))}
        </div>

        <div className="my-16 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <FadeIn>
          <SectionLabel>A SOLUÇÃO</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            O Spotter filtra. Valida. Entrega.
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-3xl leading-relaxed">
            Um motor autónomo de price intelligence que analisa histórico de preços, deteta falsas
            promoções e publica apenas oportunidades com score elevado — para não perderes tempo nem
            dinheiro.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
