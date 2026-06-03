import {
  Gamepad2,
  Cpu,
  Mouse,
  Smartphone,
  Home,
  Disc,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeIn } from "@/components/motion/FadeIn";

const categories = [
  { label: "TECH & GAMING", icon: Gamepad2, example: "PS5 Pro · RTX série 50" },
  { label: "COMPONENTES PC", icon: Cpu, example: "Ryzen 9 · placas B850" },
  { label: "PERIFÉRICOS", icon: Mouse, example: "Teclados mecânicos · ratos" },
  { label: "MOBILE", icon: Smartphone, example: "Pixel · Galaxy · iPhone" },
  { label: "CASA & ELETRO", icon: Home, example: "Robots aspiradores · IoT" },
  { label: "JOGOS & SOFTWARE", icon: Disc, example: "Steam keys · subscrições" },
  { label: "QUEDAS DE PREÇO", icon: TrendingDown, example: "Alertas de queda histórica" },
  { label: "SUPER OFERTAS", icon: Sparkles, example: "S-Tier exclusivos" },
];

export function Categories() {
  return (
    <section id="categorias" className="py-24 md:py-32 bg-[#111113]/50">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <FadeIn>
          <SectionLabel>COBERTURA</SectionLabel>
          <h2 className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white tracking-[-0.02em]">
            Tech, gaming, casa — tudo num só sítio.
          </h2>
        </FadeIn>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <FadeIn key={c.label} delay={(i % 4) * 0.05}>
              <article className="group bg-zinc-900/50 border border-white/[0.06] rounded-xl p-5 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 h-full">
                <c.icon className="w-6 h-6 text-indigo-400/80 mb-3" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wide text-white">{c.label}</h3>
                <p className="mt-2 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {c.example}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
