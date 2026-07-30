import type { LimiarIndex } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatEUR, limiarIndexTone } from "@/lib/utils";

type Props = {
  index: LimiarIndex;
  currentPrice?: number;
  className?: string;
};

export function LimiarIndexCard({ index, currentPrice, className }: Props) {
  const tone = limiarIndexTone(index.value);
  const size = 112;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, index.value)) / 100);
  const factors = [
    index.factors.vsAvg30d,
    index.factors.historicalMin,
    index.factors.couponApplied,
    index.factors.volatility,
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>
          Porque é que o Índice Limiar é {index.value}?
        </CardTitle>
        <CardDescription>{index.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" aria-hidden>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={tone.track}
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={tone.stroke}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("font-display text-3xl font-bold tabular-nums", tone.text)}>
                {index.value}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="space-y-1">
            {currentPrice != null ? (
              <p className="font-display text-2xl font-bold tabular-nums text-slate-900">
                {formatEUR(currentPrice)}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-slate-600">
              Score factual 0–100 com base em histórico de preço, cupões e volatilidade — sem
              previsões.
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {factors.map((factor) => (
            <li
              key={factor.label}
              className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{factor.label}</p>
                <p className="text-xs text-slate-500">{factor.detail}</p>
              </div>
              <span className="shrink-0 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium tabular-nums text-slate-700">
                +{factor.score}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
