# Responsive Report — Lymiar FASE 8.3

Breakpoints Tailwind usados: `sm` 640 · `md` 768 · `lg` 1024.

---

## Matriz por viewport

| Área | Desktop (≥1024) | Laptop (≥768) | Tablet (≥640) | Mobile (<640) |
|------|-----------------|---------------|---------------|---------------|
| Header links L1 | Cat. + Explorar + 3 cats | cats md+ | scroll horizontal links | links + Entrar; Telegram no footer |
| Hero search | max-w-2xl | OK | full width | OK; sem overflow |
| Homepage cards | 3 cols tip. | 2–3 | 1–2 | 1; CTAs stacked |
| Comparador | tabela larga max-w-7xl | scroll-x se preciso | scroll-x | scroll-x + print hide chrome |
| Carrinho / Projeto | CTA inline | inline | sticky bottom bar | sticky `z-[45]` + snackbar `bottom-20` |
| Mercado / Catálogo | sidebar + grid | sidebar collapse | drawer filtros | drawer |
| Auth / Entrar | card centrado | OK | OK | full width padding |

---

## Problemas verificados

### Corrigidos nesta fase
- **Overflow header:** menus de conta/notificações cortados no mobile/laptop estreito → resolvido (overflow só nos links)
- **Snackbar sobre sticky CTA** no carrinho/projeto mobile → offset `bottom-20`
- **Telegram** a competir por largura no nav xs → `hidden sm:inline-flex`

### Sem regressão observada (código + smoke Pages)
- Sem overflow horizontal na homepage / search / categorias
- Imagens produto: `object-contain` nos cards
- Botões primários: `min-h-11` / `h-11` nos CTAs principais
- Breadcrumbs / search strips: `px-4 sm:px-6`

### Riscos residuais
| Item | Risco | Notas |
|------|-------|-------|
| Tabela comparador | scroll horizontal em mobile | esperado; não esconder colunas sem redesign |
| Histórico (chart) | compressão em xs | Recharts adapta; labels densas em ecrãs muito estreitos |
| `/p/[slug]/` direct URL | 404 se slug não estático | usar `/p/?id=` (já é o padrão runtime) |
| Mega menu | N/A | Lymiar não tem mega-menu; só links L1 |

---

## Touch targets

| Controlo | Alvo |
|----------|------|
| Button default | `min-h-11` |
| Header Entrar / Telegram | `py-1.5` + padding ≥ 44px altura aproximada |
| UserMenu items | `min-h-11` (corrigido) |
| NotificationBell / Avatar | `h-9 w-9` — aceitável para ícone; área clicável 36px (melhoria 1.1 → 44px) |

---

## Recomendações 1.1

1. Avatar/bell → `h-10 w-10` ou hit-area expandida
2. Menu mobile hamburger se L1 crescer
3. Comparador: vista “cards empilhadas” em `<md` em vez de só scroll-x
4. Testes Playwright viewport 375 / 768 / 1280 no CI
