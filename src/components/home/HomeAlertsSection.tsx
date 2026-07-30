import { TELEGRAM_CHANNEL } from "@/lib/constants";

const CHANNELS = [
  {
    id: "telegram",
    label: "Telegram",
    hint: "Alertas no canal Limiar",
    href: TELEGRAM_CHANNEL,
    external: true,
  },
  {
    id: "email",
    label: "Email",
    hint: "Em breve na página de produto",
    href: "/#alertas",
    external: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    hint: "Em breve",
    href: null,
    external: false,
  },
] as const;

export function HomeAlertsSection() {
  return (
    <section id="alertas" className="scroll-mt-16 border-t border-slate-200/80 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Nunca percas uma verdadeira oportunidade.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Define o preço-alvo num produto e recebe aviso quando o Limiar observar esse valor —
            com base no histórico, não em anúncios de desconto.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
          {CHANNELS.map((ch) => {
            const inner = (
              <div
                className={`flex h-full flex-col items-center rounded-2xl border px-4 py-5 text-center ${
                  ch.href
                    ? "border-slate-200 bg-white shadow-sm transition hover:border-sky-300"
                    : "border-dashed border-slate-200 bg-white/60 opacity-70"
                }`}
              >
                <p className="font-display text-base font-semibold text-slate-900">{ch.label}</p>
                <p className="mt-1 text-xs text-slate-500">{ch.hint}</p>
              </div>
            );
            if (!ch.href) return <div key={ch.id}>{inner}</div>;
            if (ch.external) {
              return (
                <a
                  key={ch.id}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              );
            }
            return (
              <a key={ch.id} href={ch.href}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
