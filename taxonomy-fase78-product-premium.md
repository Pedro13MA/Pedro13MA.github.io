# FASE 7.8 — Página de Produto Premium (UX + Comparação + Conteúdo)

**Experiência de decisão de compra.** Ranking, classificação, pesquisa, histórico, ofertas, Telegram, Scheduler, resolver_v2 e comportamento de preços **inalterados**.

API: apenas campos **opcionais aditivos** no detalhe (`typed_attributes`, `imageUrls`) — passthrough do catálogo.

## Arquitetura

```text
ProductPageClient
  ├─ ProductBreadcrumb (Início › taxonomy › chip › marca)
  ├─ ProductHero
  │    ├─ ProductGallery + ProductImageLightbox
  │    └─ favorito / alerta / VS Comparar / partilhar
  ├─ ProductKpis
  ├─ DecisionCard (existente)
  ├─ ProductDescription (auto, sem inventar specs)
  ├─ ProductSpecs (typed_attributes + chipset/vram)
  ├─ StoreCompareTable (loja, preço, estado, entrega, cupão, score)
  ├─ PriceHistoryChart (30d / 90d / 1a / Tudo + eventos)
  ├─ ProductShareActions (copiar, partilhar, QR, PDF via print)
  ├─ ProductFaq
  ├─ RelatedProductsSection (variantes reais + semelhantes)
  └─ CompareDrawer → /comparar (até 4, localStorage)
```

## Backend (aditivo mínimo)

| Campo | Origem |
| --- | --- |
| `typed_attributes` | coluna catálogo (JSON) |
| `imageUrls` | URLs únicas `image_url` das ofertas |

Sem alteração a ranking, SQL de pesquisa, dual-write, classificação.

## Frontend — novos ficheiros

| Ficheiro | Função |
| --- | --- |
| `ProductHero.tsx` | Hero completo |
| `ProductGallery.tsx` / `ProductImageLightbox.tsx` | Galeria + zoom + teclado/swipe |
| `ProductDescription.tsx` / `ProductSpecs.tsx` / `ProductFaq.tsx` | Conteúdo |
| `ProductKpis.tsx` | Cartões KPI |
| `ProductShareActions.tsx` | Partilha + PDF |
| `CompareDrawer.tsx` / `ComparePageClient.tsx` / `/comparar` | VS |
| `lib/product-content.ts` / `compare.ts` / `product-breadcrumb-premium.ts` | Helpers |

## Comparação VS

- localStorage `lymiar.compare.v1`, máx. 4
- Drawer lateral; com ≥2 produtos → `/comparar/`
- Tabela: preço, score, marca, lojas, mín. histórico, specs tipadas

## Critérios

- [x] Hero profissional (imagem, marca, leaf, preço, score, loja, estado, acções)
- [x] Lightbox + zoom + ←→ ESC + swipe
- [x] Descrição / specs / FAQ só com dados existentes
- [x] KPIs
- [x] Semelhantes relevantes; variantes só se existirem
- [x] Comparação até 4
- [x] PDF (print-to-PDF)
- [x] Breadcrumb Início
- [x] Responsivo
- [x] Zero regressões no motor Lymiar

## Performance

- Mesmas chamadas: `getProductBySlug`, `fetchProductMetrics`, `searchProducts` (variantes)
- Galeria lazy nas miniaturas
- Compare carrega detalhes só em `/comparar`

## Testes

- `product-content.test.ts` — specs, FAQ, descrição, imagens
- `compare.test.ts` — limite 4 / remove
- Suite Vitest existente mantém-se
