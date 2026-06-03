import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";
import { CountUp } from "@/components/motion/CountUp";

const stats = [
  { value: 10, prefix: "<", suffix: "s", label: "Tempo por ciclo de análise", isNumeric: true },
  { value: 6, suffix: "", label: "Camadas de validação", isNumeric: true },
  { value: 24, suffix: "/7", label: "Monitorização contínua", isNumeric: false },
  { value: 100, suffix: "%", label: "Feeds oficiais de afiliados", isNumeric: true },
];

export function Stats() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>EM NÚMEROS</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Lean por dentro. Poderoso por fora.
          </h2>
        </FadeIn>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="text-center lg:text-left">
                <p className="font-display text-4xl md:text-5xl font-semibold text-white tabular-nums">
                  {s.isNumeric ? (
                    <>
                      {s.prefix}
                      <CountUp value={s.value} />
                      {s.suffix}
                    </>
                  ) : (
                    <>
                      <CountUp value={s.value} />
                      {s.suffix}
                    </>
                  )}
                </p>
                <p className="mt-2 text-sm text-zinc-500">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
