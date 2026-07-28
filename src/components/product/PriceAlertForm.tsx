"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatEUR } from "@/lib/utils";

type Props = {
  productName: string;
  currentPrice: number;
  suggestedThreshold?: number;
};

export function PriceAlertForm({
  productName,
  currentPrice,
  suggestedThreshold,
}: Props) {
  const defaultTarget =
    suggestedThreshold ?? Math.round(currentPrice * 0.92 * 100) / 100;
  const [target, setTarget] = useState(String(defaultTarget));
  const [channel, setChannel] = useState<"telegram" | "email">("telegram");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "saved">("idle");

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
          {productName} — alerta abaixo do teu preço-alvo (Telegram / Email).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
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
              Alerta preparado (mock). Integração Telegram/Email a ligar ao backend Limiar.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
