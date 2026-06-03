"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TelegramMockup, type MockupTheme } from "@/components/TelegramMockup";
import { EngineDecisionBlock } from "@/components/EngineDecisionBlock";
import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

const tabs: { id: MockupTheme; label: string }[] = [
  { id: "premium", label: "Premium" },
  { id: "minimal", label: "Minimal" },
  { id: "urgency", label: "Urgência" },
];

export function Demo() {
  const [active, setActive] = useState<MockupTheme>("premium");

  return (
    <section className="py-24 md:py-32 bg-[#111113]/50">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>EXPERIMENTA</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Vê o Spotter em acção.
          </h2>
        </FadeIn>

        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-start">
          <FadeIn>
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px]",
                    active === tab.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-zinc-500 border border-transparent hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <TelegramMockup theme={active} />
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-sm text-zinc-500 mb-3 font-mono uppercase tracking-widest">
              ENGINE_DECISION
            </p>
            <EngineDecisionBlock />
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              Cada oportunidade gera uma linha de decisão reconstruível — score, tier, motivo e
              destino de publicação.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
