# Layout Consistency Report — Limiar FASE 8.3

## Contrato de shell (após auditoria)

| Tipo de página | max-width | padding horizontal | padding vertical |
|----------------|-----------|--------------------|------------------|
| Marketing / listagens | `max-w-6xl` | `px-4 sm:px-6` | `py-8`–`py-10` |
| Comparador (tabela larga) | `max-w-7xl` | `px-4 sm:px-6` | `py-8 sm:py-10` |
| Leitura (timeline, listas, notificações) | `max-w-3xl` | `px-4` | `py-8` |
| Auth (entrar, perfil, prefs) | `max-w-lg` / `max-w-md` | `px-4` | variável |
| Homepage hero | `max-w-6xl` | `px-4 sm:px-6` | `pt-14 sm:pt-20` |

Header e footer: sempre `max-w-6xl px-4 sm:px-6`.

---

## Inconsistências encontradas

### Corrigidas
1. **Comparador** desalinhado (`90rem` / `px-3`) → `max-w-7xl` / `px-4`
2. **Footer** keys por label → `href` (duplicado “Catálogo”)
3. **Nav** dois “Catálogo” → Catálogo + Explorar
4. Superfícies `bg-[#FAFAFA]` → `bg-slate-50` (alinhado a `--bg-primary` / slate-50)
5. Secções home com fundo off-token → slate-50

### Aceites (intencionais)
- Shells mais estreitos em áreas pessoais / auth
- `pb-28` em carrinho/projeto para sticky CTA mobile
- Homepage densidades de secção (`py-12` vs `py-14`) ligeiramente diferentes entre decisões e cupões — polish 1.1

### Pendentes 1.1
- Extrair `PageShell` / `AppShell` para eliminar copy-paste Header+Footer+main
- Alinhar Suspense fallbacks ao shell real
- Sidebars sticky `top-20` vs header `h-14` (gap ~24px) — padronizar `top-16`

---

## Grids e cards

| Superfície | Antes | Depois |
|------------|-------|--------|
| `Card` default | hover lift global | lift só com `interactive` |
| `OpportunityCard` | Card + FAFAFA | `interactive` + slate-50 |
| Grids home / mercado | alturas mistas via content | sem mudança estrutural (conteúdo dinâmico) |

---

## Header / Footer

| Elemento | Estado |
|----------|--------|
| Sticky header `h-14 z-40` | Mantido |
| Links scrolláveis | Isolados; menus fora do overflow |
| Telegram | Visível a partir de `sm` no header; sempre no footer |
| Footer colunas | 2 → 4 em `sm+`; spacing `gap-10 sm:gap-12` |

---

## Spacing vertical

Padrão recomendado para novas páginas:

```
<header sticky />
<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
  …
</main>
<footer />
```
