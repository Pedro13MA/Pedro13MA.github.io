# FASE 7.11 — Comparador Premium (VS)

**Comparação profissional até 4 produtos.** Só UX — motor Lymiar, pesquisa, ranking, taxonomy, preços, histórico, Scheduler e Telegram **inalterados**.

## Funcionalidades

| Feature | Detalhe |
| --- | --- |
| `/comparar` + `?ids=` | Deep-link partilhável; reconstrói lista |
| Tabela por grupos | Preço · Decisão · Histórico · Specs (`typed_attributes`) |
| Destaque | Só o melhor em verde (nunca vermelho) |
| Badges | Melhor preço / score / histórico / lojas / oportunidade / recente |
| Diferenças | Toggle «Mostrar apenas diferenças» |
| Ordenação | Preço, Score, Histórico, Marca, Categoria |
| Adicionar | Pesquisa inline sem reload |
| Cards | «VS» / Adicionar ao comparador (pesquisa + categorias) |
| Drawer | Contagem N/4 + link com ids |
| Export | PDF (print), Imprimir, WhatsApp, Telegram, Email |
| Categorias mistas | Aviso elegante, comparação permitida |
| Mobile | Scroll horizontal, sticky header, 1ª coluna fixa |

## Arquitectura

```text
compare.ts          — localStorage + deep-link helpers
compare-engine.ts   — rows, badges, diffs, sort (só dados reais)
ComparePageClient   — UI premium
CompareAddSearch    — pesquisa para adicionar
CompareAddButton    — cards / categorias
```

Cache em memória por slug evita requests repetidos ao reordenar.

## Critérios

- [x] Até 4 produtos
- [x] Destaque automático
- [x] Grupos + specs por leaf
- [x] Só diferenças
- [x] Deep-link
- [x] PDF / partilha
- [x] Desktop + mobile
- [x] Sem dados inventados
- [x] Zero alterações motor / pesquisa / ranking / taxonomy
- [x] Testes a passar
