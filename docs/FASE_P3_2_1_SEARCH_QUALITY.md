# FASE P3.2.1 — Search Quality & Query Understanding

**Repo:** `spotter-intelligence-hub`  
**Data:** 2026-08-05  
**Flag:** reutiliza `P33_SEARCH_ENGINE` (sem flag nova — evolução do Bloco 2)

## Objectivo

Entender linguagem natural, remover stopwords, reconhecer marca+categoria / categoria+atributo / perguntas, e **nunca devolver 0** quando existem produtos relevantes (fallback progressivo).

## O que foi feito

### 1. Stopwords NL
`src/api/search_p33/query_understand.py` — `NL_STOPWORDS` (melhor, qual, para, de, com, quero, best, …).  
Espelhado em `_required_tokens` / `tokenize_normalized` / `_STOPWORDS` parcial.

### 2. Rewrite de linguagem natural
`rewrite_natural_language_query(q)`:
- remove invólucro de pergunta (`Qual o melhor …?`)
- remove stopwords
- extrai atributos (`gaming`, `4k`, …)
- devolve `search_text` limpo para `parse_search_query`

### 3. Intent
- `portátil` / `laptop` → leaf `laptop`
- `portátil gaming` → leaf + attr gaming
- aliases `câmara TP-Link` → security_camera + tp-link

### 4. Fallback progressivo (`SearchService`)
Se 0 candidatos após a query limpa:
1. queries relaxadas (`progressive_search_texts`: brand+cat, só cat, só marca, `tapo`, …)
2. `product_type=ALL` quando há marca
3. remove profile SQL/memória se ainda vazio  
Leaf hard-filter: se esvaziar, mantém lista; brand hybrid pode cair para match só por marca.

### 5. API
Campos aditivos em `intent.rewrite` / `intent.fallbackQuery` (só com P33 ON). Contrato legado intacto.

## Testes obrigatórios

```bash
python -m pytest tests/test_p321_search_quality.py -q
```

| Pesquisa | Esperado |
|----------|----------|
| SSD Samsung | SSDs Samsung |
| Samsung SSD | SSDs Samsung |
| melhor SSD Samsung | SSDs Samsung (sem token «melhor») |
| portátil gaming | Portáteis gaming |
| melhor portátil gaming | Portáteis gaming |
| Apple Watch | Apple Watch |
| Bullpadel | Bullpadel relevantes |
| TP-Link Tapo | Tapo / câmaras |
| câmara TP-Link | Câmaras Tapo |
| Air Fryer | Air Fryers |
| frigideira | Frigideiras |
| RTX 5070 | GPUs RTX 5070 |

**Regra:** se algum destes fizer match 0 a títulos de catálogo simulados com stock, a fase falha.

## Activar

```bash
P33_SEARCH_ENGINE=true
```

## Não alterado

Taxonomia · rules_engine · classificação · remaps · contratos públicos sem P33 · FE (opcional: consome `intent.rewrite` depois)

## Rollback

`P33_SEARCH_ENGINE=false` — path legado sem rewrite/fallback.
