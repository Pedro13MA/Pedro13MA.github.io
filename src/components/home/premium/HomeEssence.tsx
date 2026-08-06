/**
 * Uma secção: o que o Lymiar é — sem feature dump, sem métricas de vaidade.
 */
export function HomeEssence() {
  return (
    <section id="limiar" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--hm-brand)]">O limiar</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Não procuramos o menor preço.
            <span className="block text-slate-500">Procuramos o momento certo.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            O nome vem de <span className="font-semibold text-slate-900">limiar</span> —
            o ponto em que uma compra deixa de ser só “barata” e passa a valer a
            pena, com base no que o mercado já mostrou.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-6">
          <li className="relative sm:pr-6">
            <p className="font-display text-sm font-semibold text-[var(--hm-buy)]">
              Comprar
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              O preço actual encaixa no histórico observado. Há evidência para
              avançar — sem pressa artificial.
            </p>
          </li>
          <li className="relative border-t border-slate-200 pt-8 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 lg:pr-6">
            <p className="font-display text-sm font-semibold text-[var(--hm-wait)]">
              Esperar
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Já vimos melhor. Dizemos-to com calma — evitar arrependimento
              conta tanto como apanhar um saldo.
            </p>
          </li>
          <li className="border-t border-slate-200 pt-8 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className="font-display text-sm font-semibold text-slate-500">
              Ainda não sabemos
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Sem amostra suficiente, não inventamos certeza. Preferimos
              admitir o limite a forçar um veredicto.
            </p>
          </li>
        </ol>

        <p className="mt-12 max-w-xl text-sm leading-relaxed text-slate-500">
          Cupões e campanhas da loja ficam à parte. O preço Lymiar é o que
          observámos — nunca misturado com marketing como se já estivesse
          aplicado.
        </p>
      </div>
    </section>
  );
}
