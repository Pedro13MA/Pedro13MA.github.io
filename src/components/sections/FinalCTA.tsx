import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/FadeIn";
import { TELEGRAM_CHANNEL, TELEGRAM_BOT } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <div className="relative rounded-3xl border border-white/[0.08] p-10 md:p-16 text-center overflow-hidden gradient-mesh">
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em] max-w-2xl mx-auto">
              Pronto para deixar o Spotter encontrar os teus próximos deals?
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
              Junta-te ao canal. Cria alertas. Poupa tempo e dinheiro — sem spam, sem ruído.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button href={TELEGRAM_CHANNEL} external className="text-base px-8 py-4">
                Entrar no @spotter_deals
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button href={TELEGRAM_BOT} external variant="secondary" className="text-base px-8 py-4">
                Criar alerta personalizado
              </Button>
            </div>
            <PhoneNotification />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function PhoneNotification() {
  return (
    <div className="mt-12 mx-auto max-w-xs opacity-90" aria-hidden="true">
      <div className="rounded-[2rem] border-4 border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
        <div className="rounded-2xl bg-zinc-900 p-4 text-left">
          <p className="text-xs text-zinc-500">Telegram</p>
          <p className="text-sm text-white font-medium mt-1">Novo deal S-TIER</p>
          <p className="text-xs text-indigo-400 mt-0.5">Spotter · há 2 min</p>
        </div>
      </div>
    </div>
  );
}
