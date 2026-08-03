# Performance Audit — FASE 7.22

## Problemas encontrados

| Problema | Nota |
|----------|------|
| Componentes mortos no tree | Aumentavam ruído de manutenção (e risco de reimport acidental) |
| `HomePopular` dynamic import sem uso | Chunk desnecessário no `HomePageClient` |
| `HomeStats` + `HomeMarket` | Dupla secção sobre o mesmo payload |
| Discovery sem catch | Estado loading persistente (custo UX, não CPU) |

## Alterações realizadas

- Remoção de código morto (home legado, shells produto)
- Remoção do dynamic import `HomePopular` e da secção Stats duplicada
- Lazy sections da homepage mantidas (`next/dynamic`, `ssr: false`)

## Não medido nesta fase

Lighthouse / CLS / LCP / INP em staging — recomendar corrida pós-deploy.

## Impacto esperado

Bundle conceptualmente mais limpo; menos trabalho de render na home (uma secção de mercado em vez de duas); menos estados pendurados.
