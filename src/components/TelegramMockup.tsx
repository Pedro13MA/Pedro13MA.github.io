import { cn } from "@/lib/utils";

export type MockupTheme = "premium" | "minimal" | "urgency";

type Props = {
  theme?: MockupTheme;
  className?: string;
  compact?: boolean;
};

const themes: Record<
  MockupTheme,
  { badge: string; title: string; price: string; store: string; note: string }
> = {
  premium: {
    badge: "HIGH VALUE",
    title: "PlayStation 5 Pro Console 2TB",
    price: "549€ | -42% OFF",
    store: "Amazon",
    note: "Preço raro nesta categoria — investimento inteligente",
  },
  minimal: {
    badge: "DEAL",
    title: "SSD NVMe 2TB PCIe 4.0",
    price: "89€ | -35%",
    store: "PCComponentes",
    note: "Queda confirmada vs. histórico 90 dias",
  },
  urgency: {
    badge: "STOCK LIMITADO",
    title: "NVIDIA RTX 5070 Founders",
    price: "629€ | MSRP match",
    store: "Amazon",
    note: "Lançamento — disponibilidade limitada",
  },
};

export function TelegramMockup({ theme = "premium", className, compact }: Props) {
  const t = themes[theme];

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#17212b] shadow-2xl shadow-black/50",
        compact ? "p-4 text-sm" : "p-5",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
          S
        </div>
        <div>
          <p className="text-white text-sm font-medium">Spotter Deals</p>
          <p className="text-zinc-500 text-xs">@spotter_deals</p>
        </div>
      </div>
      <div className="space-y-2 font-sans text-[15px] leading-relaxed">
        <p className="text-indigo-300 text-xs font-medium tracking-wide">
          {theme === "premium" ? "💎" : theme === "minimal" ? "✓" : "⚡"} {t.badge}
        </p>
        <p className="text-white font-medium">{t.title}</p>
        <p className="text-emerald-400 font-mono text-sm">{t.price}</p>
        <p className="text-zinc-400 text-sm">🏷 {t.store}</p>
        <p className="text-zinc-500 text-sm border-l-2 border-indigo-500/40 pl-3">
          {t.note}
        </p>
        <p className="text-indigo-400 text-sm pt-1">👉 Comprar agora</p>
      </div>
      {theme === "premium" && !compact && (
        <div className="mt-4 flex items-center justify-between">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono tier-s-shimmer">
            S-TIER · Score 91
          </span>
          <MiniPriceChart />
        </div>
      )}
    </div>
  );
}

function MiniPriceChart() {
  return (
    <svg width="80" height="36" viewBox="0 0 80 36" aria-hidden="true" className="text-indigo-400/60">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        points="0,28 20,24 40,18 60,12 80,8"
      />
      <circle cx="80" cy="8" r="3" fill="#6366f1" />
    </svg>
  );
}
