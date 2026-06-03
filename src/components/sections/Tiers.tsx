import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";
import { CountUp } from "@/components/motion/CountUp";

const tiers = [
  {
    tier: "S",
    badge: "S-TIER",
    emoji: "🔥",
    criteria: "Score ≥ 85 · oportunidade excepcional",
    dest: "Canal + Super Ofertas",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)] border-amber-500/30",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    conic: true,
  },
  {
    tier: "A",
    badge: "A-TIER",
    emoji: "⚡",
    criteria: "Score ≥ 72 · deal sólido",
    dest: "Canal por categoria",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.12)] border-emerald-500/25",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    conic: false,
  },
  {
    tier: "B",
    badge: "B-TIER",
    emoji: "📦",
    criteria: "Abaixo do threshold público",
    dest: "Alertas privados apenas",
    glow: "border-white/[0.06]",
    badgeClass: "bg-zinc-800/50 text-zinc-500 border-white/[0.08]",
    conic: false,
  },
];

export function Tiers() {
  return (
    <section id="inteligencia" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>CURADORIA</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Nem todas as ofertas chegam ao canal.
          </h2>
        </FadeIn>

        <div className="mt-12 flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {tiers.map((t, i) => (
            <FadeIn key={t.tier} delay={i * 0.1} className="min-w-[280px] md:min-w-0 snap-center">
              <article
                className={`rounded-2xl border p-6 h-full bg-zinc-900/50 hover:-translate-y-0.5 transition-all duration-200 ${t.glow} ${t.conic ? "conic-border-s tier-s-shimmer" : ""}`}
              >
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${t.badgeClass}`}
                >
                  <span aria-hidden="true">{t.emoji}</span> {t.badge}
                </span>
                <p className="mt-4 text-zinc-400 text-sm leading-relaxed">{t.criteria}</p>
                <p className="mt-3 text-white text-sm font-medium">{t.dest}</p>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <p className="mt-10 text-center text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Apenas deals S e A são publicados no canal público. Tier B fica reservado para alertas
            personalizados — porque acreditamos que menos é mais.
          </p>
          <p className="mt-8 text-center font-display text-2xl text-white">
            <CountUp value={73} suffix="%" className="text-gradient font-semibold" /> dos deals
            analisados são filtrados
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
