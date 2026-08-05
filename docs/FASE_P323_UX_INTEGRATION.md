# FASE P3.2.3 — UX Integration & Journey Validation

**Data:** 2026-08-05  
**Repos:** frontend `Pedro13MA.github.io` (apenas integração)  
**Não iniciado:** P3.3 Filtros · Comparador · Recomendações · SEO

## Objectivo

Validar e corrigir a jornada completa  
`Pesquisar → Encontrar → Produto → Histórico → Comprar`  
sem funcionalidades novas, sem backend/API/BD/taxonomia/ranking/pesquisa.

## Evidência live (antes do deploy FE)

| Superfície | Estado em `lymiar.com` (build antigo) | API `api.lymiar.com` |
|------------|----------------------------------------|----------------------|
| Pesquisa `SSD Samsung` | **0 resultados** (bug FE P3.2.2 ainda não publicado) | total>0, intent P33 |
| `/categoria/ssd/` | Carrega (~293 produtos) após loading | OK |
| PDP `/p/?id=…` | Hero + histórico + lojas + Comprar | OK |
| Mega menu P32 | OFF (flag ausente no build) | — |
| Typeahead P33 | OFF no build antigo | `/suggest` 200 |

Validação API journeys J1–J6: **all_pass** — ver `tmp_p323_validation.json`.

## Problemas encontrados

### P0 (corrigidos no código FE)
1. **CategoryPage** — deps instáveis `searchParams` (mesmo cancel-storm que Search em P3.2.2) + `summaryToProduct` sem try/catch.
2. **Links `/p/{slug}/`** em HomeShared / VariantPicker / WatchButton / timeline — 404 em static export para produtos não pré-gerados; padronizado para `/p/?id=`.
3. **`#porque` morto** nos cards — veredicto sem `id="porque"` no PDP.
4. **Flags P32/P34 ausentes** em `.env.production` — navegação mega e PDP P34 nunca activavam em build.

### P1 (corrigidos)
5. SearchTypeahead — race de pedidos / loading falso.
6. Search bar em `/search/` — não preservava `q`.
7. Filtro «Em stock» na categoria — UI falsa (não enviava param).
8. Drafts de preço na categoria — não sincronizavam com URL.
9. Home chrome ≠ resto do site quando P32 ON.
10. `brandHref` → `/mercado/marcas/` em vez de marca concreta.
11. Quick links SSD/GPU sem `bySlug.has`.
12. Mobile drawer vazio enquanto taxonomy carrega.
13. Empty state P33 sem gate de flag.
14. Duplicação cards recomendados vs grelha na categoria.
15. Botão «Criar alerta» disabled a confundir com Alerta do hero (P34).
16. Título duplicado «Histórico» no P34.

### Adiados (fora de âmbito / P3.3+)
- Keyboard completo no typeahead (setas / `aria-activedescendant`).
- Focus trap formal nos drawers.
- Unificar visual de todos os cards (home vs OpportunityCard).
- Filtros inteligentes por leaf (P3.3).
- Comparador / recomendações / alertas avançados / SEO.
- CORS `localhost` para API (bloqueia browser local; produção `lymiar.com` OK).
- Deploy/publish FE (obrigatório para fechar evidência live).

## Correcções (ficheiros)

- `src/components/categoria/CategoryPage.tsx`
- `src/components/search/FilterSidebar.tsx`
- `src/components/search/SearchTypeahead.tsx`
- `src/components/search/SearchEmptyState.tsx`
- `src/components/search/SearchPageClient.tsx`
- `src/components/layout/SearchBarWithQuery.tsx` (novo)
- `src/app/search/page.tsx`
- `src/app/page.tsx`
- `src/lib/nav/build-menu.ts`
- `src/components/nav/MobileNavDrawer.tsx`
- `src/components/nav/SiteHeaderP32.tsx`
- `src/components/product/ProductPageClient.tsx`
- `src/components/product/p34/ProductPageP34.tsx`
- `src/components/product/p34/ProductActionPlaceholders.tsx`
- `src/components/home/v2/HomeShared.tsx`
- `src/components/catalogo/VariantPicker.tsx`
- `src/components/watchlists/WatchButton.tsx`
- `src/lib/watchlists/timeline_service.ts`
- `.env.production` — `P32=true`, `P33=true`, `P34=true`

## Flags

| Flag | Valor produção (env) | Efeito |
|------|----------------------|--------|
| `NEXT_PUBLIC_P32_NAVIGATION` | `true` | Mega menu, bottom nav, home chrome alinhado |
| `NEXT_PUBLIC_P33_SEARCH_ENGINE` | `true` | Typeahead suggest + intent chrome |
| `NEXT_PUBLIC_P34_PRODUCT_PAGE` | `true` | PDP P34 |

## Testes executados

- Vitest: `src/lib/nav`, `src/lib/search`, `src/lib/product`, `search-p33` — **25 passed**
- `tsc --noEmit` — OK
- Script `scripts/_p323_validate_journeys.py` — **all_search_pass**, **all_journeys_pass**
- Browser: produção (search 0 no build antigo; categoria + PDP OK após load); local (CORS bloqueia API)

## Benchmark (API, amostras)

| Query | total |
|-------|------:|
| Apple Watch | 220 |
| SSD Samsung | 24–42 |
| melhor SSD Samsung | 26 |
| portátil gaming | 118 |
| Bullpadel | 19 |
| TP-Link Tapo | 31 |
| Air Fryer | 187 |
| frigideira | 101 |
| RTX 5070 | 49 |

## Riscos

1. **Sem rebuild/publish**, `lymiar.com` continua com search a 0 e flags P32/P34 OFF.  
2. Activar P32/P34 muda chrome e PDP — regressão visual possível; rollback por flag.  
3. Excluir recomendados da grelha reduz cards na 1ª página (intencional, anti-duplicação).

## Rollback

```bash
# .env.production
NEXT_PUBLIC_P32_NAVIGATION=false
NEXT_PUBLIC_P33_SEARCH_ENGINE=true   # manter se API P33 ON
NEXT_PUBLIC_P34_PRODUCT_PAGE=false
# rebuild + publish
```

Ou reverter os ficheiros listados nesta fase.

## Critérios de aceitação

| Critério | Estado |
|----------|--------|
| Zero alterações backend/API/BD/rules/taxonomia/ranking/pesquisa | ✓ |
| Zero funcionalidades novas | ✓ |
| Apenas integração UX | ✓ |
| Journeys API J1–J6 | ✓ |
| Zero links partidos nos paths corrigidos | ✓ (código) |
| Cancel loops Category/Search | ✓ (código) |
| `#porque` / `#historico` / `#lojas` | ✓ (código) |
| Mobile drawer empty + flags | ✓ (código) |
| Evidência live search em `lymiar.com` | ⏳ **requer publish FE** |
| Sem P3.3 / comparador / recs / SEO | ✓ |

## Artefactos

- `tmp_p323_journeys.json`
- `tmp_p323_navigation.json`
- `tmp_p323_mobile.json`
- `tmp_p323_accessibility.json`
- `tmp_p323_performance.json`
- `tmp_p323_validation.json`
- `tmp_p323_before_after.json`

## Próximo passo operacional

1. Rebuild + publish frontend (GitHub Pages).  
2. Revalidar no browser as 12 queries + J1–J6 em `lymiar.com`.  
3. Só depois iniciar **P3.3 — Filtros inteligentes**.
