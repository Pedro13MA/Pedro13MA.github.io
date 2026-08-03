# FASE 7.18 — Marketplace Intelligence

Agregação **factual** do mercado (produtos, marcas, lojas, categorias, rankings, actividade). Sem IA, sem previsões, sem alterar motores existentes.

Lido antes: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, `taxonomy-fase717-discovery.md`.

## Arquitectura

```text
GET /api/v1/mercado*
  → ApiRepository
  → MarketplaceIntelligenceService
       ├─ SQL agregações (COUNT/AVG/MIN/GROUP BY)
       ├─ Cache memória (TTL 300s)
       └─ Rankings / trending (actividade observada)
```

Ficheiro hub: `src/catalog/marketplace_intelligence_service.py`

## Endpoints (novos, read-only)

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/v1/mercado` | Resumo global + rankings |
| `GET /api/v1/marcas` | Lista de marcas |
| `GET /api/v1/marca/{slug}` | Dashboard marca |
| `GET /api/v1/lojas` | Lista de lojas |
| `GET /api/v1/loja/{slug}` | Dashboard loja |
| `GET /api/v1/categorias/{slug}/estatisticas` | Stats de categoria/leaf |
| `GET /api/v1/mercado/rankings` | Rankings factuais |
| `GET /api/v1/mercado/tendencias` | Actividade observada |

Nenhum endpoint anterior muda.

## Páginas FE

| Rota | Conteúdo |
|------|----------|
| `/mercado/` | Dashboard |
| `/mercado/marcas/` | Lista marcas |
| `/mercado/marca/?id=` | Detalhe marca |
| `/mercado/lojas/` | Lista lojas |
| `/mercado/loja/?id=` | Detalhe loja |
| `/mercado/tendencias/` | Tendências (só actividade) |
| Categoria | Bloco de estatísticas (additivo) |

Menu: link **Mercado** no header/footer.

## SEO

- `metadata` (title, description, canonical, OG, Twitter) nas páginas hub
- JSON-LD `CollectionPage` no dashboard / marcas
- Breadcrumbs textuais nas páginas de detalhe
- Detalhe marca/loja via query param (compatível com `output: export`)

## Performance / cache

- Agregações SQL (sem N+1 de product detail)
- Cache em memória por chave (`mercado`, `brand:…`, `store:…`, …)
- TTL configurável (default 300s)
- Sem impacto na pesquisa / ranking

## Exemplo JSON (`/api/v1/mercado`)

```json
{
  "products": 12345,
  "brands": 420,
  "stores": 18,
  "avgPrice": 189.5,
  "promotionsActive": 12,
  "couponsActive": 40,
  "rankings": {
    "cheapest": [{ "slug": "…", "currentPrice": 29.9 }],
    "biggestDiscount": [],
    "mostStores": [],
    "newest": []
  },
  "cacheTtlSec": 300
}
```

## Testes

- Hub: `tests/test_api_marketplace_intelligence.py` (overview, marcas, lojas, stats, rankings, cache, search intacto)
- FE: smoke de tipos em `src/components/mercado/__tests__/marketplace.test.ts`
- Suites anteriores devem permanecer verdes

## Limitações

- Stats de score médio Limiar não são calculadas em SQL puro (exigiriam batch de índices); preços/contagens/marcas/lojas são factuais
- Cupões/promoções dependem do schema presente na DB (fallback 0 se tabela ausente)
- Páginas marca/loja detalhe usam `?id=` (static export)
- Screenshots: validar visualmente em staging após deploy

## Próximos passos (FASE 8)

- Persistência / sync cloud de favoritos, alertas, cart
- Score médio por leaf com cache materializado
- Sitemap dedicado `/mercado/*`
- Enrichment de “qualidade dos dados” por mercado
- Alertas de mercado (queda de preço média na categoria)

## Critérios

- [x] Zero alterações aos motores listados
- [x] Apenas leitura / agregação factual
- [x] Sem IA / sem previsões
- [x] Cache + endpoints novos
- [x] FE Mercado + SEO base
