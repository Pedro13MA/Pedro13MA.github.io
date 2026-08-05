export function HomeWhatIs() {
  return (
    <section
      id="o-que-e"
      className="scroll-mt-20 border-b border-[var(--hm-line)]"
      aria-labelledby="home-what-title"
    >
      <div className="home-fade mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--hm-faint)]">
          Conceito
        </p>
        <h2
          id="home-what-title"
          className="mt-4 font-display text-2xl font-semibold tracking-tight text-[var(--hm-text)] sm:text-4xl"
        >
          O que é o Lymiar?
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="home-surface p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-faint)]">
              Comparadores tradicionais
            </p>
            <p className="mt-5 font-display text-xl text-[var(--hm-muted)] sm:text-2xl">
              &ldquo;Onde está mais barato?&rdquo;
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-[var(--hm-faint)]">
              Olham sobretudo para o preço de hoje. Isso pode ser útil — e também
              enganador, se esse preço for alto face ao que o mercado já mostrou.
            </p>
          </div>
          <div className="home-surface border-[rgba(249,229,205,0.28)] p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-brand)]">
              Lymiar
            </p>
            <p className="mt-5 font-display text-xl text-[var(--hm-text)] sm:text-2xl">
              &ldquo;Este é realmente o momento certo para comprar?&rdquo;
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-[var(--hm-muted)]">
              Comparamos o preço actual com o histórico observado. Só depois
              sugerimos comprar, esperar — ou admitimos que ainda não há dados
              suficientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeWhyName() {
  return (
    <section
      id="nome"
      className="scroll-mt-20 border-b border-[var(--hm-line)] bg-[var(--hm-bg-muted)]"
      aria-labelledby="home-name-title"
    >
      <div className="home-fade mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--hm-faint)]">
          Origem
        </p>
        <h2
          id="home-name-title"
          className="mt-4 font-display text-2xl font-semibold tracking-tight text-[var(--hm-text)] sm:text-4xl"
        >
          Porque o nome Lymiar
        </h2>
        <p className="mt-10 text-lg leading-relaxed text-[var(--hm-muted)] sm:text-xl">
          Lymiar nasce da ideia de{" "}
          <span className="text-[var(--hm-brand)]">limiar</span> — o ponto onde
          um preço deixa de ser apenas &ldquo;mais baixo nalguma loja&rdquo; e
          passa a valer realmente a pena no tempo.
        </p>
        <p className="mt-8 text-[15px] leading-relaxed text-[var(--hm-faint)] sm:text-base">
          Não fazemos previsões. Não inventamos descontos. Observamos o mercado
          até existir evidência suficiente para dizer:{" "}
          <span className="text-[var(--hm-text)]">Comprar</span>,{" "}
          <span className="text-[var(--hm-text)]">Esperar</span>, ou{" "}
          <span className="text-[var(--hm-text)]">Ainda não sabemos</span>.
        </p>
      </div>
    </section>
  );
}
