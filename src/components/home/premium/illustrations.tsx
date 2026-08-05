/** Ilustrações SVG — homepage light SaaS (sem stock photos). */

import type { ReactNode } from "react";

const blue = "#2563EB";
const green = "#16A34A";
const amber = "#F59E0B";
const purple = "#7C3AED";
const slate = "#94A3B8";
const line = "#E2E8F0";
const soft = "#F8FAFC";

type SvgProps = { className?: string; title?: string };

export function ChartHistoryArt({ className, title = "Histórico" }: SvgProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="320" height="200" rx="16" fill={soft} />
      <path
        d="M36 150 C70 140 90 100 130 110 C170 120 190 70 230 80 C250 85 270 120 286 128"
        stroke={blue}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="286" cy="128" r="5" fill={green} />
      <text x="24" y="32" fill={slate} fontSize="12" fontFamily="system-ui">
        Preço no tempo
      </text>
    </svg>
  );
}

export function AiDashboardArt({ className, title = "Análise" }: SvgProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="320" height="200" rx="16" fill={soft} />
      <rect x="24" y="40" width="88" height="56" rx="10" fill="#fff" stroke={line} />
      <rect x="124" y="40" width="88" height="56" rx="10" fill="#fff" stroke={line} />
      <rect x="224" y="40" width="72" height="56" rx="10" fill="#fff" stroke={line} />
      <rect x="24" y="112" width="272" height="64" rx="10" fill="#fff" stroke={line} />
      <path d="M44 152 H120 M44 140 H200" stroke={purple} strokeWidth="3" strokeLinecap="round" />
      <circle cx="260" cy="68" r="10" fill={purple} opacity="0.85" />
    </svg>
  );
}

export function TimelineArt({ className, title = "Timeline" }: SvgProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="320" height="200" rx="16" fill={soft} />
      <line x1="40" y1="100" x2="280" y2="100" stroke={line} strokeWidth="2" />
      {[60, 120, 180, 240].map((x, i) => (
        <circle key={x} cx={x} cy="100" r={i === 3 ? 8 : 6} fill={i === 3 ? blue : slate} />
      ))}
    </svg>
  );
}

export function CouponsArt({ className, title = "Cupões" }: SvgProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="320" height="200" rx="16" fill={soft} />
      <rect x="60" y="56" width="200" height="88" rx="12" fill="#fff" stroke={line} />
      <path d="M60 100 H260" stroke={line} strokeDasharray="6 6" />
      <text x="84" y="88" fill={blue} fontSize="14" fontFamily="ui-monospace,monospace">
        CODE-2026
      </text>
      <text x="84" y="128" fill={slate} fontSize="11" fontFamily="system-ui">
        Separado do preço
      </text>
    </svg>
  );
}

export function AlertsArt({ className, title = "Alertas" }: SvgProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="320" height="200" rx="16" fill={soft} />
      <path
        d="M160 48 C148 48 138 58 138 72 V100 L120 124 H200 L182 100 V72 C182 58 172 48 160 48 Z"
        stroke={amber}
        strokeWidth="2.5"
        fill="#fff"
      />
      <circle cx="160" cy="148" r="6" fill={amber} />
    </svg>
  );
}

export function CompareArt({ className, title = "Comparação" }: SvgProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="320" height="200" rx="16" fill={soft} />
      <rect x="40" y="48" width="100" height="120" rx="12" fill="#fff" stroke={line} />
      <rect x="180" y="48" width="100" height="120" rx="12" fill="#fff" stroke={blue} />
      <text x="230" y="112" textAnchor="middle" fill={blue} fontSize="18" fontFamily="system-ui">
        vs
      </text>
    </svg>
  );
}

export function MethodFlowArt({ className, title = "Decisão" }: SvgProps) {
  const steps = ["Preço", "Histórico", "Promo", "Cupão", "Índice", "Decisão"];
  return (
    <svg viewBox="0 0 720 100" className={className} role="img" aria-label={title} fill="none">
      {steps.map((label, i) => {
        const x = 40 + i * 115;
        return (
          <g key={label}>
            <circle
              cx={x}
              cy="40"
              r="18"
              fill={i === 5 ? blue : "#fff"}
              stroke={i === 5 ? blue : line}
            />
            <text
              x={x}
              y="44"
              textAnchor="middle"
              fill={i === 5 ? "#fff" : slate}
              fontSize="11"
              fontFamily="system-ui"
            >
              {i + 1}
            </text>
            <text
              x={x}
              y="78"
              textAnchor="middle"
              fill="#64748B"
              fontSize="11"
              fontFamily="system-ui"
            >
              {label}
            </text>
            {i < steps.length - 1 ? (
              <path d={`M${x + 24} 40 H${x + 90}`} stroke={line} strokeWidth="2" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function MiniSparkline({
  min,
  avg,
  current,
  max,
  className,
  tone = "blue",
}: {
  min: number;
  avg: number;
  current: number;
  max: number;
  className?: string;
  tone?: "blue" | "green" | "amber";
}) {
  const color = tone === "green" ? green : tone === "amber" ? amber : blue;
  const lo = Math.min(min, avg, current, max);
  const hi = Math.max(min, avg, current, max);
  const span = hi - lo || 1;
  const y = (v: number) => 28 - ((v - lo) / span) * 20;
  const pts = [
    [4, y(max * 0.9 + lo * 0.1)],
    [18, y(avg)],
    [32, y(min * 0.35 + avg * 0.65)],
    [46, y(current)],
  ];
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  return (
    <svg viewBox="0 0 50 32" className={className} aria-hidden fill="none">
      <path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[3][0]} cy={pts[3][1]} r="2.2" fill={color} />
    </svg>
  );
}

function frame(children: ReactNode, label: string, className?: string) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={label}
      fill="none"
    >
      <rect width="120" height="120" rx="20" fill={soft} />
      {children}
    </svg>
  );
}

export function CatGamingIcon({ className }: SvgProps) {
  return frame(
    <>
      <path
        d="M28 72 L40 48 H80 L92 72 H76 L70 84 H50 L44 72 Z"
        stroke={blue}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="64" r="3" fill={blue} />
    </>,
    "Gaming",
    className,
  );
}

export function CatCasaIcon({ className }: SvgProps) {
  return frame(
    <>
      <rect x="36" y="44" width="48" height="40" rx="4" stroke={blue} strokeWidth="2" />
      <path d="M48 84 V68 H72 V84" stroke={slate} strokeWidth="2" />
    </>,
    "Casa",
    className,
  );
}

export function CatPhoneIcon({ className }: SvgProps) {
  return frame(
    <>
      <rect x="44" y="28" width="32" height="64" rx="6" stroke={blue} strokeWidth="2" />
      <circle cx="60" cy="82" r="2.5" fill={blue} />
    </>,
    "Telemóveis",
    className,
  );
}

export function CatLaptopIcon({ className }: SvgProps) {
  return frame(
    <>
      <rect x="28" y="36" width="64" height="40" rx="4" stroke={blue} strokeWidth="2" />
      <path d="M22 80 H98" stroke={slate} strokeWidth="2" strokeLinecap="round" />
    </>,
    "Informática",
    className,
  );
}

export function CatTvIcon({ className }: SvgProps) {
  return frame(
    <>
      <rect x="24" y="36" width="72" height="44" rx="4" stroke={blue} strokeWidth="2" />
      <path d="M48 80 L60 92 L72 80" stroke={slate} strokeWidth="2" />
    </>,
    "TV e Áudio",
    className,
  );
}

export function CatPhotoIcon({ className }: SvgProps) {
  return frame(
    <>
      <rect x="30" y="40" width="60" height="44" rx="6" stroke={blue} strokeWidth="2" />
      <circle cx="60" cy="62" r="12" stroke={slate} strokeWidth="2" />
      <circle cx="60" cy="62" r="5" fill={blue} />
    </>,
    "Fotografia",
    className,
  );
}

/** Compat: DiffIcon used previously — map to simple marks */
export function DiffIcon({
  variant,
  className,
}: {
  variant: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colors = [blue, green, amber, purple, blue, slate];
  const c = colors[variant - 1];
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="16" fill={soft} stroke={line} />
      <circle cx="20" cy="20" r="5" fill={c} />
    </svg>
  );
}

export function TelegramArt({ className, title = "Telegram" }: SvgProps) {
  return (
    <svg viewBox="0 0 280 200" className={className} role="img" aria-label={title} fill="none">
      <rect width="280" height="200" rx="20" fill={soft} />
      <rect x="40" y="36" width="200" height="128" rx="16" fill="#fff" stroke={line} />
      <path d="M72 88 L120 108 L72 128 Z" fill={blue} />
      <rect x="140" y="78" width="72" height="8" rx="4" fill={line} />
      <rect x="140" y="96" width="56" height="8" rx="4" fill={line} />
      <rect x="140" y="114" width="64" height="8" rx="4" fill={blue} opacity="0.35" />
    </svg>
  );
}

export function HeroIntelligenceArt({ className, title = "Inteligência" }: SvgProps) {
  return <ChartHistoryArt className={className} title={title} />;
}

export function MethodFlowArtLegacy(props: SvgProps) {
  return <MethodFlowArt {...props} />;
}
