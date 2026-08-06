# Auditoria de Performance — Frontend Lymiar

**Data:** 2026-08-06  
**Modo:** READ ONLY (sem alterações de código)  
**Repo:** `Pedro13MA.github.io`  
**Produção:** `https://lymiar.com` (nginx VPS, static export Next.js 15)

---

## Resumo executivo

O Lymiar **parece lento** principalmente por três razões estruturais:

1. **Static export + Client Components** — quase todo o conteúdo útil (pesquisa, categoria, PDP) só aparece **depois** de JS + API; LCP/INP degradam.
2. **Pedidos API duplicados** — homepage dispara **3× `getDealsNow`** + taxonomy + session + cupões + home stats (**8+ requests** no primeiro load).
3. **Bundles pesados sem code-splitting** — PDP/comparador ~**287 KB** First Load JS (recharts); chunk partilhado ~**401 KB**; **zero** `dynamic()` imports.

### Pontuação estimada (Lighthouse mobile — estimativa analítica)

| Área | Nota | Estado |
|------|------|--------|
| Performance | **68/100** | 🟡 |
| Accessibility | **87/100** | 🟢 |
| Best Practices | **90/100** | 🟢 |
| SEO | **94/100** | 🟢 |

### Core Web Vitals (estimativa)

| Métrica | Home | Search | Categoria | PDP |
|---------|------|--------|-----------|-----|
| **LCP** | ~2.0–2.8s | ~2.5–4.0s | ~2.5–4.0s | ~3.0–5.0s |
| **INP** | ~150–250ms | ~200–400ms | ~200–400ms | ~250–500ms |
| **CLS** | ~0.05–0.12 | ~0.08–0.15 | ~0.08–0.15 | ~0.06–0.12 |

> Lighthouse CLI falhou localmente (EPERM Chrome). Métricas de rede medidas via Performance API em produção (search TTFB ~94ms, DCL ~108ms, JS transfer ~231KB na página).

---

## 1. Lighthouse / CWV

### Problemas

| ID | Problema | Gravidade | Impacto |
|----|----------|-----------|---------|
| P-L01 | Conteúdo principal depende de fetch client-side (export estático) | **Crítico** | LCP atrasado 1–3s vs SSR |
| P-L02 | `images: { unoptimized: true }` — sem next/image optimization | **Alto** | LCP hero/cards; bytes extra |
| P-L03 | 3 fontes Google (Space Grotesk, Source Sans 3, JetBrains Mono) | **Médio** | Render-blocking / FOIT |
| P-L04 | Google Analytics third-party (`@next/third-parties`) | **Médio** | Main thread + privacy |
| P-L05 | HTML sem `Cache-Control` (nginx) | **Alto** | Revalidação completa cada visita |
| P-L06 | Chunks JS ~401KB (3668-*.js) sem `Cache-Control` explícito | **Alto** | Repeat visits lentos |

### Reproduzir
1. DevTools → Network → reload `lymiar.com/search/?q=SSD%20Samsung`
2. Observar: HTML rápido, resultados só após `/api/v1/search`
3. Lighthouse mobile (Chrome DevTools) — LCP element será texto/skeleton, não produtos

---

## 2. Next.js / Build

### Config actual (`next.config.ts`)

```ts
output: "export"
images: { unoptimized: true }
trailingSlash: true
```

**Implicações:** sem SSR streaming, sem ISR, sem Server Components com dados, sem Image Optimization API.

### First Load JS (build 2026-08-06)

| Rota | First Load JS |
|------|---------------|
| Shared | **102 KB** |
| `/` (home) | **148 KB** |
| `/search` | **164 KB** |
| `/categoria/[slug]` | **171 KB** |
| `/p`, `/p/[slug]` | **287 KB** |
| `/comparar` | **155 KB** |
| `/catalog` | **166 KB** |

### Chunks maiores (`out/_next/static/chunks/`)

| Ficheiro | Tamanho |
|----------|---------|
| `3668-*.js` | **401 KB** |
| `framework-*.js` | 185 KB |
| `1255-*.js` | 170 KB |
| `4bd1b696-*.js` | 169 KB |
| `main-*.js` | 120 KB |

Total `out/_next`: **~2.22 MB**

### Problemas

| ID | Problema | Gravidade | Ficheiros |
|----|----------|-----------|-----------|
| P-N01 | **~120 ficheiros `"use client"`** — quase toda a app é client | **Crítico** | `src/**` |
| P-N02 | **Zero `dynamic()` / lazy imports** | **Alto** | — |
| P-N03 | `AppProviders` client envolve **toda** a árvore | **Alto** | `layout.tsx`, `AppProviders.tsx` |
| P-N04 | `TaxonomyTreeProvider` fetch global (P32) | **Alto** | `TaxonomyTreeProvider.tsx` |
| P-N05 | `recharts` no bundle PDP (~287KB route) | **Alto** | `charts/PriceHistoryChart.tsx` |
| P-N06 | `framer-motion` em `package.json` mas **0 imports** | **Médio** | `package.json` |
| P-N07 | `OpportunityCard` importa Compare+Cart+Project em **cada card** | **Alto** | `OpportunityCard.tsx` |
| P-N08 | Static export gera **316 páginas** SSG — build lento, deploy pesado | **Médio** | `app/**` |

---

## 3. Pesquisa

### Fluxo actual

```
User → /search/?q=… → HTML shell (~23KB gzip)
  → JS hydrate (~164KB + shared 102KB)
  → TaxonomyTreeProvider GET /taxonomy/tree
  → SessionProvider GET /session
  → SearchPageClient GET /search?q=…&limit=24
  → summaryToProduct × 24 (main thread)
  → 24× OpportunityCard (heavy)
```

### Métricas observadas (produção, search SSD Samsung)

| Etapa | Tempo |
|-------|-------|
| TTFB HTML | ~94–128 ms |
| DOMContentLoaded | ~108 ms |
| API `/search` | ~88–109 ms |
| API `/taxonomy/tree` | ~184 ms |
| API `/session` | ~97 ms |
| API `/search/suggest` | ~93 ms (header typeahead) |
| **Total até cards** | ~300–800 ms (rede) + render |

### Problemas

| ID | Problema | Gravidade | Impacto |
|----|----------|-----------|---------|
| P-S01 | **2 search bars** na mesma página (header + hero) | **Médio** | 2 combobox, suggest duplicado |
| P-S02 | `apiGet` usa `cache: "no-store"` sempre | **Alto** | Zero cache browser para search |
| P-S03 | 24 cards sem virtualização (`PAGE_SIZE=24`) | **Alto** | INP + paint lento em mobile |
| P-S04 | `OpportunityCard` não memoizado; 5 botões/card | **Alto** | Re-render em filtros |
| P-S05 | Facets/taxonomy refetch a cada mudança URL | **Médio** | Latência em filtros |
| P-S06 | Sem prefetch da página 2 / next results | **Baixo** | Paginação sente gap |
| P-S07 | Typeahead debounce 280ms OK; race fix recente | **Baixo** | — |

### Soluções recomendadas (search)

1. **Quick:** `React.memo(OpportunityCard)` + lazy load botões secundários
2. **Médio:** virtualizar lista (`@tanstack/react-virtual`) acima de 12 items
3. **Médio:** SWR/React Query com staleTime 60s para mesma query
4. **Estrutural:** ISR/SSR search results para queries top (requer sair de export puro)

---

## 4. Homepage

### API calls no primeiro load (P32 ON)

| # | Endpoint | Componente |
|---|----------|------------|
| 1 | `GET /taxonomy/tree` | `TaxonomyTreeProvider` |
| 2 | `GET /session` | `SessionProvider` |
| 3 | `GET /deals/now?limit=12` | `HomeHeroPremium` |
| 4 | `GET /deals/now?limit=12` | `HomeDecisionsPremium` ⚠️ **dup** |
| 5 | `GET /deals/wait?limit=12` | `HomeDecisionsPremium` |
| 6 | `GET /deals/now?limit=24` | `HomeExamples` ⚠️ **dup** |
| 7 | `GET /home` | `HomeStats` |
| 8 | `GET /coupons` | `HomeCouponsPremium` |

**Total: 8 requests** (3× deals/now redundantes)

### Problemas

| ID | Problema | Gravidade |
|----|----------|-----------|
| P-H01 | **3× `getDealsNow`** independentes | **Crítico** |
| P-H02 | Secções below-fold fetch imediato (não lazy) | **Alto** |
| P-H03 | Hero product shots bloqueiam perceived LCP | **Alto** |
| P-H04 | `home-premium.css` + 11 secções client montadas de uma vez | **Médio** |
| P-H05 | Imagens externas merchant sem dimensões fixas | **Médio** (CLS) |

### LCP candidatos
- H1 «Vale a pena comprar hoje?» (OK — texto)
- Product shots no hero (BAD — dependem de API #3)

---

## 5. PDP (`/p/?id=`)

### Waterfall

```
GET /product/{slug}     (~200-400ms)
  → render skeleton
  → GET /product/{ean}/metrics  (sequencial!)
  → GET /price-history/{id}   (PriceHistoryChart, +1)
  → recharts bundle parse       (~287KB JS)
```

### Problemas

| ID | Problema | Gravidade |
|----|----------|-----------|
| P-P01 | Metrics **sequencial** após product | **Alto** |
| P-P02 | `recharts` carregado upfront no route chunk | **Crítico** |
| P-P03 | Price history re-fetch mesmo com `fallbackHistory` | **Médio** |
| P-P04 | Similar products section fetch adicional | **Médio** |
| P-P05 | First Load JS **287 KB** — pior rota do site | **Crítico** |

### Solução chave
```tsx
const PriceHistoryChart = dynamic(() => import('@/components/PriceHistoryChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
```
Ganho estimado: **−80~120 KB** no First Load JS inicial; TTI −0.5~1.5s.

---

## 6. Categoria

### Requests (`CategoryPage.tsx`)

1. `getCategory(slug)` — se sem SSG initial
2. `getCategoryStats(slug)` — sempre
3. `getCategoryProducts(...)` — sempre

**3 parallel API calls** + taxonomy tree global.

### Problemas

| ID | Problema | Gravidade |
|----|----------|-----------|
| P-C01 | Triple fetch independente | **Alto** |
| P-C02 | «Produtos recomendados» + grelha (24 cards) | **Médio** |
| P-C03 | «A carregar…» até products API | **Alto** (UX) |
| P-C04 | 181 categorias SSG mas dados sempre client | **Médio** |

---

## 7. Network / Infra

### Medido em produção

| Recurso | gzip | Cache-Control |
|---------|------|---------------|
| `/` HTML | sim (~51KB) | **vazio** |
| `/search/` HTML | sim (~23KB) | **vazio** |
| `3668-*.js` | não observado | **vazio** (só ETag) |
| API | JSON | CORS OK; `no-store` no client |

### Problemas

| ID | Problema | Gravidade |
|----|----------|-----------|
| P-NW01 | Sem CDN — single VPS PT | **Médio** |
| P-NW02 | Assets estáticos sem `max-age` longo | **Alto** |
| P-NW03 | HTML sem cache (correcto) mas JS deveria ser immutable | **Alto** |
| P-NW04 | Sem HTTP/3; HTTP/2 provável via nginx | **Baixo** |
| P-NW05 | API cross-origin — latência extra vs same-origin | **Médio** |

### Nginx recomendado (VPS)
```nginx
location /_next/static/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

---

## 8. React patterns

| Pattern | Uso actual | Recomendação |
|---------|--------------|--------------|
| `React.memo` | **2** componentes (`TaxonomyFilters`, `TaxonomyFacetPanel`) | Expandir a cards/listas |
| `useMemo` | Moderado (Search, Category) | OK |
| `useCallback` | Moderado | OK |
| `Suspense` | Só search bar wrapper | Expandir para secções |
| `dynamic()` | **0** | Crítico para charts, compare, catalog |

### Re-renders identificados

- `SearchPageClient`: `buildSearchUrl` deps incluem `taxonomySelection` object → recria callbacks
- `CategoryPage`: similar pattern (parcialmente fixado com `queryKey`)
- `OpportunityCard` × 24: re-render completo em qualquer `setFacets`

---

## 9. UX percebida

| Aspecto | Estado | Nota |
|---------|--------|------|
| Skeletons search/category | ✅ Existem | Bons |
| Skeleton PDP P34 | ✅ `ProductPdpSkeleton` | Bons |
| «A carregar…» texto search | ⚠️ Genérico | Mostrar progresso/stale |
| Double loading flash | ⚠️ HTML fast → skeleton → content | Acceptable |
| Prefetch links produto | ❌ Ausente | `router.prefetch` on hover |
| Typeahead feedback | ✅ OK | 280ms debounce |
| Bottom nav P32 | ✅ | Safe-area parcial |

---

## 10. Plano de implementação priorizado

### 🔴 Quick Wins (1–3 dias) — maior impacto percebido

| # | Acção | Ficheiros | Complexidade | Ganho |
|---|-------|-----------|--------------|-------|
| Q1 | **Homepage data layer** — 1 fetch `getDealsNow` partilhado (context/hook) | `HomeHeroPremium`, `HomeDecisionsPremium`, `HomeExamples` | Baixa | −2 API calls; −300–600ms home |
| Q2 | **`dynamic()` PriceHistoryChart + recharts** | `ProductPageClient`, `ProductPageP34` | Baixa | −80KB JS; TTI PDP −0.5–1.5s |
| Q3 | **`React.memo(OpportunityCard)`** + split compact/full | `OpportunityCard.tsx` | Baixa | INP search −30–50% |
| Q4 | **nginx Cache-Control** em `/_next/static/` | VPS nginx conf | Baixa | Repeat visit −200–500ms |
| Q5 | **Remover `framer-motion`** do package.json | `package.json` | Trivial | Bundle hygiene |
| Q6 | **Lazy below-fold home sections** (`IntersectionObserver`) | `HomePageClient.tsx` | Média | TTI home −20–40% |

### 🟠 Melhorias médias (1–2 semanas)

| # | Acção | Ganho |
|---|-------|-------|
| M1 | SWR/React Query com cache search 60s | Search repeat instant |
| M2 | Virtualizar grelha search/category (>12 items) | INP mobile |
| M3 | Paralelizar PDP product + metrics | −100–200ms PDP |
| M4 | Taxonomy tree: cache sessionStorage 24h | −1 API call every page |
| M5 | Prefetch PDP on card hover | Navegação instantânea |
| M6 | Consolidar session + taxonomy em 1 boot endpoint (BE) | −1 RTT global |

### 🟡 Melhorias estruturais (fase própria)

| # | Acção | Ganho |
|---|-------|-------|
| E1 | Migrar de `output: export` para **SSR/ISR** (VPS Node ou edge) | LCP −1–3s global |
| E2 | Server Components para shells + dados iniciais | SEO + perf |
| E3 | Image optimization (CDN ou next/image com loader) | LCP −0.3–0.8s |
| E4 | API same-origin proxy (`/api/*` → api.lymiar.com) | −RTT, cache |
| E5 | Route-based code splitting compare/catalog/projects | −50KB rotas raras |

---

## 11. Riscos de não actuar

- Search continua a «sentir-se lenta» mesmo com API rápida (render 24 heavy cards)
- Homepage gasta quota API desnecessária (3× deals)
- Mobile INP pode falhar CWV threshold (200ms) em filtros
- PDP 287KB penaliza conversão em 3G/4G fraco

---

## 12. O que está bem (🟢)

- API search ~90–110ms (rede PT)
- Debounce typeahead + race fix (P3.2.2)
- Skeletons consistentes
- Static SSG para categorias/PDP populares (TTFB HTML bom)
- Fontes com `display: swap`
- Brotli/gzip no HTML
- Shared JS base 102KB — razoável para app desta complexidade

---

## Referências técnicas

- Build: `npm run build` (316 páginas, Next 15.5.19)
- Runtime: Performance API em `lymiar.com/search/?q=SSD%20Samsung`
- Artefactos: `tmp_audit_performance.json`, `tmp_audit_bundle.json`, `tmp_audit_network.json`, `tmp_audit_summary.json`
