# Overlay Audit — Limiar FASE 8.3

## Escala z-index (canónica)

Definida em `src/app/globals.css` como variáveis `--z-*`:

| Camada | z | Uso |
|--------|---|-----|
| Header sticky | 40 (`--z-header`) | `SiteHeader` |
| Sticky chrome (CTA mobile) | 45 (`--z-sticky-chrome`) | Carrinho, Projeto |
| Dropdown / search | 50 (`--z-dropdown`) | UserMenu, NotificationBell, SearchBar |
| Drawer médio | 60–70 (`--z-drawer`) | CompareDrawer (~70), catalog filters |
| Modal | 75–80 (`--z-modal`) | AlertRuleModal, wizards, lightbox |
| Toast / snackbar | 90 (`--z-toast`) | `Snackbar` (portal) |

---

## Inventário

| Overlay | Tipo | Portal? | z | Clip risk | Estado |
|---------|------|---------|---|-----------|--------|
| UserMenu | dropdown absolute | Não | 50 | Mitigado (fora overflow nav) | OK |
| NotificationBell | dropdown absolute | Não | 50 | Mitigado | OK |
| SearchBar suggest | dropdown absolute | Não | 50 | OK em hero `overflow-visible` | OK |
| Snackbar | toast | **Sim** | 90 | Offset mobile `bottom-20` | OK |
| CompareDrawer | drawer fixed | Não | ~70 | — | OK |
| FavoritesListsDrawer | drawer | Não | ~75 | — | OK |
| AlertRuleModal | modal | Não | ~75 | — | OK |
| ProductNotifyModal | modal | Não | ~50 | Pode ficar sob drawers | Aceite; 1.1 → 80 |
| CouponCard modal | modal | Não | ~50 | idem | 1.1 |
| Catalog mobile drawer | drawer | Não | ~50 | — | OK |
| Project wizard / lightbox | modal | Não | ~80 | — | OK |
| Sync conflict UI | modal | Não | ~50 | — | 1.1 alinhar |

---

## Regras

1. Dropdowns do header **nunca** dentro de `overflow-x-auto`
2. Toasts acima de sticky chrome; em mobile reservar ~5rem do fundo
3. Modais de confirmação ≥ drawers ≥ dropdowns
4. Preferir `createPortal(..., document.body)` para menus longos / modais (só Snackbar o faz hoje)
5. Não introduzir z novos fora da escala sem actualizar este doc + `globals.css`

---

## Correcções FASE 8.3

- Nav reestruturado → menus deixam de ser cortados
- `z-50` explícito em UserMenu e NotificationBell
- Sticky bars `z-[45]`; snackbar `bottom-20 sm:bottom-4`

---

## Dívida 1.1

- Primários partilhados: `Modal`, `Drawer`, `DropdownMenu` com portal
- Subir ProductNotifyModal / CouponCard / SyncUI para `--z-modal`
- Focus trap + `Esc` + restore focus nos modais hand-rolled
- Evitar `onBlur` + timeout 180ms nos menus (race com clicks) → pointer-down outside pattern
