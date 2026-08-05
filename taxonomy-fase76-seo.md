# FASE 7.6 — SEO + Landing Pages Programáticas (Taxonomy v2)

**Cada categoria da Taxonomy v2 passa a ser landing page pública indexável. Ranking, pesquisa e classificação inalterados.**

Tudo **aditivo**. O serviço SEO deriva metadata só da taxonomy em cache — sem HTML, sem pesquisa de produtos, sem queries por produto.

## Arquitetura

```text
TaxonomyService (cache process-level)
        │
        ▼
TaxonomySeoService
  · build_for_slug / compact_seo
  · FAQ automática institucional
  · JSON-LD (Organization, WebSite+SearchAction, CollectionPage, BreadcrumbList)
  · sitemap_categorias / sitemap_landing (vazio)
  · derived_landing (enabled=false)
        │
        ├─ CategoryService (enriquece detalhe: seo, faq, json_ld, breadcrumbs+Início)
        └─ API
             GET /api/v1/categorias/{slug}/seo
             GET /api/v1/categorias/{slug}/landing/{facet_key}/{facet_value}
             GET /api/v1/sitemaps/categorias[.xml]
             GET /api/v1/sitemaps/landing[.xml]

Frontend (lymiar-web)
  · CategorySEO.tsx — descrição, contagem, updated_hint, inject JSON-LD
  · CategoryFAQ.tsx — FAQ institucional
  · Breadcrumbs — Início > … > leaf
  · generateMetadata — canonical, robots, OpenGraph, Twitter
  · public/sitemap-categorias.xml + sitemap-landing.xml
  · robots.txt — sitemaps adicionados (Allow inalterado)
```

**ZERO impacto em:** `resolver_v2`, taxonomy tree write path, ranking, pesquisa (`/api/v1/search`), dual-write, sticky, Scheduler, Telegram, Offers, Histórico, classificação.

## Metadata gerada

Todos os campos são opcionais no schema; se não houver conteúdo editorial, geram-se automaticamente:

| Campo | Exemplo (`gpu`) |
| --- | --- |
| `title` | Placas Gráficas |
| `meta_title` | Placas Gráficas — preços e histórico \| Lymiar |
| `meta_description` / `description` | Compare preços de placas gráficas nas principais lojas portuguesas. … |
| `canonical_url` | `https://lymiar.com/categoria/gpu/` |
| `canonical_path` | `/categoria/gpu/` |
| `breadcrumbs` | Início → Informática → Componentes → Placas Gráficas |
| `robots` | `index,follow` |
| `og_title` / `og_description` / `og_image` / `og_url` | espelham meta + `og-default.svg` |
| `twitter_card` | `summary_large_image` |

Nunca inventa especificações técnicas — só texto institucional.

## FAQ automática

```json
[
  {
    "question": "O que é placas gráficas?",
    "answer": "Placas Gráficas é uma categoria do catálogo Lymiar. …"
  },
  { "question": "Como comparar preços?", "answer": "…" },
  { "question": "Como funciona o histórico de preços?", "answer": "…" },
  { "question": "Como encontrar o melhor preço?", "answer": "…" }
]
```

Preparada para substituição futura por conteúdo editorial (mesmo contrato `[{question, answer}]`).

## Exemplos JSON-LD

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lymiar",
    "url": "https://lymiar.com",
    "description": "Quando vale realmente a pena comprar."
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lymiar",
    "url": "https://lymiar.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://lymiar.com/search/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Placas Gráficas",
    "description": "Compare preços de placas gráficas…",
    "url": "https://lymiar.com/categoria/gpu/",
    "isPartOf": { "@type": "WebSite", "url": "https://lymiar.com" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://lymiar.com/" },
      { "@type": "ListItem", "position": 2, "name": "Informática", "item": "https://lymiar.com/categoria/informatica/" },
      { "@type": "ListItem", "position": 3, "name": "Componentes", "item": "https://lymiar.com/categoria/componentes/" },
      { "@type": "ListItem", "position": 4, "name": "Placas Gráficas", "item": "https://lymiar.com/categoria/gpu/" }
    ]
  }
]
```

## Exemplos de páginas

### Activas (categoria taxonomy)

```text
/categoria/gpu/
/categoria/processadores/   (slug real na tree)
/categoria/ssd/
/categoria/laptop/
/categoria/monitor/
/categoria/smartphone/
```

### Derivadas (infra pronta, desactivadas)

```text
API: GET /api/v1/categorias/gpu/landing/brand/nvidia
  → enabled: false, status: not_yet_available, robots: noindex,follow

Futuro (quando activadas):
/categoria/gpu/nvidia/
/categoria/gpu/amd/
/categoria/monitor/27-polegadas/
/categoria/ssd/2tb/
/categoria/telemoveis/samsung/
```

Categoria inexistente ou reservada → **404** nos endpoints SEO/detalhe.

## Sitemap

| Recurso | Conteúdo |
| --- | --- |
| `GET /api/v1/sitemaps/categorias` | JSON com todas as categorias activas |
| `GET /api/v1/sitemaps/categorias.xml` | XML equivalente |
| `GET /api/v1/sitemaps/landing` / `.xml` | vazio (`count: 0`, `enabled: false`) |
| Frontend `public/sitemap-categorias.xml` | estático (~159 URLs; script `scripts/generate_category_sitemap.py`) |
| Frontend `public/sitemap-landing.xml` | urlset vazio |

## Canonical

- Uma URL canónica por categoria: `/categoria/{slug}/`
- Absolute: `https://lymiar.com/categoria/{slug}/`
- Sem variantes duplicadas (trailing slash alinhado com `trailingSlash: true` no Next)

## OpenGraph / Twitter

- `og:title`, `og:description`, `og:url` = canonical
- `og:image` = `https://lymiar.com/og-default.svg`
- `twitter:card` = `summary_large_image`

Frontend `generateMetadata` em `src/app/categoria/[slug]/page.tsx` espelha estes campos.

## Robots

- Por página: `index,follow` (categorias activas)
- Landings derivadas (quando stub): `noindex,follow`
- `public/robots.txt` — **aditivo**: mantém `Allow: /` e lista os novos sitemaps; não remove o sitemap principal existente

```text
User-agent: *
Allow: /

Sitemap: https://lymiar.com/sitemap.xml
Sitemap: https://lymiar.com/sitemap-categorias.xml
Sitemap: https://lymiar.com/sitemap-landing.xml
```

## Frontend

| Ficheiro | Função |
| --- | --- |
| `CategorySEO.tsx` | Descrição institucional, nº produtos, última actualização (hint), JSON-LD no `<head>` |
| `CategoryFAQ.tsx` | Accordion FAQ |
| `Breadcrumbs.tsx` | Inclui Início |
| `CategoryPage.tsx` | Orquestra SEO + FAQ + listagem (listagem já existente FASE 7.5) |

## Backend — ficheiros

| Ficheiro | Função |
| --- | --- |
| `src/api/services/taxonomy_seo_service.py` | Único gerador de metadata |
| `src/api/services/category_service.py` | Consome SEO (aditivo) |
| `src/api/server.py` | Rotas `/seo`, `/landing/…`, `/sitemaps/…` |
| `src/api/schemas.py` | `CategorySeoFullOut`, FAQ, sitemap, `DerivedLandingOut` |
| `tests/test_api_taxonomy_seo.py` | Cobertura FASE 7.6 |

## Testes

`tests/test_api_taxonomy_seo.py` cobre:

- metadata (title, meta_*, robots, twitter)
- canonical / canonical_path
- breadcrumbs (Início + leaf)
- FAQ (≥4 itens institucionais)
- JSON-LD (`Organization`, `WebSite`, `CollectionPage`, `BreadcrumbList`)
- Open Graph fields
- sitemap JSON + XML categorias
- sitemap landing vazio
- landings derivadas `enabled: false`
- categorias inexistentes → 404
- categorias reservadas → 404
- performance: 30× `build_for_slug` + sitemap &lt; 2s (cache taxonomy)

Frontend: Vitest existente (facets/filters) mantém-se verde; SEO é UI + metadata estática.

## Performance

- Sem queries adicionais por produto para metadata
- Toda metadata deriva do índice taxonomy em memória
- Cache process-level (`TaxonomyService`) até restart
- Sitemap estático no FE evita round-trips em deploy GitHub Pages

## Confirmação ZERO impacto

| Área | Alterada? |
| --- | --- |
| Ranking / Lymiar score | Não |
| Pesquisa / relevance | Não |
| `resolver_v2` | Não |
| Dual-write / backfill | Não |
| Taxonomy tree mutável | Não (só leitura) |
| Telegram / Scheduler | Não |
| Offers / Histórico | Não |
| Classificação | Não |

## Deliverables

- [x] `taxonomy_seo_service.py`
- [x] `tests/test_api_taxonomy_seo.py`
- [x] `CategorySEO.tsx` / `CategoryFAQ.tsx`
- [x] Sitemaps categorias + landing (API + FE)
- [x] robots.txt aditivo
- [x] Este relatório (`taxonomy-fase76-seo.md`)
