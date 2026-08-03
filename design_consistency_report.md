# Design Consistency Report — FASE 7.22

## Problemas encontrados

| Tema | Observação |
|------|------------|
| Cards | Mistura de `rounded-xl` / `rounded-2xl` — mantido por contexto (secção vs card) |
| CTAs Telegram | Classes hand-rolled alinhadas (`bg-sky-700`, `rounded-xl`) em home/produto |
| Loading | Skeletons inconsistentes (`h-40` vs texto “A carregar…”) — uniformizado para pulse nas listas mercado |
| Empty states | Texto `text-sm text-slate-500` padronizado nas listas |
| Badges/chips | Sem alteração estrutural (já via componentes partilhados) |

## Alterações realizadas

- Skeletons de loading nas listas Mercado
- Empty states explícitos (marcas/lojas/famílias)
- Remoção de UI legado que competia visualmente com a home v2
- Uma secção Mercado na homepage (sem Stats duplicado)

## Tokens de facto (sem novo design system)

- Radius cards: `rounded-xl` / secções `rounded-2xl`
- Border: `border-slate-200`
- Primary text CTA: `text-sky-700` / fill `bg-sky-700`
- Font display: `font-display` (Space Grotesk)

## Impacto esperado

Home e Mercado mais coerentes; menos “fantasmas” de UI antiga; loading previsível.
