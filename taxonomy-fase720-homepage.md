# FASE 7.20 — Homepage Inteligente & Descoberta

Homepage como **centro de descoberta** factual (estilo Amazon/Idealo), só com dados já existentes. Sem IA, sem previsões.

Lido antes: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, `taxonomy-fase718-marketplace-intelligence.md`, `taxonomy-fase719-watchlists.md`.

## Não alterado

- pesquisa / ranking / taxonomy / Product Insights / Discovery (motores)
- Marketplace / Smart Cart / Projetos / Watchlists / Comparador
- Scheduler / Telegram / API Search

Apenas **reutilização** + UI homepage + endpoint agregado read-only.

## Arquitectura

```text
HomepageService.buildHomepage()
    ↓ reutiliza
MarketplaceIntelligenceService (mercado, rankings, trending, brands, stores, category_stats)
    + coupons (CampaignService, best-effort)
    ↓
GET /api/v1/home
    ↓
HomePageClient (secções lazy)
```

Hub: `src/catalog/homepage_service.py`  
Cache memória TTL **300 s**.

## Endpoint

`GET /api/v1/home` → `HomepageOut`

Campos (todos opcionais / listas vazias OK):

| Campo | Fonte |
|-------|--------|
| featured | topDeals / mostStores |
| topDeals | rankings.biggestDiscount |
| recentDrops | trending.mostActivity + discounts |
| popularProducts | rankings.mostStores |
| recommended | mix factual desconto + multi-loja |
| categories | stats L1 (computadores, gaming, telemóveis, casa) |
| trendingBrands / trendingStores | list_brands / list_stores |
| marketSummary | mercado + classifiedPct |
| latestCoupons | hub cupões (se disponível) |
| latestProducts | trending.recentlyAdded |

## Frontend

| Componente | Secção |
|------------|--------|
| HomeHero | Marca + pesquisa + atalhos |
| HomeDeals | Oportunidades hoje |
| HomeFeatured | Destaques |
| HomeRecentDrops | Baixaram recentemente |
| HomeFollowed | Watchlists locais / fallback popular |
| HomeCategories / Brands / Stores | Cards / carrosséis |
| HomeMarket / HomeStats | Resumo + cobertura |
| HomeCoupons | Cupões |
| HomeDiscovery / HomeLatestProducts | Descobre + novidades |

+ `HomePageBody decisionsOnly` — **Comprar agora / Esperar** (API deals existente).

Lazy via `next/dynamic` (`ssr: false`).

## SEO

- Metadata + OpenGraph + Twitter na `page.tsx`
- JSON-LD: `WebSite` + `SearchAction` + `Organization`
- Canonical = `SITE_URL`

## Testes

- Hub: `tests/test_homepage.py` (completo, cache, deals, openapi, empty, classified%)
- FE: `src/components/home/v2/__tests__/homepage.test.ts`

## Limitações

- `recommended` não invoca ProductDiscoveryService (evita N+1); usa rankings factuais
- Cupões dependem da BD de campanhas (podem vir vazios em fixtures)
- Screenshots: validar em staging

## Próximos passos (FASE 8)

1. Conta + personalização da homepage (follows sync)
2. Secções por interesse sem inventar relevância
3. Alertas honestos ligados a watches

## Critérios

- [x] Zero alterações pesquisa / ranking / taxonomy / scheduler / Telegram
- [x] Apenas reutilizar serviços existentes
- [x] Totalmente factual
- [x] Cache TTL 300 s
