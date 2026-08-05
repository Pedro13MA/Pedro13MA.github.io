# FASE 7.7 — Catálogo Lymiar v2 (UI + UX)

**100% Frontend.** Pesquisa, ranking, API, SQL, resolver, scheduler, telegram, histórico e classificação **inalterados**.

A página `/catalog/` passa a navegar a Taxonomy v2 com sidebar marketplace, breadcrumbs, chips e facets dinâmicos — reutilizando endpoints e `taxonomyFacets` já existentes.

## Antes → Depois

| Antes | Depois |
| --- | --- |
| 4 pills hardcoded (Todos / Gaming / Informática / …) | Árvore Taxonomy via `GET /api/v1/categorias` (+ filhos lazy) |
| Estado: Apenas Novos / Outlet | Checkboxes: Novo, Caixa Aberta, Outlet, Recondicionado, Usado |
| Sem breadcrumb | Catálogo › Informática › Placas Gráficas › (facet) |
| Sem chips | Chips removíveis + «Limpar filtros» |
| Sem facets no catálogo | `taxonomyFacets` da pesquisa/categoria |
| Layout linear | Sidebar esquerda + grelha; drawer mobile «Filtros» |

## Arquitetura (só UI)

```text
/catalog/
  CatalogPageClient
    ├─ Search (debounce → URL `q`)
    ├─ Breadcrumbs
    ├─ CatalogActiveChips
    ├─ CatalogSidebar (desktop) / Drawer (mobile)
    │    ├─ CatalogCategoryTree  → getCategories + getCategory (lazy)
    │    ├─ CatalogConditionChecks
    │    ├─ Preço / Score / Histórico (UI)
    │    └─ TaxonomyFilters      → taxonomyFacets da resposta
    └─ Resultados (OpportunityCard | empty state)

Dados de produtos (sem novos endpoints):
  · cat seleccionado  → getCategoryProducts (FASE 7.5)
  · q ≥ 2 sem cat     → searchProducts (já usado)
  · secções deals/…   → getDealsNow / Wait / Telegram (já usado)
```

## URL (deep-link)

```text
/catalog/?cat=gpu&condition=NEW&brand=asus&vram_gb=16&sort=lymiar_desc
/catalog/?q=ssd&min_price=50&max_price=200
/catalog/?section=deals
```

- `cat` — slug taxonomy (substitui `category` legado; mapeia audio→tv_audio, etc.)
- `condition` multi — `NEW`, `OPEN_BOX`, `OUTLET`, `REFURBISHED`, `USED`
- facets — mesmos params FASE 7.4 (`brand`, `vram_gb`, …)

## Componentes novos

| Ficheiro | Função |
| --- | --- |
| `CatalogSidebar.tsx` | Sidebar colapsável + localStorage |
| `CatalogCategoryTree.tsx` | Árvore taxonomy (sem hardcode) |
| `CatalogConditionChecks.tsx` | Estado multi |
| `CatalogActiveChips.tsx` | Chips activos |
| `CatalogEmptyState.tsx` | Empty state |
| `CatalogCollapsible.tsx` | Secções ▸/▾ + localStorage |
| `lib/catalog-ui.ts` | Helpers condição / legado |

## Critérios

- [x] UI marketplace (sidebar + resultados)
- [x] Categorias hierárquicas (API taxonomy)
- [x] Breadcrumb
- [x] Chips + limpar
- [x] Facets dinâmicos com contadores (TaxonomyFacetPanel)
- [x] Responsivo (drawer)
- [x] Sem alterações backend / API / ranking / pesquisa
- [x] Testes existentes + novos helpers

## Performance

- Sem queries por produto para UI
- `getCategories` 1× no mount da árvore
- Filhos lazy ao expandir / path activo
- Facets só da resposta de search/categoria (zero endpoints novos)

## ZERO impacto backend

Não foram alterados ficheiros do hub, SQL, endpoints, ranking, search engine, Telegram, Scheduler, resolver_v2 ou classificação.
