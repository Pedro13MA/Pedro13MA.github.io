import {
  AiDashboardArt,
  AlertsArt,
  ChartHistoryArt,
  CompareArt,
  CouponsArt,
  TimelineArt,
} from "@/components/home/premium/illustrations";

const BLOCKS = [
  {
    title: "Histórico",
    body: "Não basta o preço de hoje. Vês o que o mercado já mostrou ao longo do tempo.",
    Art: ChartHistoryArt,
  },
  {
    title: "Análise inteligente",
    body: "Cruzamos evidência observada para sugerir comprar, esperar — ou admitir incerteza.",
    Art: AiDashboardArt,
  },
  {
    title: "Timeline",
    body: "Uma linha temporal clara: como o preço evoluiu até ao momento actual.",
    Art: TimelineArt,
  },
  {
    title: "Cupões",
    body: "Campanhas à parte. Nunca fingimos que um cupão já está no preço.",
    Art: CouponsArt,
  },
  {
    title: "Alertas",
    body: "Avisa-te quando o limiar que definiste é cruzado — sem ruído promocional.",
    Art: AlertsArt,
  },
  {
    title: "Comparação",
    body: "Compara produtos lado a lado com o mesmo critério: momento, não só loja.",
    Art: CompareArt,
  },
] as const;

export function HomeDifference() {
  return (
    <section id="diferenca" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <p className="text-sm font-semibold text-blue-600">Produto</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Porque o Lymiar é diferente?
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate-500">
          Não agregamos promoções. Ajudamos a decidir se vale a pena comprar hoje.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map(({ title, body, Art }) => (
            <article key={title} className="home-card overflow-hidden">
              <Art className="h-auto w-full" />
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
