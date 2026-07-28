import type { DecisionScore } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEMAPHORE_LABEL } from "@/lib/utils";

type Props = { decision: DecisionScore };

export function DecisionCard({ decision }: Props) {
  const sem = SEMAPHORE_LABEL[decision.semaphore];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Vale a pena comprar?</CardTitle>
          <Badge variant={decision.semaphore}>{sem.label}</Badge>
        </div>
        <CardDescription>
          Score {decision.finalScore.toFixed(2)} · {decision.dealQuality.replaceAll("_", " ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {decision.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
