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
    <section id="porque-limiar" className="scroll-mt-16 border-t border-slate-200/80 bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-slate-900">
          Porque confiar no Limiar
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Comparadores clássicos mostram um número. O Limiar contextualiza esse número.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Outros comparadores
            </p>
            <ul className="mt-4 space-y-3">
              {OTHERS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="text-slate-300" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
              Limiar
            </p>
            <ul className="mt-4 space-y-3">
              {LIMIAR.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm font-medium text-slate-800">
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
