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
    <section id="alertas" className="scroll-mt-16 border-t border-slate-200/60 bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Alertas no teu ritmo
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Além do canal Telegram, em breve podes definir um preço-alvo na página do produto
            e receber aviso quando o Limiar observar esse valor.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
          {CHANNELS.map((ch) => {
            const inner = (
              <div
                className={`flex h-full flex-col items-center rounded-2xl border px-4 py-6 text-center transition-all duration-200 ${
                  ch.href
                    ? "border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
                    : "border-dashed border-slate-200 bg-white/70 opacity-70"
                }`}
              >
                <p className="font-display text-base font-semibold text-slate-900">{ch.label}</p>
                <p className="mt-1.5 text-xs text-slate-500">{ch.hint}</p>
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
