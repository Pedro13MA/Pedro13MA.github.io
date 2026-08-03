# FASE 7.19 — Timeline & Watchlists Inteligentes

Camada de acompanhamento (**Watchlists**) + **Timeline** factual. 100% aditiva. Sem IA, sem previsões, sem alterar motores.

Lido antes: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, `taxonomy-fase716-product-insights.md`, `taxonomy-fase717-discovery.md`, `taxonomy-fase718-marketplace-intelligence.md`.

## Não alterado

- ranking / pesquisa / taxonomy / insights / discovery
- scheduler / telegram / motor Limiar / histórico
- Smart Cart / Projetos / Comparador (só UI aditiva: botão Seguir + timeline)

## Arquitectura

```text
WatchService
    ↓
WatchStorageAdapter
    ├─ LocalWatchAdapter   (localStorage · limiar.watchlists.v1)
    └─ CloudWatchAdapter   (stub · FASE 8)

TimelineService
    ├─ eventsFromProductHistory (PricePoint[])
    ├─ diffBaselines (WatchBaseline → eventos)
    ├─ groupEventsByPeriod / filterTimelineEvents
    └─ refreshWatchObservations (uma passagem ao abrir /timeline)
```

Ficheiros:

| Ficheiro | Papel |
|----------|--------|
| `src/lib/watchlists/watch_service.ts` | CRUD watches + stats |
| `src/lib/watchlists/timeline_service.ts` | Eventos factuais |
| `src/lib/watchlists/storage-adapter.ts` | Interface |
| `src/lib/watchlists/local-watch-adapter.ts` | Persistência local |
| `src/lib/watchlists/cloud-watch-adapter.ts` | Stub cloud |
| `src/lib/watchlists/refresh.ts` | Observação sob pedido |

## Tipos de Watch

`PRODUCT` · `CATEGORY` · `BRAND` · `STORE` · `PROJECT` · `SMART_CART`

Cada watch: `id`, `kind`, `target`, `created`, `lastSeen`, `notes`, `enabled`, `baseline`.

## Eventos (factuais)

Exemplos gerados só com dados observados:

- Preço baixou / subiu
- Novo mínimo
- Entrou nova loja / loja sem oferta
- Categoria ganhou/perdeu produtos · preço médio caiu
- Marca/loja: mais produtos ou promoções
- Projeto: total baixou · item mais barato/caro vs preço ao adicionar
- Carrinho: pode poupar (optimize) · menos lojas

Nunca: “vai baixar”, tendências previstas, IA.

## Páginas

| Rota | Conteúdo | SEO |
|------|----------|-----|
| `/timeline/` | Cards cronológicos + filtros + pesquisa | `noindex` |
| `/minha-area/` | Resumo favoritos/alertas/projetos/carrinho/timeline/watches | `noindex` |

`robots.txt`: `Disallow: /timeline/` e `/minha-area/`.

## UI — Seguir em todo o site

Botão **Seguir** (`WatchButton` / `ProductWatchButton`):

- Hero produto (junto a Favorito / Alerta / Carrinho)
- Categoria · Marca · Loja · Projeto · Carrinho

Secções **Atividade recente / Timeline** em produto, categoria, marca, loja, projeto, carrinho.

Menu **Minha Área**: Resumo + Timeline.

## Performance

- Sem polling
- Observações só ao abrir `/timeline/` (uma passagem sequencial)
- Persistência localStorage
- Preparado para sync cloud (FASE 8)

## Testes

`src/lib/watchlists/__tests__/watchlists.test.ts`

- follow / unfollow
- stats
- histórico → eventos
- diffBaselines
- filtros / períodos
- applyObservation
- Cloud stub

Suites anteriores devem permanecer verdes.

## Limitações

- Eventos de categoria/marca/loja só após **segunda** observação (precisa de baseline)
- Sem notificações push (alertas Telegram intactos)
- Sem conta / sync até FASE 8
- Screenshots: validar em staging após deploy

## Próximos passos — FASE 8

1. Conta Limiar + auth
2. Activar `CloudWatchAdapter.sync()`
3. Merge local ↔ cloud sem duplicar eventos
4. Notificações honestas ligadas a watches (sem inventar)
5. Partilha de watchlists (opcional)

## Critérios

- [x] Zero alterações ao motor Limiar / ranking / pesquisa / taxonomy / scheduler / Telegram
- [x] Apenas leitura de dados existentes
- [x] Sem IA / sem previsões / sem inventar eventos
- [x] Preparado para FASE 8 (adapter cloud stub)
