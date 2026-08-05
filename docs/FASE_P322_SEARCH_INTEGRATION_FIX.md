# FASE P3.2.2 — Integração completa da pesquisa (fix dos 0 resultados)

**Data:** 2026-08-05  
**Repos:** backend VPS (`/opt/lymiar/backend`) + frontend `Pedro13MA.github.io`

## Diagnóstico (cadeia)

| Etapa | Antes | Depois |
|-------|-------|--------|
| Feature flag BE `P33_SEARCH_ENGINE` | **ausente / OFF** | `true` em `/opt/lymiar/backend/.env` |
| Código `src/api/search_p33/` na VPS | **não existia** | deployado |
| `GET /api/v1/search/suggest` | **404** | **200** `engine=p33` |
| `intent` / `rewrite` na SearchResponse | `null` | presente |
| `melhor SSD Samsung` | **total=0** | **total>0** (rewrite→`ssd samsung`) |
| `melhor portátil gaming` | **total=0** | **total>0** (rewrite→`portatil gaming`) |
| FE SearchPage | podia ficar em «A carregar…» / cancel loop | deps estáveis (`queryKey`/`filtersKey`) + map tolerante |
| FE flag `NEXT_PUBLIC_P33_SEARCH_ENGINE` | ausente | `true` em `.env.production` |
| Typeahead `/suggest` | falharia se flag ON sem endpoint | fallback para `/search` se suggest falhar |

### Causa raiz

1. **P3.2.1 nunca chegou à VPS** — API de produção sem `search_p33`, sem rewrite, sem fallback.  
2. **Flag P33 OFF** — mesmo com código local, produção não activava o motor.  
3. **Stopwords «melhor»** — no código antigo, «melhor» entrava em `required_tokens` → AND SQL → 0 hits.  
4. **FE** — `useEffect` dependia de objectos `searchParams`/`filters` (risco de cancelar fetch); `summaryToProduct` podia derrubar a página inteira; `taxonomy_path` vinha como JSON string.

Não foi alterado: ranking algorithmário, taxonomia, rules, BD, contratos públicos (só campos aditivos já previstos).

## Correcções

### Backend (VPS)
- Sync `src/api/search_p33/**`, `search_service.py`, `search_intent.py`, `schemas.py`, `server.py`, `config.py`, `taxonomy/leaf_first.py`
- `P33_SEARCH_ENGINE=true`
- Restart `python -m src.api`

### Frontend
- `SearchPageClient`: deps estáveis; map por item com try/catch
- `summaryToProduct`: parse seguro de `taxonomy_path` string
- `suggestSearch`: fallback legado se `/suggest` falhar
- `.env.production`: `NEXT_PUBLIC_P33_SEARCH_ENGINE=true` (requer rebuild/deploy FE)

## Validação runtime (obrigatória)

Ver `tmp_p322_runtime_validation.json` — **all_pass: true** (localhost VPS + confirmado em `api.lymiar.com`).

| Query | Resultado |
|-------|-----------|
| SSD Samsung | >0 |
| Samsung SSD | >0 |
| melhor SSD Samsung | >0 |
| portátil gaming | >0 |
| melhor portátil gaming | >0 |
| Apple Watch | >0 |
| Bullpadel | >0 |
| TP-Link Tapo | >0 |
| Air Fryer | >0 |
| frigideira | >0 |
| RTX 5070 | >0 |

## Rollback

```bash
# VPS
P33_SEARCH_ENGINE=false
# restaurar search_service.py anterior + restart API
```

FE: `NEXT_PUBLIC_P33_SEARCH_ENGINE=false` + rebuild.

## Notas

- Rebuild/publish do frontend GitHub Pages necessário para a flag FE e o fix do cancel loop entrarem em `lymiar.com`.  
- API pública já serve P33 (validado 2026-08-05).  
- Sem Bloco 4. Sem funcionalidades novas além da integração.
