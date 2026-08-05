# FASE P3 — Bloco 1 — Implementação da Navegação

**Repo:** `Pedro13MA.github.io` (frontend)  
**Data:** 2026-08-05  
**Flag:** `NEXT_PUBLIC_P32_NAVIGATION` → `P32_NAVIGATION` (OFF por defeito)

## Objectivo

Implementar navegação desktop/mobile conforme P3.1 / P3.1A / P3.2, **sem** pesquisa inteligente, filtros avançados, comparador, recomendações, PDP novo, alertas ou SEO avançado.

## Arquitectura

```
AppProviders
  └─ TaxonomyTreeProvider (só se flag ON)
       └─ getTaxonomyTree() → API /api/v1/taxonomy/tree  (backend TreeProvider)
            └─ buildMegaMenuFromTree(elevation + live tree)

SiteHeader
  ├─ flag OFF → SiteHeaderLegacy (comportamento actual)
  └─ flag ON  → SiteHeaderP32 + BottomNavigation
```

- **Taxonomia:** não alterada. FE consome árvore via API (TreeProvider no backend).  
- **Elevação P3.2:** ficheiro `src/lib/nav/elevation.ts` — só apresentação (Wearables, Casa Inteligente, etc.). Resolve leaves contra a árvore live.  
- **API actual:** default `taxonomy_version=1.1` (flags v1.2 OFF). Colunas sem nós na árvore usam leaf shortcuts se existirem (ex. `smartwatch`).

## Componentes criados

| Componente | Path |
|------------|------|
| TaxonomyTreeProvider | `src/components/nav/TaxonomyTreeProvider.tsx` |
| SiteHeaderP32 | `src/components/nav/SiteHeaderP32.tsx` |
| MegaMenu / Trigger | `src/components/nav/MegaMenu.tsx` |
| MegaMenuColumn / QuickLinks / Brands | `src/components/nav/MegaMenuParts.tsx` |
| MobileNavDrawer | `src/components/nav/MobileNavDrawer.tsx` |
| BottomNavigation | `src/components/nav/BottomNavigation.tsx` |
| BreadcrumbNav | `src/components/nav/BreadcrumbNav.tsx` |
| EmptyCategory | `src/components/nav/EmptyCategory.tsx` |
| CategoryHero / Grid / Card / Related / Layout | `src/components/nav/CategoryLayout.tsx` |

## Lib

| Módulo | Função |
|--------|--------|
| `src/lib/nav/flags.ts` | `isP32NavigationEnabled()` |
| `src/lib/nav/elevation.ts` | Spec nav L1 + extra SSG slugs |
| `src/lib/nav/build-menu.ts` | `buildMegaMenuFromTree`, `relatedForSlug` |
| `src/lib/api.ts` | `getTaxonomyTree()` |

## Páginas / rotas

| Rota | Alteração |
|------|-----------|
| Todas com `SiteHeader` | Header P32 quando flag ON |
| `/categorias/` | Mapa L1→L2→leaf quando flag ON |
| `/categoria/[slug]/` | Empty state útil + relacionados; SSG slugs alargados |

URLs canónicas existentes mantidas (`SITE_URL` + path).

## Feature flag

```bash
# .env.local / produção — activar navegação nova
NEXT_PUBLIC_P32_NAVIGATION=true
```

Ausente / `false` → site actual (zero regressão visual).

## Testes

```
npm test -- src/lib/nav src/components/nav
```

8 testes: flags, build-menu, breadcrumbs, empty state, bottom nav.

## Benchmark / métricas

| Item | Nota |
|------|------|
| Tree fetch | 1 request por sessão de provider (não duplica árvore no bundle) |
| Mega menu | Lazy open; colunas derivadas em memória |
| Lighthouse | Não medido nesta fase; flag OFF = path antigo |
| Bundle | Componentes nav só montados com flag ON no header P32 |

## Riscos

1. API taxonomy 1.1 omite `wearables` / `smart_home` / `desporto` L2 → menu usa leaves se existirem; hubs L2 podem 404 até flags v1.2 ON.  
2. `getCategory` para leaves novas pode falhar se nó não estiver na BD de categorias L1 list — empty state cobre.  
3. Bottom nav fixo em mobile — padding no footer quando flag ON.

## Rollback

1. Remover / set `NEXT_PUBLIC_P32_NAVIGATION=false` e rebuild.  
2. Sem migrações BD. Sem alterações backend.

## Limitações (Bloco 1)

- Sem typeahead / pesquisa inteligente (Bloco 2).  
- Sem filtros avançados novos.  
- Mercado / Telegram / PDP inalterados.  
- SEO avançado / landings não implementados.

## Preparação Bloco 2 (Search & Discovery)

- Header já tem campo search → `/search/?q=`  
- Empty states apontam para pesquisa  
- Mesmos slugs de categoria para intent→hub  
- `TaxonomyTreeProvider` reutilizável para sugerir leaves no typeahead

## Ficheiros modificados (principais)

- `src/components/layout/SiteHeader.tsx`
- `src/components/providers/AppProviders.tsx`
- `src/components/categoria/CategoryPage.tsx`
- `src/app/categorias/CategoriasHubClient.tsx`
- `src/lib/category-slugs.ts`
- `src/lib/api.ts`
- `src/components/nav/**` (novo)
- `src/lib/nav/**` (novo)

## Critérios de aceitação

| Critério | Estado |
|----------|--------|
| Navegação funcional com flag ON | ✓ |
| Desktop mega-menu | ✓ |
| Mobile drawer + bottom nav | ✓ |
| Breadcrumbs reutilizável | ✓ |
| /categorias mapa | ✓ |
| /categoria/{slug} + empty | ✓ |
| Feature flag OFF default | ✓ |
| Zero backend / BD / taxonomia | ✓ |
| Testes | ✓ 8 passed |
| Docs + artefactos tmp | ✓ |
