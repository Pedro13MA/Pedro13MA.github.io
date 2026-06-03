"use client";

import { ArrowRight } from "lucide-react";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

export function MobileStickyCTA() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0A0A0B]/90 backdrop-blur-lg border-t border-white/[0.06] safe-area-pb">
      <a
        href={TELEGRAM_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3.5 rounded-full min-h-[44px] transition-all"
      >
        Entrar no Telegram
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
