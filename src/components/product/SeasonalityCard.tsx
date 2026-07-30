import type { Seasonality } from "@/lib/types";
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

type Props = { seasonality: Seasonality };

export function SeasonalityCard({ seasonality }: Props) {
  const promoMonths = seasonality.markers.filter((m) => m.kind === "promo");
  const promoLabels = promoMonths.map((m) => MONTH_SHORT[m.month - 1]).join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sazonalidade &amp; Histórico</CardTitle>
        <CardDescription>
          {promoMonths.length > 0 ? (
            <>
              Costuma entrar em promoção em{" "}
              <span className="font-semibold text-slate-800">{promoLabels}</span>.
              Historicamente esteve abaixo do preço actual em{" "}
              <span className="font-semibold text-slate-800">
                {seasonality.timesBelowCurrent12m} ocasiões
              </span>
              .
            </>
          ) : (
            <>
              Historicamente esteve abaixo do preço actual em{" "}
              <span className="font-semibold text-slate-800">
                {seasonality.timesBelowCurrent12m} ocasiões
              </span>{" "}
              nos últimos 12 meses.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {seasonality.markers.map((marker) => (
            <div
              key={marker.month}
              title={marker.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center",
                marker.kind === "promo" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800",
                marker.kind === "peak" && "border-amber-200 bg-amber-50 text-amber-800",
                marker.kind === "neutral" && "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {MONTH_SHORT[marker.month - 1]}
              </span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  marker.kind === "promo" && "bg-emerald-500",
                  marker.kind === "peak" && "bg-amber-500",
                  marker.kind === "neutral" && "bg-slate-300",
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Meses promocionais
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Pico de procura
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> Neutro
          </span>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{seasonality.note}</p>
      </CardContent>
    </Card>
  );
}
