"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildStillBetterAlertTip } from "@/lib/product-insights";
import { formatEUR } from "@/lib/utils";

type Props = {
  productName: string;
  currentPrice: number;
  historicalMin?: number;
  avg30d?: number | null;
  suggestedThreshold?: number;
};

const PCT_SHORTCUTS = [5, 10, 15, 20] as const;

export function PriceAlertForm({
  productName,
  currentPrice,
  historicalMin,
  avg30d,
  suggestedThreshold,
}: Props) {
  const defaultTarget =
    suggestedThreshold ?? Math.round(currentPrice * 0.92 * 100) / 100;
  const [target, setTarget] = useState(String(defaultTarget));
  const [channel, setChannel] = useState<"telegram" | "email">("telegram");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  const tip = useMemo(
    () =>
      buildStillBetterAlertTip({
        currentPrice,
        historicalMin: historicalMin ?? currentPrice,
        avg30d,
      }),
    [currentPrice, historicalMin, avg30d],
  );

  function applyPct(pct: number) {
    const next = Math.round(currentPrice * (1 - pct / 100) * 100) / 100;
    setTarget(String(next));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saved");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-sky-700" />
          Avisar-me quando baixar
        </CardTitle>
        <CardDescription>
          {productName} — define o preço-alvo e recebe aviso por Telegram ou email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PCT_SHORTCUTS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => applyPct(pct)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900"
              >
                −{pct}%
              </button>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Preço-alvo (€)
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </label>

          {tip ? (
            <p className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-xs leading-relaxed text-sky-950">
              <span aria-hidden className="mr-1">
                💡
              </span>
              <span className="font-semibold">Ainda melhor: </span>
              {tip}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={channel === "telegram" ? "default" : "secondary"}
              onClick={() => setChannel("telegram")}
            >
              Telegram
            </Button>
            <Button
              type="button"
              size="sm"
              variant={channel === "email" ? "default" : "secondary"}
              onClick={() => setChannel("email")}
            >
              Email
            </Button>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              {channel === "telegram" ? "@username ou chat id" : "Email"}
            </span>
            <Input
              type={channel === "email" ? "email" : "text"}
              placeholder={channel === "email" ? "tu@email.com" : "@utilizador"}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </label>

          <Button type="submit" className="w-full">
            Criar alerta · {formatEUR(Number(target) || 0)}
          </Button>

          {status === "saved" ? (
            <p className="text-center text-sm text-emerald-700">
              Alerta preparado. Integração Telegram/Email a ligar ao backend Limiar.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
