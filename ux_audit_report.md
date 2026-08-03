# UX Audit Report — FASE 7.22

## Problemas encontrados

| Área | Problema |
|------|----------|
| Homepage | Secções legado não usadas ainda no bundle; Market + Stats duplicavam contagens |
| Homepage | Famílias canónicas mostravam empty state antes do fetch |
| Produto | “Onde comprar” com header vazio sem ofertas |
| Produto | PDF exportava categoria `Other` |
| API map | `category \|\| "Other"` contaminava dados |
| Mercado | Listas sem skeleton de loading |
| Detalhe marca/loja | Título `"…"` durante load |
| Discovery | Fetch sem `.catch` (loading eterno) |
| Código morto | 9+ componentes home/produto sem imports |

## Alterações realizadas

- Eliminados componentes mortos (home + product shells)
- Homepage: removido bloco Stats duplicado; Market inclui % classificados; loading em famílias
- Produto: gate de lojas; PDF usa `displayCategoryLabel`
- `api.ts`: category default `""`
- Marcas/Lojas/Tendências: loading + empty
- Títulos marca/loja: “A carregar” em vez de reticências
- Discovery: tratamento de erro

## Screenshots

Não capturados nesta sessão (staging). Validar visualmente: home, produto sem ofertas, `/mercado/marcas/`, PDF partilha.

## Impacto esperado

Menos confusão, menos empty states falsos, hierarquia homepage mais clara, produto sem secções vazias.
