const ROWS: { label: string; traditional: boolean; lymiar: boolean }[] = [
  { label: "Mostra loja mais barata", traditional: true, lymiar: true },
  { label: "Mostra histórico", traditional: false, lymiar: true },
  { label: "Diz esperar", traditional: false, lymiar: true },
  { label: "Admite falta de dados", traditional: false, lymiar: true },
  { label: "Explica a decisão", traditional: false, lymiar: true },
  { label: "Cupões separados do preço", traditional: false, lymiar: true },
];

function Cell({ ok }: { ok: boolean }) {
  return (
    <td className="px-3 py-4 text-center sm:px-6">
      <span
        className={
          ok
            ? "font-display text-[var(--hm-brand)]"
            : "text-[var(--hm-faint)]"
        }
        aria-label={ok ? "Sim" : "Não"}
      >
        {ok ? "✔" : "✖"}
      </span>
    </td>
  );
}

export function HomeCompare() {
  return (
    <section
      id="comparacao"
      className="scroll-mt-20 border-b border-[var(--hm-line)] bg-[var(--hm-bg-muted)]"
      aria-labelledby="home-compare-title"
    >
      <div className="home-fade mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--hm-faint)]">
          Comparação
        </p>
        <h2
          id="home-compare-title"
          className="mt-4 font-display text-2xl font-semibold tracking-tight text-[var(--hm-text)] sm:text-4xl"
        >
          Comparador tradicional vs Lymiar
        </h2>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-sm sm:text-[15px]">
            <thead>
              <tr className="border-b border-[var(--hm-line)]">
                <th className="py-4 pr-4 font-medium text-[var(--hm-faint)]" scope="col">
                  Capacidade
                </th>
                <th
                  className="px-3 py-4 text-center font-medium text-[var(--hm-muted)] sm:px-6"
                  scope="col"
                >
                  Tradicional
                </th>
                <th
                  className="px-3 py-4 text-center font-medium text-[var(--hm-brand)] sm:px-6"
                  scope="col"
                >
                  Lymiar
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-[var(--hm-line)]">
                  <th
                    scope="row"
                    className="py-4 pr-4 font-normal text-[var(--hm-text)]"
                  >
                    {row.label}
                  </th>
                  <Cell ok={row.traditional} />
                  <Cell ok={row.lymiar} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
