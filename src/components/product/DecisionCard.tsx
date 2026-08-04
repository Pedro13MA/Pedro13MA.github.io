import type { DecisionScore, PricePoint } from "@/lib/types";
import {
  historySpanDays,
  MIN_HISTORY_POINTS_FOR_PATTERNS,
  MIN_HISTORY_SPAN_DAYS,
} from "@/lib/product-insights";
import { formatEUR, formatPct } from "@/lib/utils";

type Props = {
  decision: DecisionScore;
  currentPrice: number;
  avg30d?: number | null;
  historicalMin?: number | null;
  history?: PricePoint[];
  storeCount?: number;
  samples30d?: number;
  samples90d?: number;
};

function pctVs(current: number, ref: number): number {
  if (!(ref > 0)) return 0;
  return ((ref - current) / ref) * 100;
}

export function DecisionCard({
  decision,
  currentPrice,
  avg30d,
  historicalMin,
  history = [],
  storeCount = 0,
  samples30d,
  samples90d,
}: Props) {
  const span = historySpanDays(history);
  const insufficient =
    history.length < Math.min(5, MIN_HISTORY_POINTS_FOR_PATTERNS) ||
    span < Math.min(14, MIN_HISTORY_SPAN_DAYS / 2);

  const avg = avg30d != null && avg30d > 0 ? avg30d : decision.historicalAvg;
  const min =
    historicalMin != null && historicalMin > 0
      ? historicalMin
      : decision.historicalMin;
  const vsAvg = avg != null && avg > 0 ? pctVs(currentPrice, avg) : null;

  let why: string;
  if (insufficient) {
    why =
      "Ainda não temos histórico suficiente para dizer se este preço é bom no tempo. Não vamos inventar um veredicto.";
  } else if (decision.semaphore === "buy" && vsAvg != null && vsAvg >= 1) {
    why = `Este preço está ${formatPct(vsAvg)} abaixo da média dos últimos dias observados.`;
  } else if (decision.semaphore === "wait" && vsAvg != null && vsAvg < 0) {
    why = `Este preço está cerca de ${Math.abs(vsAvg).toFixed(0).replace(".", ",")}% acima da média observada.`;
  } else if (decision.semaphore === "fair") {
    why = "O preço está alinhado com o que temos observado — nem claramente barato, nem claramente caro.";
  } else {
    const summary = (decision.limiarIndex.summary || decision.reason || "").trim();
    why =
      summary && !/score|índice|deal/i.test(summary)
        ? summary
        : "Comparamos o preço actual com o histórico observado deste produto.";
  }

  const observations = Math.max(history.length, samples90d ?? 0, samples30d ?? 0);

  return (
    <section id="porque" className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">Porquê?</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{why}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4">
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Preço actual
          </dt>
          <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-slate-900">
            {formatEUR(currentPrice)}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4">
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Média histórica
          </dt>
          <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-slate-900">
            {avg != null && avg > 0 ? formatEUR(avg) : "—"}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4">
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Menor preço observado
          </dt>
          <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-slate-900">
            {min != null && min > 0 ? formatEUR(min) : "—"}
          </dd>
        </div>
      </dl>

      <div
        id="confiança"
        className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-5"
      >
        <h3 className="font-display text-base font-semibold text-slate-900">
          Sobre esta decisão
        </h3>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
          <li>
            {span >= 1
              ? `${Math.round(span)} dias de histórico observado`
              : "Histórico temporal ainda curto"}
          </li>
          <li>
            {storeCount > 0
              ? `${storeCount} loja${storeCount === 1 ? "" : "s"} com oferta`
              : "Lojas com oferta a confirmar na tabela abaixo"}
          </li>
          <li>
            {observations > 0
              ? `${observations} alterações / pontos de preço na amostra`
              : "Poucas observações registadas"}
          </li>
        </ul>
      </div>
    </section>
  );
}
