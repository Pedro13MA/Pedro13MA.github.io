"use client";

import { useEffect, useState } from "react";
import type { LimiarIndex } from "@/lib/types";
import { displayFactors } from "@/lib/product-insights";
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
  const factors = displayFactors(index);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Porque é que o Índice Limiar é {index.value}?</CardTitle>
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
              Contribuição de cada factor para o índice — valores factuais do histórico Limiar.
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          {factors.map((factor) => {
            const pct = Math.max(
              0,
              Math.min(100, (factor.score / factor.maxScore) * 100),
            );
            return (
              <li key={factor.key} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{factor.title}</p>
                    <p className="text-xs leading-snug text-slate-500">{factor.description}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold tabular-nums",
                      factor.tone.text,
                    )}
                  >
                    {factor.score} pts
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="meter"
                  aria-valuenow={factor.score}
                  aria-valuemin={0}
                  aria-valuemax={factor.maxScore}
                  aria-label={factor.title}
                >
                  <div
                    className={cn(
                      "h-full origin-left rounded-full transition-transform duration-700 ease-out",
                      factor.tone.bar,
                    )}
                    style={{
                      width: `${pct}%`,
                      transform: animate ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
