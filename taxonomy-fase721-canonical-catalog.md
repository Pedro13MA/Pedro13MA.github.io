# FASE 7.21 — Catálogo Canónico & Variantes

Camada **read-only** que organiza produtos em famílias canónicas com variantes comprovadas. Sem IA, sem reclassificar, sem escrever na BD.

Lido antes: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, fases 7.15–7.20.

## Não alterado

- pesquisa SQL / ranking / taxonomy / insights / discovery
- Smart Cart / Projetos (só UI de escolha de variante na página canónica)
- Scheduler / Telegram / histórico

## Arquitectura

```text
CanonicalCatalogService
  ├─ family / canonical_model / chipset / extractors
  ├─ agrupa só se ≥ 2 variantes
  ├─ atributos variáveis (valores distintos observados)
  └─ cache TTL 300s

GET /api/v1/catalogo
GET /api/v1/catalogo/{slug}
GET /api/v1/catalogo/{slug}/variantes
GET /api/v1/catalogo/{slug}/semelhantes

SearchResponse.canonicalHighlight  ← aditivo, pós-query, sem SQL
```

Hub: `src/catalog/canonical_catalog_service.py`

## Frontend

| Rota | Conteúdo |
|------|----------|
| `/catalogo/` | Lista de famílias |
| `/catalogo/grupo/?id=` | Página canónica + VariantPicker + ProductGroup JSON-LD |

Integrações aditivas:

- Pesquisa: card de destaque canónico (antes da grelha; ordem intacta)
- Categoria: **Famílias populares**
- Homepage: **Produtos com variantes**
- Comparador: botão “Comparar variantes” (até 4)
- Menu: Catálogo

Smart Cart / Projetos: só se adiciona após escolher variante na página canónica (picker → ficha concreta).

## Critérios

- [x] Zero alterações motor / ranking / Search SQL / scheduler / Telegram
- [x] Só dados existentes; sem inventar variantes
- [x] Backward compatible (`canonicalHighlight` opcional)

## Testes

- Hub: `tests/test_canonical_catalog.py`
- FE: `src/components/catalogo/__tests__/canonical.test.ts`

## Limitações

- Grupos dependem de `family` / `canonical_model` / chipset extractável
- Cor/bundle só se presente no título ou typed_attributes
- Static export: detalhe via `?id=`

## Próximos passos (FASE 8)

1. Sync cloud de preferências de variante
2. Deep-links partilháveis de combinações
3. Conta + alertas por família canónica
