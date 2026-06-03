"use client";

import { useRef, useState, useEffect } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";

const features = [
  {
    title: "Histórico real de preços",
    text: "z-score estatístico cross-store. Sabemos se o preço é genuinamente baixo ou marketing enganoso.",
  },
  {
    title: "Anti-spam por design",
    text: "Deteção de falsas promoções, preços simbólicos e descontos impossíveis. Se falha num gate, não publica.",
  },
  {
    title: "Alertas personalizados",
    text: "/alertar RTX 5070 e recebes DM quando aparecer. O teu deal, no teu timing.",
  },
  {
    title: "Autonomia total",
    text: "Corre semanas numa VPS de €4/mês. Sem equipa, sem horários, sem falhas humanas.",
  },
  {
    title: "Decisões explicáveis",
    text: "Cada publish ou skip gera registo auditável. Transparência total, zero caixa negra.",
  },
  {
    title: "Compliance first",
    text: "Apenas feeds oficiais de afiliados UE/PT. Sem scraping, sem riscos legais.",
  },
];

export function Features() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>PORQUÊ SPOTTER</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Construído diferente. Com razão.
          </h2>
        </FadeIn>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <FeatureCard title={f.title} text={f.text} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  const ref = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setSpot({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  return (
    <article
      ref={ref}
      className="relative bg-zinc-900/50 border border-white/[0.06] rounded-xl p-6 overflow-hidden hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 h-full"
      style={{
        backgroundImage: `radial-gradient(400px circle at ${spot.x}% ${spot.y}%, rgba(99,102,241,0.08), transparent 60%)`,
      }}
    >
      <h3 className="font-display font-semibold text-white">{title}</h3>
      <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{text}</p>
    </article>
  );
}
