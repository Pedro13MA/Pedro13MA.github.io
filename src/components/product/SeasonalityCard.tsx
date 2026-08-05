import type { SeasonalityInsight } from "@/lib/product-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MONTH_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

type Props = { seasonality: SeasonalityInsight };

export function SeasonalityCard({ seasonality }: Props) {
  if (!seasonality.sufficient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sazonalidade &amp; Histórico</CardTitle>
          <CardDescription>Padrões ao longo do ano</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Histórico insuficiente para estimar padrões sazonais.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sazonalidade &amp; Histórico</CardTitle>
        <CardDescription>
          Com base no histórico Lymiar observado para este produto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {seasonality.lowPricePeriods.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Costuma atingir os preços mais baixos em
            </p>
            <ul className="mt-2 space-y-1.5">
              {seasonality.lowPricePeriods.map((period) => (
                <li
                  key={period}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  {period}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <p className="text-[11px] font-medium text-slate-500">Desconto médio</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-slate-900">
              {seasonality.avgPromoDiscountPct != null
                ? `${seasonality.avgPromoDiscountPct.toFixed(0)}%`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <p className="text-[11px] font-medium text-slate-500">Melhor desconto observado</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-slate-900">
              {seasonality.bestPromoDiscountPct != null
                ? `${seasonality.bestPromoDiscountPct.toFixed(0)}%`
                : "—"}
            </p>
          </div>
        </div>

        {seasonality.highPriceMonths.length > 0 ? (
          <p className="text-sm text-slate-600">
            Meses em que o preço normalmente sobe:{" "}
            <span className="font-medium text-slate-800">
              {seasonality.highPriceMonths.join(", ")}
            </span>
            .
          </p>
        ) : null}

        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {seasonality.markers.map((marker) => (
            <div
              key={marker.month}
              title={marker.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-0.5 py-1.5 text-center",
                marker.kind === "promo" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800",
                marker.kind === "peak" && "border-amber-200 bg-amber-50 text-amber-800",
                marker.kind === "neutral" && "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              <span className="text-[9px] font-medium uppercase tracking-wide">
                {MONTH_SHORT[marker.month - 1]}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  marker.kind === "promo" && "bg-emerald-500",
                  marker.kind === "peak" && "bg-amber-500",
                  marker.kind === "neutral" && "bg-slate-300",
                )}
              />
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{seasonality.note}</p>
        <p className="text-xs text-slate-500">
          Esteve abaixo do preço actual em{" "}
          <span className="font-semibold text-slate-700">
            {seasonality.timesBelowCurrent12m} ocasiões
          </span>{" "}
          no histórico analisado.
        </p>
      </CardContent>
    </Card>
  );
}
