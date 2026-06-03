# Spotter Intelligence Hub — Design System

## Cores (dark-first)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#0A0A0B` | Fundo base |
| `--bg-secondary` | `#111113` | Cards, secções |
| `--bg-elevated` | `#1A1A1F` | Hover, modals |
| `--accent-primary` | `#6366F1` | CTA, links, glow |
| `--tier-s` | `#F59E0B` | S-Tier |
| `--tier-a` | `#10B981` | A-Tier |

## Tipografia

- **Display:** Instrument Sans (`--font-instrument`)
- **Body:** Inter (`--font-inter`)
- **Mono:** JetBrains Mono (`--font-mono-jb`)

## Componentes

Ver implementação em `src/components/ui/`:

- `Button` — variantes `primary`, `secondary`, `ghost`
- `SectionLabel` — labels de secção em indigo uppercase
- Cards — `bg-zinc-900/50 border border-white/[0.06] rounded-xl`

## Animações

- Framer Motion com `prefers-reduced-motion` via `useReducedMotion`
- Proibido: bounce, shake, flash, loops > 1s decorativos
