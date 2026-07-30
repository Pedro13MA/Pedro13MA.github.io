import type { DecisionScore } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatEUR, formatPct, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = {
  decision: DecisionScore;
  currentPrice?: number;
  avg30d?: number | null;
};

export function DecisionCard({ decision, currentPrice, avg30d }: Props) {
  const sem = SEMAPHORE_LABEL[decision.semaphore];
  const isBuy = decision.semaphore === "buy";
  const histAvg = decision.historicalAvg ?? avg30d ?? null;
  const histMin = decision.historicalMin ?? null;

  const justification: string[] = [...(decision.bullets || [])];

  if (histAvg != null && currentPrice != null && histAvg > 0) {
    const vsAvg = ((histAvg - currentPrice) / histAvg) * 100;
    if (vsAvg >= 1) {
      const line = `${formatPct(vsAvg)} abaixo da média de 30 dias (${formatEUR(histAvg)})`;
      if (!justification.some((b) => b.toLowerCase().includes("média"))) {
        justification.unshift(line);
      }
    }
  }

  if (decision.isHistoricalMin || (histMin != null && currentPrice != null && Math.abs(currentPrice - histMin) < 0.015)) {
    const line = `Preço no mínimo histórico${histMin != null ? ` (${formatEUR(histMin)})` : ""}`;
    if (!justification.some((b) => b.toLowerCase().includes("mínimo histórico"))) {
      justification.unshift(line);
    }
  }

  return (
    <Card
      className={cn(
        isBuy && "border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40",
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Vale a pena comprar?</CardTitle>
          <Badge variant={decision.semaphore} className="gap-1.5">
            <span aria-hidden>{sem.emoji}</span>
            {sem.label}
          </Badge>
        </div>
        <CardDescription>
          Veredito baseado em dados históricos — sem previsões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBuy ? (
          <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-sm font-semibold text-emerald-900">
            Sim — o Limiar considera esta uma oportunidade favorável face ao histórico.
          </p>
        ) : decision.semaphore === "fair" ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-sm font-medium text-amber-950">
            Preço razoável, mas ainda não é o melhor momento absoluto segundo o histórico.
          </p>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
            Por agora convém esperar — o histórico sugere melhores oportunidades.
          </p>
        )}

        <ul className="space-y-3">
          {justification.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  isBuy ? "bg-emerald-600" : "bg-sky-600",
                )}
                aria-hidden
              />
              {bullet}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
