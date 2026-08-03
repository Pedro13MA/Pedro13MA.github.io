# FASE 7.16 — Product Insights & Buying Intelligence

Interpretação **factual** dos dados já existentes (histórico, ofertas, knowledge). Sem IA, sem previsões, sem inventar.

Lido antes de implementar: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, `taxonomy-fase715-product-knowledge.md`.

## Não alterado

- ranking / pesquisa / taxonomy / `resolver_v2` / classificação
- Scheduler / Telegram / preços / histórico / ofertas
- lógica Smart Cart / Comparador / Projetos (só UI aditiva)

## Hub

`src/catalog/product_insights_service.py` → `ProductInsights`

API detail (opcional, read-only):

- `insights`
- `recommendation`
- `recommendationConfidence`

## Frontend

- Secção **Insights Limiar** (cartões, resumo, pros/cons, timeline, qualidade dos dados ★)
- Comparador: grupo **Insights**
- Smart Cart: rótulo Comprar agora / Esperar / Monitorizar / …
- Projetos: Bom preço / Preço médio / Poucos dados
- JSON-LD: `positiveNotes` / `negativeNotes` factuais

## Recomendações possíveis

`BUY_NOW` · `GOOD_PRICE` · `WAIT` · `WATCH` · `INSUFFICIENT_DATA`

Nunca “vai baixar”. Sem evidência → “não existem evidências suficientes”.

## Critérios

- [x] Zero alterações aos motores listados
- [x] Apenas leitura / interpretação factual
- [x] Sem IA generativa / sem previsões
- [x] Testes hub + FE
