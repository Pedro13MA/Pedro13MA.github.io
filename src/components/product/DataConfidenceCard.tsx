import type { DataConfidence } from "@/lib/product-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = { confidence: DataConfidence };

export function DataConfidenceCard({ confidence }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confiança dos Dados</CardTitle>
        <CardDescription>Qualidade do histórico usado nesta análise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p
            className="font-display text-xl tracking-wide text-amber-500"
            aria-label={`${confidence.stars} de 5 estrelas`}
          >
            {"★".repeat(confidence.stars)}
            <span className="text-slate-300">{"★".repeat(5 - confidence.stars)}</span>
          </p>
          <div>
            <p className="text-sm font-semibold text-slate-900">{confidence.label}</p>
            <p className="text-xs text-slate-500">Score interno {confidence.score}/100</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Baseado em
          </p>
          <ul className="mt-2 space-y-1.5">
            {confidence.reasons.map((reason) => (
              <li
                key={reason}
                className={cn("flex gap-2 text-sm text-slate-700")}
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-500" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {confidence.stars <= 2 ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-950">
            Histórico ainda reduzido. As conclusões podem mudar à medida que o Limiar recolher
            mais observações.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
