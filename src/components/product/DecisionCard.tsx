import type { DecisionScore } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEMAPHORE_LABEL } from "@/lib/utils";

type Props = { decision: DecisionScore };

export function DecisionCard({ decision }: Props) {
  const sem = SEMAPHORE_LABEL[decision.semaphore];

  return (
    <Card className="border-teal-500/15 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80">
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
            <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
