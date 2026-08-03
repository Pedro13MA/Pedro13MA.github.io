# FASE 7.15 — Product Knowledge & Attribute Enrichment

Enriquecimento **factual** de produtos (título + `typed_attributes` + títulos de ofertas já carregados). Sem IA, sem persistência, sem alterar motores.

## Não alterado

- ranking / pesquisa / taxonomy / `resolver_v2` / classificação
- histórico / preços / Scheduler / Telegram
- Smart Cart / regras Compatibility Engine
- SQL / novas queries

## Hub

```text
src/catalog/attribute_extractors/
  gpu.py cpu.py ssd.py motherboard.py ram.py
  monitor.py smartphone.py laptop.py tv.py psu.py
src/catalog/product_knowledge_service.py
```

`ProductKnowledgeService.build(...)` → `knowledge` JSON em memória + `knowledgeCompleteness` 0–100.

API detail (`ProductDetailOut`): campos opcionais `knowledge`, `knowledgeCompleteness` — só no detail, lazy após dados já carregados.

Prioridade: **typed_attributes** > extractors de título. Sem evidência → atributo omitido.

## Frontend

- **Ficha Técnica** agrupada (`ProductTechSheet`) — substitui “Especificações”
- Comparador: secções alinhadas (Processador, Memória, …) + destaque de diferenças
- Projetos: chips / completeness nas sugestões (sem novas regras de compat)
- JSON-LD `additionalProperty` quando completeness ≥ 40 e ≥ 3 attrs

## Critérios

- [x] Zero alterações ao motor / pesquisa / ranking / scheduler / taxonomy
- [x] Apenas enriquecimento factual
- [x] Preparado para IA futura (quando houver informação suficiente)
- [x] Testes hub + FE
