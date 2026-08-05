# FASE P3 — Bloco 2 — Search & Discovery

**Repos:** `spotter-intelligence-hub` (motor) + `Pedro13MA.github.io` (UI)  
**Data:** 2026-08-05  
**Flag BE:** `P33_SEARCH_ENGINE` (OFF por defeito)  
**Flag FE:** `NEXT_PUBLIC_P33_SEARCH_ENGINE` (OFF por defeito)

## Objectivo

Pesquisa por intenção (marca × categoria × modelo), typeahead agrupado, aliases/sinónimos, ranking que corrige os casos P3.1A — **sem** alterar taxonomia, rules_engine, remaps, PDP, Telegram.

## Arquitectura

```
Query
  ├─ normalize (acentos, case, hífen, plural soft)
  ├─ aliases + synonyms
  ├─ detect_search_intent → brand / leaf / profile / model / tech
  ├─ parse_search_query (legado) + profile boost P33
  ├─ SQL candidates (CatalogRepo — inalterado)
  ├─ score_search_relevance_p33 (extende legado)
  ├─ hard filter leaf signals (confiança ≥ 0.85)
  └─ facets / taxonomyFacets (inalterados; preparados)

GET /api/v1/search          — campos aditivos: intent, didYouMean, relatedQueries, categoryRedirect
GET /api/v1/search/suggest  — typeahead: products, categories, brands, suggestions, landings
```

## Algoritmo de intent

1. Normalizar query.  
2. Match aliases multi-palavra (mais longos primeiro).  
3. Detectar marcas conhecidas.  
4. Detectar modelos (GPU, iPhone, Galaxy Watch, Tapo…).  
5. Heurísticas P3.1A (SSD, air fryer, padel, Tapo, monitor gaming…).  
6. Classificar `intent_type`: product | brand | category | hybrid | model.  
7. Gerar `did_you_mean`, `related_queries`, `category_redirect`.

## Algoritmo de ranking

Base = `score_search_relevance` (legado). P33 adiciona:

- Boost marca correcta  
- Boost leaf/profile signals no título  
- **Hybrid boost** quando marca + categoria coincidem  
- **Hard demote** marca certa / categoria errada (ex. Samsung AC em «SSD Samsung»)  
- Penalty `PROFILE_MISMATCH` (AC, frigorífico, etc. em queries SSD)  
- Tech tokens (+10 token coverage)

## Aliases / sinónimos (amostra)

| Alias | Canónico / leaf |
|-------|-----------------|
| disco SSD, nvme, solid state | ssd |
| fritadeira, air fryer | air_fryer |
| frigideira, panela | cookware |
| watch, smartwatch, apple watch | smartwatch |
| robot aspirador | robot_vacuum |
| bullpadel, raquete | padel_racket |
| tapo, câmara | security_camera |

Dicionário: `src/api/search_p33/aliases.py`, `synonyms.py`.

## Frontend

| Componente | Função |
|------------|--------|
| `SearchTypeahead` | Debounce 280ms; suggest API se P33; ESC/focus/ARIA |
| `SearchEmptyState` | Quis dizer / relacionados / categoria |
| `SearchPageClient` | Blocos sugestões + empty P33 |
| `SiteHeaderP32` / `SearchBar` / `HomeSearchBar` | Usam typeahead |

## Activar

```bash
# Backend
P33_SEARCH_ENGINE=true

# Frontend
NEXT_PUBLIC_P33_SEARCH_ENGINE=true
```

## Testes

```bash
# hub
python -m pytest tests/test_p33_search_engine.py -q

# frontend
npm test -- src/lib/search src/components/search/__tests__/search-p33.test.tsx
```

## Rollback

1. `P33_SEARCH_ENGINE=false` + redeploy API.  
2. `NEXT_PUBLIC_P33_SEARCH_ENGINE=false` + rebuild FE.  
3. Sem migrações BD. Endpoint `/search` mantém contrato legado.

## Limitações

- Landings estáticas (não CMS).  
- Facets avançados UI ainda não (só devolve dados).  
- Qualidade depende de títulos/leafs na BD.  
- Bloco 3 (PDP) não iniciado.

## Preparação Bloco 3 (PDP)

- Intent + leaf já disponíveis na SearchResponse.  
- Typeahead navega para `/p/?id=`.  
- Ranking partilhável com “similares” no PDP.

## Critérios

| Critério | Estado |
|----------|--------|
| Typeahead | ✓ |
| Intent | ✓ |
| Ranking inteligente | ✓ |
| Aliases / sinónimos | ✓ |
| Híbrida / marca / categoria / produto | ✓ |
| Empty state | ✓ |
| API backward compatible | ✓ |
| Feature flag OFF default | ✓ |
| Zero taxonomia / rules / remaps | ✓ |
| P3.1A queries cobertas em testes | ✓ |
