# Frontend Visual Audit — Limiar FASE 8.3

**Âmbito:** UI/UX only · zero alterações a APIs, ranking, search, auth, sync, notificações ou motores  
**Data:** 2026-08-04  
**Testes:** Vitest **138** verdes após correcções

---

## Sumário

Auditoria visual completa ao frontend estático (GitHub Pages). Foram corrigidos bugs de layout/clipping e inconsistências de design system; ficam documentadas dívidas não bloqueantes para 1.1.

| Severidade | Achados | Corrigidos nesta fase |
|------------|---------|----------------------|
| P0 (quebra UX) | 3 | 3 |
| P1 (consistência visível) | 7 | 6 |
| P2 (dívida / polish) | 8 | parcial |

---

## Páginas auditadas

| Página | Shell | Notas |
|--------|-------|-------|
| Homepage | max-w-6xl | Hero + decisões OK; Catálogo duplicado no nav (corrigido) |
| Pesquisa | max-w-6xl + SearchBar | Consistente |
| Categorias / categoria | max-w-6xl | Consistente |
| Produto (`/p/?id=` + `/p/[slug]/`) | max-w-6xl | Export estático limita slugs pré-gerados |
| Comparador | max-w-7xl (era 90rem) | Alinhado ao padding do site |
| Carrinho | max-w-6xl + sticky mobile | z + snackbar offset |
| Projetos | max-w-6xl + sticky | idem |
| Favoritos / Alertas | max-w-6xl | OK |
| Timeline / Listas / Notificações | max-w-3xl | Shell de leitura — intencional |
| Mercado / Marcas / Lojas | max-w-6xl | OK |
| Catálogo `/catalogo/` | max-w-6xl | Canónico |
| Explorar `/catalog/` | max-w-6xl | Relabel no nav (antes “Catálogo”) |
| Minha Área | max-w-6xl / guest max-w-lg | OK |
| Perfil / Entrar | max-w-lg / md | Shell auth — intencional |

---

## Achados P0 (corrigidos)

### 1. Header clipava UserMenu e NotificationBell
`overflow-x-auto` no `<nav>` forçava clipping vertical dos dropdowns.  
**Fix:** scroll só na faixa de links; menus + Telegram fora do overflow; `z-50` nos menus.

### 2. Dois links “Catálogo” (header + footer)
`/catalogo/` e `/catalog/` com o mesmo label; footer `key={label}` colidia.  
**Fix:** `/catalog/` → **Explorar**; keys por `href`.

### 3. Snackbar vs sticky bars (carrinho / projeto)
Mesma banda inferior no mobile (`bottom-4` vs `bottom-0`).  
**Fix:** snackbar `bottom-20` em mobile / `bottom-4` em `sm+`; sticky chrome `z-[45]`.

---

## Achados P1 (maioria corrigidos)

| Item | Acção |
|------|--------|
| `bg-[#FAFAFA]` ≠ slate-50 | → `bg-slate-50` |
| Accents violet off-brand | → sky |
| Card hover lift em blocos estáticos | prop `interactive` opt-in |
| Button `secondary` ≈ `outline` | unificados; novo `accent` (sky-700) |
| Comparador `max-w-[90rem] px-3` | → `max-w-7xl px-4` |
| Escala z-index ad-hoc | documentada em `globals.css` (`--z-*`) |
| Dual token layers (`@theme` + `:root`) | documentados; preferir slate/sky Tailwind |

---

## Achados P2 (adiados / 1.1)

- Extrair Modal/Drawer/Tooltip partilhados (hoje hand-rolled)
- Unificar chips Watch / Compare / Cart / Project num único action-button
- Suspense fallbacks sem header/footer (flash de chrome)
- Portal nos dropdowns do header (mitigado; portal seria ideal)
- AppShell partilhado para eliminar composição repetida Header+Footer
- Consolidar `/catalog/` vs `/catalogo/` num único produto de navegação (produto, não só label)

---

## Acessibilidade (amostra)

| Check | Estado |
|-------|--------|
| Focus ring botões (`sky-500/40`) | OK |
| Targets menu conta ≥ 44px (`min-h-11`) | Corrigido |
| Contraste slate/sky tema claro | OK (sem regressão RC1) |
| Aria menus (expanded / haspopup) | Presente |
| Telegram hidden em xs no header | Evita overflow; footer mantém link |

---

## Performance CSS

- Sem remoção agressiva de CSS morto (risco em Tailwind purge)
- Eliminado hex ad-hoc FAFAFA / violet
- Hero: inline gradient → utilitário Tailwind

---

## Ficheiros tocados (UI only)

- `src/components/layout/SiteHeader.tsx`
- `src/components/auth/UserMenu.tsx`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/user-space/Snackbar.tsx`
- `src/components/ui/card.tsx`, `button.tsx`
- `src/components/product/ComparePageClient.tsx`, `OpportunityCard.tsx`, `StoreOfferCard.tsx`, …
- `src/components/smart-cart/CartPageClient.tsx`
- `src/components/projects/ProjectDetailClient.tsx`, `AddToProjectButton.tsx`
- `src/components/home/v2/HomeHero.tsx` (+ FAFAFA → slate-50 em home/product)
- `src/app/globals.css`

---

## Critério de sucesso

Frontend parece **um único produto** slate/sky; overlays do header deixam de ser cortados; nav sem labels duplicados; testes existentes verdes. Sem mudanças de comportamento de negócio.
