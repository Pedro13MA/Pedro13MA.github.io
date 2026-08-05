# FASE P3 — Bloco 3 — Página de Produto (PDP)

**Repo:** `Pedro13MA.github.io` (frontend only)  
**Data:** 2026-08-05  
**Flag:** `NEXT_PUBLIC_P34_PRODUCT_PAGE` → `P34_PRODUCT_PAGE` (OFF por defeito)

## Objectivo

Melhorar organização, hierarquia, espaçamento, empty states e a11y da PDP **sem redesign**. Identidade Lymiar preservada. Preparar placeholders para Bloco 5.

## Princípio

- Flag **OFF** → layout actual (árvore JSX legado intacta em `ProductPageClient`).  
- Flag **ON** → `ProductPageP34` (mesmos dados, melhor estrutura).

## O que NÃO foi alterado

- Backend / API / BD / taxonomia / regras / classificação  
- Pesquisa / mega-menu / typeahead  
- URLs (`/p/{slug}/`, `/p/?id=`)  
- SEO (`generateMetadata`, `ProductJsonLd`)  
- Interior do `PriceHistoryChart`  
- CTA **Comprar** e tabela de lojas (dados iguais)  
- Separação preço ≠ cupões

## Hierarquia P34 (ON)

1. `BreadcrumbNav` (Início › Categoria › Subcategoria › Produto)  
2. `ProductHero` (marca, título, preço, loja, Comprar, favorito/carrinho/alerta)  
3. Placeholders **Comparar** / **Criar alerta** (disabled)  
4. Veredicto  
5. Confiança dos dados  
6. Histórico (heading + hint + gráfico intacto)  
7. Cupões e campanhas (secção própria + empty)  
8. Onde comprar (tabela ou empty)  
9. Telegram  
10. Produtos semelhantes (dados actuais ou placeholder Bloco 5)  
11. Também pode interessar (placeholder Bloco 5)

## Componentes criados

| Componente | Path |
|------------|------|
| ProductPageP34 | `src/components/product/p34/ProductPageP34.tsx` |
| ProductPdpSkeleton | `…/ProductPdpSkeleton.tsx` |
| ProductActionPlaceholders | `…/ProductActionPlaceholders.tsx` |
| ProductTelegramStrip | (mesmo ficheiro) |
| ProductSimilarSection | `…/ProductDiscoveryPlaceholders.tsx` |
| ProductRelatedInterestSection | (mesmo) |
| ProductCouponsSection | `…/ProductCouponsSection.tsx` |
| ProductStoresEmpty / ProductHistoryHint | (mesmo) |
| Flag | `src/lib/product/flags.ts` |

## Ficheiros alterados

- `src/components/product/ProductPageClient.tsx` — branch flag + skeleton

## Activar

```bash
NEXT_PUBLIC_P34_PRODUCT_PAGE=true
```

## Testes

```bash
npm test -- src/lib/product src/components/product/p34
```

## Rollback

`NEXT_PUBLIC_P34_PRODUCT_PAGE=false` (ou ausente) + rebuild. Zero migrações.

## Preparação Bloco 5

- `#semelhantes` e `#tambem-interessar` prontos para dados de recomendações  
- Botões Comparar / Criar alerta disabled com ARIA  

## Bloco 4

Não iniciado.
