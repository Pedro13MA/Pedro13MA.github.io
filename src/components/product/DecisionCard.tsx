import type { DecisionScore } from "@/lib/types";
import { buildDecisionVerdict, historySpanDays } from "@/lib/product-insights";
import type { PricePoint } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = {
  decision: DecisionScore;
  currentPrice?: number;
  avg30d?: number | null;
  history?: PricePoint[];
};

export function DecisionCard({
  decision,
  currentPrice = 0,
  avg30d,
  history = [],
}: Props) {
  const sem = SEMAPHORE_LABEL[decision.semaphore];
  const isBuy = decision.semaphore === "buy";
  const { points, conclusion } = buildDecisionVerdict({
    decision,
    currentPrice,
    avg30d,
    historyLength: history.length,
    historySpanDays: historySpanDays(history),
  });

  return (
    <Card
      className={cn(
        isBuy &&
          "border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40",
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
          Parecer técnico Limiar com base apenas em dados históricos observados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-3">
          {points.map((point) => (
            <li
              key={`${point.kind}-${point.text}`}
              className="flex gap-2.5 text-sm leading-relaxed text-slate-700"
            >
              <span className="shrink-0 text-base leading-5" aria-hidden>
                {point.kind === "pro" ? "✅" : "⚠"}
              </span>
              <span>{point.text}</span>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            "rounded-xl border px-3.5 py-3 text-sm font-medium leading-relaxed",
            isBuy
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-950"
              : decision.semaphore === "fair"
                ? "border-amber-200 bg-amber-50/80 text-amber-950"
                : "border-slate-200 bg-slate-50 text-slate-800",
          )}
        >
          {conclusion}
        </div>
      </CardContent>
    </Card>
  );
}
