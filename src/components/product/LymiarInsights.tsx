import Link from "next/link";
import type { LymiarInsight } from "@/lib/product-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { insights: LymiarInsight[] };

export function LymiarInsights({ insights }: Props) {
  if (!insights.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dicas Lymiar</CardTitle>
        <CardDescription>
          Recomendações geradas apenas quando há confiança suficiente nos dados observados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {insights.map((tip) => (
            <li
              key={tip.id}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3.5"
            >
              <p className="text-sm font-semibold text-slate-900">
                <span className="mr-1.5" aria-hidden>
                  {tip.icon}
                </span>
                {tip.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{tip.message}</p>
              {tip.href ? (
                <Link
                  href={tip.href}
                  className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:underline"
                >
                  Ver variante →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
