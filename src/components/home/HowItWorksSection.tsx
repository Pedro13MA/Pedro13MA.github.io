const STEPS = [
  {
    icon: "🔍",
    title: "Procuras um produto",
    text: "Pesquisa por nome, marca ou EAN.",
  },
  {
    icon: "📊",
    title: "O Limiar analisa",
    text: "Histórico, preços multi-loja e mercado.",
  },
  {
    icon: "✅",
    title: "Decides com confiança",
    text: "Compra agora ou espera — com dados.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="border-t border-slate-200/80 bg-white scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-slate-900">
          Como funciona
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
          Três passos. Sem ruído.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {i < STEPS.length - 1 ? (
                <span
                  className="pointer-events-none absolute left-[calc(50%+2.5rem)] top-8 hidden h-px w-[calc(100%-5rem)] bg-slate-200 sm:block"
                  aria-hidden
                />
              ) : null}
              <p className="text-4xl" aria-hidden>
                {step.icon}
              </p>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
