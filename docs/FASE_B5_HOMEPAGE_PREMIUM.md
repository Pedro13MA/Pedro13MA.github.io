# FASE B5 — Homepage Premium Redesign

| Campo | Valor |
|-------|-------|
| **Data** | 2026-08-04 |
| **Âmbito** | Apenas `/` (UI) |
| **Release FE** | `20260804-2154` |

## Secções

1. Hero (logo + H1 + search)
2. Como tomamos uma decisão
3. Decisões (comprar / esperar / sem dados)
4. Explorar (categorias — abaixo do fold)
5. Cupões (lista mínima)
6. Telegram (uma linha)

## Removido da homepage

Feeds `getHome()` (featured, drops, market, brands, stores, discovery, latest, etc.). Continuam disponíveis em Mercado / Catálogo / Pesquisa.

## Variantes exclusivas

Tudo sob `src/components/home/premium/`. Header/footer/search/decisões/cupões da home **não** alteram `SiteHeader`, `SearchBar`, `OpportunityCard`, nem `CouponHubSection`.
