# AUDIT_REPORT.md — Lymiar (Backend + Frontend)
**Modo:** Dry-run (diagnóstico sem correções aplicadas)  
**Data:** 2026-07-28  
**Repos:** `lymiar-hub` + `lymiar-web`  
**Estado:** Aguarda confirmação do utilizador antes de qualquer fix

---

## Resumo executivo

A ingestão de `product_price_old` / `saving` → `original_price` está **tecnicamente ligada** e já produziu casos corretos (ex.: Cherry M1 19.90 vs PVPR 59.90).  
Os riscos atuais concentram-se em: (1) **score Lymiar demasiado agressivo com PVPR**, (2) **homepage sem filtro `product_type=MAIN`**, (3) **taxonomia ACCESSORY demasiado larga**, (4) **perda de `discountPct` no mapeamento frontend**.

---

## 🔴 SEVERIDADE ALTA

### H1 — Score Lymiar: PVPR sobrepõe histórico real e força “buy”
- **Ficheiro:** `lymiar-hub/src/api/lymiar_index.py` (~L75–92, L157–160)
- **Problema:** Se `pvpr_discount_pct > discount_pct` (mesmo com histórico ≥3 amostras), o desconto histórico é substituído pelo PVPR. Além disso, `thin_history + is_on_sale` força `is_historical_min=True`, e há boost hard-coded para `value ≥ 86`.
- **Impacto:** PVPR inflacionado (comum em “Substituição de Ecrã”, outlets) entra em “🔥 Comprar Agora” com scores 95–96 e descontos 70–85%, sem evidência histórica.
- **Evidência observada (VPS `/deals/now`):** vários “Substituição de Ecrã …” no topo com `isOnSale=True`.
- **Solução recomendada:**
  1. Só usar PVPR quando `len(historical_prices) < MIN_SAMPLES` (não quando PVPR > hist).
  2. Não redefinir `is_historical_min` só por PVPR; usar flag separada `is_on_sale` / `INSTANT_DEAL`.
  3. Caps de desconto PVPR por categoria (ex. max 50% para peças/reparação) ou denylist de títulos (`substituição`, `bilhete`, etc.).
  4. Remover ou suavizar o boost forçado ≥86.

### H2 — `/deals/now` e homepage ignoram `product_type=MAIN`
- **Ficheiro:** `lymiar-hub/src/api/repository.py` (~L889–944)  
- **Frontend:** `lymiar-web/src/components/home/HomeLiveSections.tsx` (~L40)
- **Problema:** A pesquisa filtra `product_type=MAIN` por defeito, mas `deals_now` / `candidate_eans_for_deals` **não**. Acessórios, peças, serviços e bilhetes com PVPR alto aparecem em “Comprar Agora”.
- **Solução recomendada:** Filtrar `product_type='MAIN'` (ou `IN ('MAIN')`) na query de candidatos e/ou no loop de `deals_now`; opcionalmente excluir subcategorias `accessory` / `unmapped` de baixo valor.

### H3 — `_ACCESSORY_RE` demasiado amplo → MAIN omitidos na pesquisa
- **Ficheiro:** `lymiar-hub/src/taxonomy/aliases.py` (~L104–112)  
- **Classifier:** `src/taxonomy/classifier.py` (~L119–136)
- **Problema:** Tokens como `cooler`, `adaptador`, `hub`, `stand`, `case` marcam `product_type=ACCESSORY`. Exemplos de falsos positivos:
  - Marca **“Cooler Master”** (PSU/gabinetes) → ACCESSORY
  - “GPU … cooler” / bundles com “hub”
  - Pesquisa default `product_type=MAIN` **esconde** estes produtos
- **Solução recomendada:**
  1. Exigir contexto negativo para brand names (`Cooler Master` allowlist).
  2. Restringir `cooler` a `water cooler|cpu cooler|air cooler`, não substring de marca.
  3. Não promover ACCESSORY se subcategory for GPU/CPU/PSU/MOTHERBOARD com confiança alta.

### H4 — Alias `switch` → NETWORK classifica Nintendo Switch
- **Ficheiro:** `lymiar-hub/src/taxonomy/aliases.py` (~L92)
- **Problema:** `subcategory_from_text("Nintendo Switch OLED")` pode mapear para `network` porque o alias `switch` está no mapa global.
- **Solução recomendada:** Remover alias curto `switch` ou exigir contexto (`network switch`, `ethernet switch`, `switch gerível`). Adicionar `nintendo switch` → consola/unmapped dedicado.

### H5 — Frontend perde `discountPct` / `isOnSale` no mapeamento
- **Ficheiro:** `lymiar-web/src/lib/api.ts` (`summaryToProduct`, ~L208–233)
- **Problema:** `decision.discountPct` é hardcoded a `0`. `isOnSale` da API não é tipado/propagado. Cartões e lógica de decisão no UI não refletem o desconto real da API.
- **Solução recomendada:** Mapear `s.discountPct` → `decision.discountPct`; adicionar `isOnSale?: boolean` a `ApiProductSummary` / `Product`.

### H6 — `deals_now` N+1 queries (latência + locks SQLite)
- **Ficheiro:** `lymiar-hub/src/api/repository.py` (~L919–925)
- **Problema:** Até 400 EANs × (`get_product_row` + `build_product_summary` + várias queries internas). Em paralelo com sync Awin → `database is locked` (já observado no sync Globaldata).
- **Solução recomendada:** Batch SQL de ofertas/stats; cache curto; limitar candidatos; `busy_timeout` + retry no sync; evitar sync pesado durante picos de API.

---

## 🟡 SEVERIDADE MÉDIA

### M1 — PVPR no cartão sem rasurado visual
- **Ficheiro:** `lymiar-web/src/components/product/OpportunityCard.tsx` (~L62–65)
- **Problema:** Mostra `PVPR 59,90€` em texto normal; não usa `line-through` (já usado em `StoreCompareTable.tsx`).
- **Solução:** Aplicar `line-through` ao PVPR e badge `−X%` separado do lymiar.

### M2 — Sobreposição de badges no cartão
- **Ficheiro:** `OpportunityCard.tsx` (~L42–49)
- **Problema:** Até 3 badges (`semaphore` + `lymiar` + `Mín. histórico`) no canto da imagem; em mobile podem empilhar sobre a foto.
- **Solução:** Limitar a 2 badges; mover “Mín. histórico” para o corpo do cartão.

### M3 — Radio de subcategoria difícil de desmarcar
- **Ficheiro:** `FilterSidebar.tsx` (~L190)
- **Problema:** `input[type=radio]` — em muitos browsers, clicar no já selecionado **não** dispara `onChange`, logo não limpa `subcategory` (só via “Limpar”).
- **Solução:** Usar botões toggle (como as outras facets) ou checkbox single-select com click-to-clear.

### M4 — `title` aliases incluem `description`
- **Ficheiro:** `feed_parser.py` (~L27)
- **Problema:** Se `product_name` vier vazio, o título do produto pode ser a descrição completa → EANs/slugs/classificação degradados.
- **Solução:** Remover `description` dos aliases de `title`; manter só em `description`.

### M5 — `ean_match` congela classificações erradas
- **Ficheiro:** `classifier.py` (~L138–168)
- **Problema:** Após primeira classificação, syncs futuros preservam subcategory (exceto correção portátil∈GPU/CPU). Motherboards/monitores mal classificados não auto-curam.
- **Solução:** Reclassificar periodicamente; ou invalidar `ean_match` se `confidence < 90` / reason `fallback_unmapped`; ou diff de título significativo.

### M6 — Cobertura parcial de `original_price` no catálogo
- **Observação:** Sync Globaldata amostral: ~33/300 com `original_price`. Muitos feeds não preenchem `product_price_old`/`saving`.
- **Solução:** Backfill opcional via `savings_percent`; monitorar % de ofertas com PVPR por loja; alertar se Worten/Globaldata caírem.

### M7 — Ordenação frontend incompleta vs backend
- **Ficheiro:** `SearchPageClient.tsx` (~L19–24) vs `search_intent.py` `SORT_OPTIONS`
- **Problema:** UI não expõe `lowest_history` / aliases `best_opportunity`.
- **Solução:** Alinhar `SORT_OPTIONS` do frontend com o backend.

### M8 — `dropTodayPct` vs PVPR no cartão homepage
- **Ficheiro:** `OpportunityCard.tsx` (~L68–73)
- **Problema:** Sem `showDropToday`, usa PVPR% ou `(avg30d-current)/avg30d`. Com `avg30d ≈ current` (produto novo) e sem PVPR → mostra ~0% verde enganador.
- **Solução:** Esconder % se `< 1`; preferir `discountPct` da API.

### M9 — Filtro MAIN pode omitir produtos válidos “borderline”
- **Ficheiro:** `repository.py` search (~L113–127)
- **Problema:** Default `MAIN` é correto para UX, mas itens mal etiquetados ACCESSORY (H3) desaparecem sem feedback.
- **Solução:** Corrigir H3; opcional toggle “Incluir acessórios” na sidebar.

---

## 🟢 SEVERIDADE BAIXA

### L1 — GA4 seguro com adblock / SSR
- **Ficheiros:** `layout.tsx` (`GoogleAnalytics`), `SearchPageClient.tsx` (~L95–99)
- **Estado:** OK — `@next/third-parties` + guard `typeof window !== 'undefined' && window.gtag`. Adblockers falham silenciosamente (desejável).
- **Melhoria:** Opcional `try/catch` à volta do `gtag` event.

### L2 — Clear de filtros está completo
- **Ficheiro:** `SearchPageClient.tsx` (~L250–267)
- **Estado:** OK — limpa `subcategory`, `brand`, attrs tipados, preços, stock.

### L3 — Sem loop infinito óbvio na URL de pesquisa
- **Ficheiro:** `SearchPageClient.tsx`
- **Estado:** `filters` via `useMemo(searchParams)` + `router.push` — um ciclo por interação. Sem re-render infinito detetado.
- **Melhoria:** `startTransition` no `router.push` para UX mais suave.

### L4 — Logging de sync geralmente estruturado
- **Ficheiro:** `products.py` — erros de item com `logger.error`, não `print`.
- **Nota:** `except Exception` por item é intencional (fail-soft). Rollback de batch em erro de commit está correto.
- **Melhoria:** Métricas Prometheus/contadores de `original_changed` vs `price_changed`.

### L5 — Persistência `original_price` no sync
- **Ficheiro:** `products.py` (~L917–940)
- **Estado:** OK após fix recente — `original_changed` força INSERT mesmo sem mudança de preço.
- **Melhoria:** UPDATE in-place da última oferta em vez de nova linha só por PVPR (reduz crescimento da tabela `offers`).

### L6 — Taxonomia Other ainda ~26k
- **Contexto:** Pós-reclassificação; muitos bilhetes/eventos/malas.
- **Melhoria:** Subcategoria `tickets_events` + `product_type=SERVICE` para bilhetes; excluir de search default.

### L7 — Testes de API lymiar / schema seed
- **Ficheiro:** `tests/test_api_lymiar.py`
- **Estado:** Seed já inclui colunas de catálogo (corrigido recentemente). Manter parity com migrações futuras.

---

## Matriz de verificação pedida

| Área | Veredito |
|------|----------|
| Mapeamento AWIN `product_price_old`/`saving` → `original_price` | ✅ Implementado e persistido (`feed_parser._resolve_original_price` + sync) |
| Score Lymiar PVPR vs histórico | ⚠️ Funcional mas **agressivo demais** (H1) |
| Classifier / extratores | ⚠️ Precedência portátil OK; ACCESSORY/switch problemáticos (H3, H4) |
| `product_type=MAIN` em search | ✅ Default MAIN |
| `product_type=MAIN` em homepage/deals | ❌ Em falta (H2) |
| URL subcategory + clear filtros | ✅ URL sync OK; clear OK; radio deselect frágil (M3) |
| Truncagem / badges / PVPR UI | ⚠️ Badges apertados; PVPR sem strike (M1, M2) |
| GA4 SSR/adblock | ✅ Seguro (L1) |

---

## Prioridade sugerida de correção (quando aprovado)

1. **H2 + H1** — Homepage limpa (MAIN only + PVPR só com histórico fino + denylist)  
2. **H5** — Propagar `discountPct`/`isOnSale` no frontend  
3. **H3 + H4** — Apertar ACCESSORY e alias `switch` + reclassify  
4. **H6** — Batch/caching em `deals_now`  
5. **M1–M3** — Polish UI sidebar/cartões  

---

## Confirmação necessária

**Nenhuma correção foi aplicada nesta fase.**  
Indica quais severidades queres que avance (ex.: “só 🔴”, “H1+H2+H5”, ou “tudo”).
