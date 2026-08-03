"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ingestFactualNotification,
  saveNotificationPreferences,
} from "@/lib/notifications/api";
import { useSession } from "@/components/auth/SessionProvider";

const PRODUCT_OPTS = [
  { id: "NEW_MIN", label: "Novo mínimo observado" },
  { id: "PRICE_TARGET", label: "Preço abaixo do objetivo" },
  { id: "NEW_STORE", label: "Nova loja" },
  { id: "NEW_COUPON", label: "Novo cupão" },
  { id: "BACK_IN_STOCK", label: "Disponibilidade" },
] as const;

export function ProductNotifyModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: { slug: string; name: string; href?: string };
}) {
  const { status } = useSession();
  const [selected, setSelected] = useState<Record<string, boolean>>({
    NEW_MIN: true,
    PRICE_TARGET: true,
    NEW_STORE: true,
    NEW_COUPON: false,
    BACK_IN_STOCK: true,
  });
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const save = async () => {
    if (status !== "authenticated") {
      window.location.href = `/entrar/?next=${encodeURIComponent(`/p/?id=${product.slug}`)}`;
      return;
    }
    await saveNotificationPreferences({
      productEvents: selected,
      scopes: { product: true },
    });
    // Confirmação in-app factual (não é previsão)
    await ingestFactualNotification({
      eventKind: "WATCH_CHANGE",
      entityKind: "product",
      entityKey: product.slug,
      title: `Alertas activos: ${product.name}`,
      body: "Vamos notificar-te quando observarmos alterações factuais neste produto.",
      href: product.href || `/p/?id=${encodeURIComponent(product.slug)}`,
    });
    setMsg("Preferências guardadas.");
    window.setTimeout(onClose, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="notify-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="notify-title" className="font-display text-xl font-bold">
          Receber notificações
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Só eventos observados — nunca previsões.
        </p>
        <ul className="mt-4 space-y-2">
          {PRODUCT_OPTS.map((o) => (
            <li key={o.id}>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!selected[o.id]}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, [o.id]: e.target.checked }))
                  }
                />
                {o.label}
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <Button type="button" className="flex-1" onClick={() => void save()}>
            Activar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
        {msg ? <p className="mt-2 text-xs text-slate-500">{msg}</p> : null}
      </div>
    </div>
  );
}
