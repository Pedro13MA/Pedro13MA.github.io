# Design System Report — Limiar FASE 8.3

## Identidade visual

| Token | Valor | Uso |
|-------|-------|-----|
| Fundo página | slate-50 / `#f8fafc` | body, secções muted |
| Superfície | white | cards, header |
| Texto primary | slate-900 | títulos |
| Texto secondary | slate-500 | corpo |
| Acento | sky-700 / `#0284c7` | links, CTAs accent, focus |
| Semáforo buy/fair/wait | emerald / amber / rose | badges decisão |
| Tipografia display | Space Grotesk (`font-display`) | H1–H3 brand |
| Tipografia corpo | Source Sans 3 | UI |
| Mono | JetBrains Mono | dados tabulares pontuais |

**Proibido (após auditoria):** violet/purple ad-hoc, `#FAFAFA` paralelo ao slate-50, gradients purple-indigo.

---

## Primitivos (`src/components/ui/`)

| Componente | Variantes | Notas FASE 8.3 |
|------------|-----------|----------------|
| `Button` | default (slate-900), **accent** (sky-700), secondary, outline(=secondary), ghost, link | `min-h-11`; focus `ring-sky-500/40` |
| `Card` | default estático; **`interactive`** opt-in hover | sem lift em métricas/gráficos |
| `Badge` | default, teal(=sky), buy, fair, wait, tier | “teal” semanticamente sky |
| `Input` | — | manter bordas slate |
| `Table` | — | header `bg-slate-50` |
| `LimiarLogo` | — | brand mark |

**Em falta (1.1):** Modal, Drawer, Dropdown, Tooltip, Skeleton unificado, EmptyState.

---

## Cores semânticas

| Significado | Classe |
|-------------|--------|
| Acção primária destrutiva / commit | `bg-slate-900` (Button default) |
| Acção produto / descoberta | `bg-sky-700` (Button accent ou link CTA) |
| Comprar agora | emerald |
| Preço justo | amber |
| Esperar | rose |
| Info / link | sky-700 |
| Superfície muted | slate-50 |

---

## Sombras, radius, motion

| Token | Padrão |
|-------|--------|
| Radius card | `rounded-2xl` |
| Radius controlo | `rounded-xl` (sm: `rounded-lg`) |
| Shadow card | `0_1px_2px` slate; interactive hover `0_6px_20px` |
| Border | `border-slate-200/70` |
| Transition | `duration-150`–`200` |
| Reduced motion | flame badge + scroll smooth desligados |

---

## Tipografia (escala prática)

| Nível | Classes típicas |
|-------|-----------------|
| Hero H1 | `font-display text-[2.1rem] sm:text-5xl font-bold` |
| Secção H2 | `font-display text-xl`–`text-2xl font-bold` |
| Card title | `font-display text-lg font-semibold` |
| Corpo | `text-sm`–`text-base text-slate-500` |
| Legenda | `text-xs text-slate-400` |
| Link nav | `text-sm text-slate-500 hover:text-slate-900` |

---

## Consistência pós-auditoria

| Antes | Depois |
|-------|--------|
| CTAs mistos slate vs sky sem regra | default = commit; accent = descoberta |
| Card hover em painéis estáticos | só `interactive` |
| Violet em offers / projetos | sky |
| FAFAFA | slate-50 |
| Tokens CSS duplicados sem doc | `--z-*` + comentário; Tailwind slate/sky preferido |

---

## Checklist para novos ecrãs

1. Shell `max-w-6xl px-4 py-8 sm:px-6` (ou tabela em `max-w-7xl`)
2. Cores só slate / sky / semáforo
3. Overlays na escala `--z-*`
4. Botões via `Button` (não raw `bg-sky-700` salvo links blocos)
5. Cards estáticos sem `interactive`
6. Focus visível; targets ≥ 44px em menus
7. Sem violet, sem hex one-off
