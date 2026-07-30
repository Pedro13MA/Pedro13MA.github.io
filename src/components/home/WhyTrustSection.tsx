const OTHERS = [
  "Mostram apenas preços",
  "Não sabem se a promoção é real",
  "Sem histórico fiável",
  "Sem sazonalidade",
] as const;

const LIMIAR = [
  "Histórico completo multi-loja",
  "Índice Limiar 0–100",
  "Deal Score de competitividade",
  "Alertas inteligentes",
  "Gráfico de preços e sazonalidade",
  "Recomendação baseada em dados",
] as const;

export function WhyTrustSection() {
  return (
    <section
      id="porque-limiar"
      className="scroll-mt-16 border-t border-slate-200/60 bg-[#FAFAFA]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Porque milhares de preços não chegam.
        </h2>
        <p className="mx-auto mt-3.5 max-w-lg text-center text-[15px] leading-relaxed text-slate-500">
          Comparadores clássicos mostram um número. O Limiar contextualiza esse número.
        </p>

        <div className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Outros comparadores
            </p>
            <ul className="mt-5 space-y-3.5">
              {OTHERS.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] text-slate-500">
                  <span className="text-slate-300" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
              Limiar
            </p>
            <ul className="mt-5 space-y-3.5">
              {LIMIAR.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] font-medium text-slate-800">
                  <span className="text-emerald-600" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
