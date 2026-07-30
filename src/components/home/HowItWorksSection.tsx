const STEPS = [
  {
    icon: "🔍",
    title: "Pesquisa",
    text: "Encontra qualquer produto.",
  },
  {
    icon: "📊",
    title: "Análise",
    text: "O Limiar compara histórico, mercado e preços.",
  },
  {
    icon: "✅",
    title: "Decisão",
    text: "Descobre se vale a pena comprar hoje ou esperar.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-t border-slate-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Como funciona
        </h2>
        <p className="mx-auto mt-2.5 max-w-md text-center text-[15px] text-slate-500">
          Três passos. Sem ruído.
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {i < STEPS.length - 1 ? (
                <span
                  className="pointer-events-none absolute left-[calc(50%+2.5rem)] top-7 hidden h-px w-[calc(100%-5rem)] bg-slate-200 sm:block"
                  aria-hidden
                />
              ) : null}
              <p className="text-3xl" aria-hidden>
                {step.icon}
              </p>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
