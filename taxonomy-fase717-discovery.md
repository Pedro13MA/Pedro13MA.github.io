# FASE 7.17 — Recommendations & Discovery

Camada de **descoberta** sobre dados reais (leaf batch + scores + preços + attrs tipados). Sem IA, sem inventar produtos, sem alterar motores.

Lido antes: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, `taxonomy-fase716-product-insights.md`.

## Não alterado

- ranking / pesquisa / taxonomy / insights / scheduler / telegram
- lógica Smart Cart / Projetos / Comparador (só UI aditiva)

## Hub

`src/catalog/product_discovery_service.py`

- Classifica candidatos → `alternatives` / `upgrades` / `savings` / `similar` / `alsoSearched` / `popular` / `recommended`
- Cache em memória (TTL 5 min)
- Product detail: **1** `list_products_by_leaf_ids` + batch summaries existentes (sem N+1)

API opcional: `recommendations` (null se sem candidatos)

## Frontend

- Secção **Descobre também** (carrosséis lazy)
- Categoria: **Produtos recomendados** antes da listagem
- Comparador: **Sugerir melhor** (orçamento = max dos comparados)
- Smart Cart: “Pode poupar X€” (tip UI)
- Projetos: “Melhor alternativa” quando existir
- JSON-LD: `ItemList` / RecommendedProducts

## Critérios

- [x] Zero alterações aos motores listados
- [x] Apenas descoberta factual
- [x] Sem IA / sem previsões
- [x] Testes hub + FE
