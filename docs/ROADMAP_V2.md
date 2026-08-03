# ROADMAP_V2

# Objetivo

Plano de evolução do Limiar (2026–2031): strangler incremental com rollback. Não é reescrita. O Limiar permanece funcional em cada merge.

# Âmbito

Engenharia e operações alinhadas a produto. Fontes de contexto (não norma): SCALE_5Y, FULL_TECHNICAL_AUDIT, IDEAL_ARCHITECTURE_2026.

Fora de âmbito: redefinir `NON_NEGOTIABLES` ou inventar features de produto não listadas em `PRODUCT_VISION_2030`.

# Princípios

1. **Evolution over Revolution** — evoluir; sem big-bang.
2. **Compatibilidade** — APIs públicas mantêm shape; campos novos opcionais/`null`; dual-write / feature flags antes de cortar caminhos antigos; frontend e bot funcionam com respostas antigas.
3. **Integridade antes de stack nova** — confiança e dados honestos antes de “arquitetura bonita”.
4. **P3 só com trigger** — Postgres, Parquet, Redis, etc. não são calendário.
5. **Não mexer no que funciona** — refactor só com motivo mensurável.

# Regras

## Como usar este documento

| Campo | Significado |
|-------|-------------|
| **Pri** | P0 obrigatório · P1 importante · P2 melhoria · P3 só com escala |
| **Esforço** | S ≤3d · M 1–2 sem · L 3–6 sem · XL >6 sem (1 engineer) |
| **Rollback** | Como reverter em produção sem perda de dados |
| **Done** | Testes automáticos + nota em `docs/` + métrica verde |

**Gate entre fases:** a fase N só começa quando os P0 da fase N−1 estão Done (exceto P3, independentes de calendário).

**Definition of Done (todas as fases):**

1. Testes automáticos novos/atualizados a passar em CI.
2. Documentação em `docs/` (ou atualização de doc existente).
3. Feature flag ou dual-path com rollback testado em staging.
4. Métrica de sucesso observada ≥1 semana em produção (P0/P1).
5. Nenhuma regressão: publish Telegram + API search/product smoke OK.

Merge de PRs: cumprir também `QUALITY_BAR`.

## O que NÃO devemos mexer

| Área | Porquê manter |
|------|----------------|
| Pipeline Awin streaming → sync batch → SQLite WAL | Funciona; coração da ingestão |
| `EditorialScheduler` + pacing / cooldowns | Resolveu flood matinal; PublishScore futuro assenta aqui |
| `MerchantRegistry` / `merchants_catalog` | Onboarding já centralizado o suficiente |
| FastAPI read surface (rotas existentes) | Clientes web dependem delas |
| Telegram bot + `/alertar` + publish ledger | Único canal de alerta real hoje |
| Deal score / reference price / promotion analyzer (núcleo heurístico) | Base válida para PublishScore e input parcial |
| Next.js App Router + componentes de produto/search/cupões | Shell UX útil; corrigir integridade, não redesenhar UI |
| Compliance “feeds oficiais only” | Reduz risco legal |
| Testes de parsing Awin, cupões, decision rules que passam | Património; alargar, não apagar |
| Deploy systemd de `main` + `limiar-api` (forma geral) | Adequado à VPS atual |
| Conceito `daily_price_summary` | Intenção correta; evoluir honestidade, não descartar a ideia |

**Regra:** se funciona em produção e não mente ao utilizador nem explode o disco, não tocar só por “pureza arquitetural”.

## Regras de execução — FASE 1 — Integridade dos dados

**Objetivo da fase:** deixar de mentir e de acumular lixo operacional. Zero mudança de stack.

**Duração alvo:** 4–8 semanas  
**Critério de saída:** nulls honestos · retention efetiva · secrets limpos · suite verde · health com freshness

### 1.1 Secrets e superfície de ataque — **P0**

| | |
|--|--|
| **Motivo** | Token em Git / logs = compromisso; admin fail-open |
| **Impacto** | Segurança existencial |
| **Risco** | Baixo se rotação bem feita |
| **Esforço** | S |
| **Dependências** | Acesso VPS + Git history purge policy |
| **Rollback** | N/A (não reverter rotação); manter secrets no vault/env |
| **Métricas** | Zero secrets no tree · `gh secret scanning` limpo · admin exige IDs |
| **Done** | Teste: admin sem IDs → deny · doc: `docs/SECRETS.md` |

### 1.2 Fix retention (`commit` + testes) — **P0**

| | |
|--|--|
| **Motivo** | DELETE sem commit = limpeza ilusória; disco e `deal_events` |
| **Impacto** | Operabilidade + verdade do lifecycle |
| **Risco** | Médio (apagar dados de verdade pela 1ª vez) — dry-run + backup |
| **Esforço** | S–M |
| **Dependências** | Backup ficheiro BD antes |
| **Rollback** | Restaurar backup pré-maintenance |
| **Métricas** | Rowcounts antes/depois · teste prova commit · WAL size estável |
| **Done** | `tests/test_maintenance_retention.py` · nota em ARCHITECTURE_SCALE |

### 1.3 Null history end-to-end (API + web) — **P0**

| | |
|--|--|
| **Motivo** | `?? currentPrice` fabrica “mínimo histórico absoluto” |
| **Impacto** | Confiança do produto (maior ROI de qualidade) |
| **Risco** | Baixo–médio (UI mostra mais “dados insuficientes”) |
| **Esforço** | M |
| **Dependências** | Contratos: campos nullable já parcialmente existem |
| **Rollback** | Feature flag `HONEST_NULLS=1` off (comportamento antigo) *temporário* |
| **Métricas** | 0 badges “mínimo histórico” com N&lt;threshold · testes contrato |
| **Done** | Testes API+web · doc UX evidence rules |

### 1.4 Proibir “historical min” com amostra insuficiente (backend) — **P0**

| | |
|--|--|
| **Motivo** | PVPR + 1 ponto ≠ mínimo histórico |
| **Impacto** | Integridade Limiar Index / deals |
| **Risco** | Menos “BUY” agressivos (aceitável) |
| **Esforço** | S–M |
| **Dependências** | Definir N_min, span_min (ex. ≥7 dias úteis observados, ≥5 pontos) |
| **Rollback** | Flag `STRICT_HIST_MIN=0` |
| **Métricas** | % deals com hist_min true e N&lt;min → 0 |
| **Done** | Testes limiar_index · doc thresholds |

### 1.5 Remover / desativar alerta web falso — **P0**

| | |
|--|--|
| **Motivo** | Form finge sucesso sem persistir |
| **Impacto** | Trust |
| **Risco** | Baixo |
| **Esforço** | S |
| **Dependências** | CTA para Telegram `/alertar` existente |
| **Rollback** | Repor form (não desejável) |
| **Métricas** | 0 submits “sucesso” sem backend |
| **Done** | Teste UI/e2e smoke · copy aponta Telegram |

### 1.6 GET product read-only (sem `upsert_product_monitoring`) — **P0**

| | |
|--|--|
| **Motivo** | Side effect em GET · contenção SQLite |
| **Impacto** | Correção REST + performance sob crawl |
| **Risco** | Médio: monitoring deixa de atualizar no pageview — mover para ingest |
| **Esforço** | M |
| **Dependências** | Garantir refresh no ciclo de feed |
| **Rollback** | Flag `API_MONITORING_WRITE=1` legado |
| **Métricas** | Writes/min na API → ~0 · lock errors ↓ |
| **Done** | Teste: GET não muda `product_monitoring` |

### 1.7 Health real (freshness) — **P0**

| | |
|--|--|
| **Motivo** | `SELECT 1` não mede serviço |
| **Impacto** | Operação |
| **Risco** | Baixo (não expor path absoluto BD) |
| **Esforço** | S–M |
| **Dependências** | Timestamps last feed / last summary |
| **Rollback** | Endpoint antigo `/health` minimal mantido; `/health/ready` novo |
| **Métricas** | Alert se feed &gt;N h · summary lag |
| **Done** | Testes health · doc runbook |

### 1.8 Suite verde + CI mínima — **P0**

| | |
|--|--|
| **Motivo** | 6 falhas conhecidas = contratos partidos |
| **Impacto** | Qualidade contínua |
| **Risco** | Baixo |
| **Esforço** | M |
| **Dependências** | GitHub Actions ou equivalente |
| **Rollback** | N/A |
| **Métricas** | 552/552 (ou skip explícito documentado) · CI required |
| **Done** | CI badge · changelog dos fixes |

### 1.9 Tipar heartbeats / excluir de medianas (mínimo) — **P1**

| | |
|--|--|
| **Motivo** | Honestidade estatística sem matar coverage |
| **Impacto** | Qualidade de referência de preço |
| **Risco** | Médio (scores mudam) — shadow compare |
| **Esforço** | M |
| **Dependências** | Coluna `kind` ou heurística detecção |
| **Rollback** | Flag incluir heartbeats como hoje |
| **Métricas** | Diff p50 com/sem heartbeat em sample |
| **Done** | Testes reference_price · doc |

### 1.10 Carry-forward: marcar imputado / excluir de stats API — **P1**

| | |
|--|--|
| **Motivo** | Ausência ≠ estabilidade |
| **Impacto** | Charts podem continuar suaves; stats ficam honestas |
| **Risco** | Médio |
| **Esforço** | M |
| **Dependências** | Summary builder |
| **Rollback** | Flag legado |
| **Métricas** | `n_obs` / `is_imputed` expostos · testes |
| **Done** | Doc summary semantics |

### 1.11 Backup SQLite diário + restore drill — **P1**

| | |
|--|--|
| **Motivo** | Sem backup = risco existencial |
| **Impacto** | SRE básico |
| **Risco** | Baixo |
| **Esforço** | S |
| **Dependências** | Cron VPS · off-host copy |
| **Rollback** | N/A |
| **Métricas** | Restore test trimestral OK · RPO ≤24h |
| **Done** | `docs/BACKUP.md` |

### 1.12 Separar labels Index / DealScore / Confidence na UI — **P1**

| | |
|--|--|
| **Motivo** | “Confiança” ≠ dealScore |
| **Impacto** | Clareza UX |
| **Risco** | Baixo |
| **Esforço** | S |
| **Dependências** | 1.3 |
| **Rollback** | Reverter UI |
| **Métricas** | Review UX · sem barra mislabeled |
| **Done** | Nota produto |

## Regras de execução — FASE 2 — ConsumerDecision

**Objetivo da fase:** recomendação ao utilizador não depende de caps/tópicos/revenue Telegram.  
**Método:** serviço paralelo + flag; PublishScore continua a alimentar editorial.

**Duração alvo:** 6–10 semanas após Fase 1  
**Critério de saída:** API/web podem mostrar veredicto ConsumerDecision com evidence; bot publish inalterado

### 2.1 Extrair `ConsumerDecision` (módulo novo, sem apagar DecisionEngine) — **P0**

| | |
|--|--|
| **Motivo** | Ética + clareza produto |
| **Impacto** | Diferenciação Limiar |
| **Risco** | Médio (dois caminhos) — mitiga com flag |
| **Esforço** | L |
| **Dependências** | Fase 1 thresholds / nulls |
| **Rollback** | Flag `CONSUMER_DECISION=0` → UI usa path antigo |
| **Métricas** | % UNKNOWN com N baixo · parity tests sample |
| **Done** | `tests/test_consumer_decision.py` · `docs/CONSUMER_DECISION.md` |

**Contrato mínimo:**
```
verdict: BUY | WAIT | UNKNOWN
evidence: { sample_days, span_days, pctile?, hist_min?, stale_hours?, policy_version }
```

### 2.2 Renomear semanticamente uso atual → PublishScore (doc + wrappers) — **P0**

| | |
|--|--|
| **Motivo** | Sem big refactor: DecisionEngine torna-se explicitamente publish-oriented |
| **Impacto** | Clareza para contributors |
| **Risco** | Baixo se for wrapper/alias |
| **Esforço** | M |
| **Dependências** | 2.1 |
| **Rollback** | Aliases mantidos |
| **Métricas** | Nenhum import acidental de PublishScore na web decision card |
| **Done** | Doc + lint/grep gate opcional |

### 2.3 Endpoint `GET .../decision` ou campo opcional no product — **P0**

| | |
|--|--|
| **Motivo** | Consumo web sem partir schema antigo |
| **Impacto** | Produto |
| **Risco** | Baixo (additive) |
| **Esforço** | M |
| **Dependências** | 2.1 |
| **Rollback** | Campo omitido se flag off |
| **Métricas** | Latência p95 · schema tests |
| **Done** | OpenAPI note · contract tests |

### 2.4 Web DecisionCard consome ConsumerDecision — **P0**

| | |
|--|--|
| **Motivo** | Parar prosa frontend que reescreve backend |
| **Impacto** | Uma fonte de verdade |
| **Risco** | Médio UX copy |
| **Esforço** | M |
| **Dependências** | 2.3, 1.3 |
| **Rollback** | Flag web |
| **Métricas** | Diff copy A/B interno · 0 insights sem evidence |
| **Done** | Testes component · doc |

### 2.5 Painel de evidência (N, span, first/last obs) — **P1**

| | |
|--|--|
| **Motivo** | Transparência tipo Keepa sem overclaim |
| **Impacto** | Confiança |
| **Risco** | Baixo |
| **Esforço** | M |
| **Dependências** | 2.3 |
| **Rollback** | Esconder painel |
| **Métricas** | Engagement / suporte qualitative |
| **Done** | Doc UX |

### 2.6 Calibração mínima (log snapshot + outcome 7/30d) — **P2**

| | |
|--|--|
| **Motivo** | Sem calibração, BUY/WAIT é opinião fixa |
| **Impacto** | Qualidade a médio prazo |
| **Risco** | Baixo–médio storage |
| **Esforço** | L |
| **Dependências** | 2.1, retenção |
| **Rollback** | Parar job de log |
| **Métricas** | Hit-rate: preço 30d depois vs WAIT |
| **Done** | Dashboard simples / script |

### 2.7 Probabilidades P30/60/90 empíricas — **P3**

| | |
|--|--|
| **Motivo** | Só com volume e calibração; senão é teatro |
| **Trigger** | ≥12 meses DailyBar honestos em massa + 2.6 |
| **Esforço** | XL |
| **Rollback** | Não expor na UI |
| **REJEITADO como P0/P1** | Prematuro |

## Regras de execução — FASE 3 — API

**Objetivo da fase:** API rápida, estável, compatível, sem efeitos laterais.  
**Não:** microserviços.

**Duração alvo:** 4–8 semanas (pode overlap controlado com Fase 2)

### 3.1 Endpoint agregado de produto (opcional `?view=full`) — **P0**

| | |
|--|--|
| **Motivo** | Web faz ~6 requests; reduzir fan-out |
| **Impacto** | Performance + simplicidade cliente |
| **Risco** | Baixo se additive |
| **Esforço** | M–L |
| **Dependências** | 1.6 |
| **Rollback** | Clientes antigos ignoram; usam endpoints velhos |
| **Métricas** | Requests/page ↓ · p95 ↓ |
| **Done** | Contract tests · doc |

### 3.2 Cache HTTP curto (ETag / Cache-Control) em GETs públicos — **P1**

| | |
|--|--|
| **Motivo** | `no-store` amplifica carga |
| **Impacto** | Escala barata |
| **Risco** | Médio (stale) — TTL 30–120s |
| **Esforço** | M |
| **Dependências** | 1.6 |
| **Rollback** | TTL=0 |
| **Métricas** | Hit ratio CDN/browser · origem RPS ↓ |
| **Done** | Doc caching |

### 3.3 OpenAPI → tipos TS gerados (web) — **P1**

| | |
|--|--|
| **Motivo** | Drift silencioso |
| **Impacto** | Manutenção |
| **Risco** | Baixo |
| **Esforço** | M |
| **Dependências** | OpenAPI export estável |
| **Rollback** | Manter tipos manuais em paralelo 1 release |
| **Métricas** | CI quebra em drift |
| **Done** | Script generate · CI |

### 3.4 Fix `searchProducts("")` / HomeStatsStrip — **P1**

| | |
|--|--|
| **Motivo** | Bug 422 → stats enganadoras |
| **Impacto** | UX homepage |
| **Risco** | Baixo |
| **Esforço** | S |
| **Dependências** | — |
| **Rollback** | Trivial |
| **Métricas** | Stats reais ou hidden |
| **Done** | Teste |

### 3.5 Rate limit básico (IP) na API pública — **P2**

| | |
|--|--|
| **Motivo** | Proteção SQLite sob crawl |
| **Trigger** | Abuso observado ou RPS spike |
| **Esforço** | M |
| **Nota** | Preferir reverse proxy (nginx) antes de Redis |

### 3.6 Auth utilizador web — **P2**

| | |
|--|--|
| **Motivo** | Precisa para alertas/watchlist web ricos |
| **Dependências** | Fase 5 |
| **Esforço** | L |

### 3.7 Materializar listas buy/wait no ciclo — **P3**

| | |
|--|--|
| **Trigger** | p95 deals endpoints &gt; orçamento com RPS real |
| **Esforço** | L |
| **Rollback** | Calcular on-read como hoje |

## Regras de execução — FASE 4 — Histórico

**Objetivo da fase:** histórico sustentável e estatisticamente defensável sem mudar de motor de BD ainda.

**Duração alvo:** 2–4 meses (contínuo)

### 4.1 Retenção hot `price_history` (ex. 90–180d) após summary OK — **P0**

| | |
|--|--|
| **Motivo** | Disco + WAL; auditorias de crescimento |
| **Impacto** | Sobrevivência multi-ano em VPS |
| **Risco** | Alto se summary incompleto — gate: summary health |
| **Esforço** | M |
| **Dependências** | 1.2, 1.10, backup |
| **Rollback** | Parar prune; cold export se já feito |
| **Métricas** | Tamanho BD · coverage summary ≥ threshold |
| **Done** | Testes prune · runbook |

### 4.2 Tabela/visão `offer_current` por dual-write (shadow) — **P0**

| | |
|--|--|
| **Motivo** | Parar scans a `offers` para “último preço” sem apagar `offers` |
| **Impacto** | Performance API gradual |
| **Risco** | Médio (consistência dual-write) |
| **Esforço** | L |
| **Dependências** | Ingest path único |
| **Rollback** | Leituras continuam em `offers`; shadow ignorada |
| **Métricas** | Diff current vs MAX(offers) = 0 em sample diário |
| **Done** | Testes dual-write · doc |

### 4.3 Migrar leituras “latest offer” da API → `offer_current` (flag) — **P0**

| | |
|--|--|
| **Motivo** | Colher benefício de 4.2 |
| **Impacto** | Latência |
| **Risco** | Médio |
| **Esforço** | M |
| **Dependências** | 4.2 estável ≥2 semanas |
| **Rollback** | Flag off |
| **Métricas** | p95 product/search ↓ · explain query |
| **Done** | Benchmark doc |

### 4.4 Compactar `offers`: política “não crescer para sempre” — **P1**

| | |
|--|--|
| **Motivo** | `offers` append eterno = bomba |
| **Impacto** | Disco |
| **Risco** | Alto — só após 4.2/4.3 e archive |
| **Esforço** | L |
| **Dependências** | 4.1–4.3, backup |
| **Rollback** | Restaurar archive |
| **Métricas** | Rows offers estáveis |
| **Done** | Runbook |

### 4.5 Timezone merchant em DailyBar (Europe/Lisbon default) — **P1**

| | |
|--|--|
| **Motivo** | Dia comercial ≠ UTC truncado |
| **Impacto** | Qualidade sazonalidade |
| **Risco** | Médio (rebuild parcial) |
| **Esforço** | M–L |
| **Dependências** | Summary builder |
| **Rollback** | Manter UTC date legacy column |
| **Métricas** | Diff bars boundary days |
| **Done** | Testes DST |

### 4.6 Histórico por loja no chart (API+web) — **P1**

| | |
|--|--|
| **Motivo** | Gap vs Keepa; dados já existem |
| **Impacto** | UX forte |
| **Risco** | Baixo–médio payload |
| **Esforço** | M |
| **Dependências** | 1.3 |
| **Rollback** | UI só série agregada |
| **Métricas** | Uso toggle loja |
| **Done** | Doc |

### 4.7 Export Parquet cold — **P3**

| | |
|--|--|
| **Trigger** | BD hot &gt; ~30–50GB após retenção 4.1, ou restore lento |
| **Esforço** | L |
| **Rollback** | Parar export; hot intacto |
| **Nota** | Não é P0 |

### 4.8 Postgres cutover — **P3**

| | |
|--|--|
| **Trigger** | Lock errors frequentes ou multi-writer necessário ou BD &gt; limiar operacional pós-retenção |
| **Esforço** | XL |
| **Método** | Sync/replicação lógica ou downtime curto controlado — não rewrite app |
| **Rollback** | SQLite continua SoR até cutover confirmado |
| **REJEITADO como fase precoce** | Ver lista REJEITADO |

## Regras de execução — FASE 5 — Alertas

**Objetivo da fase:** alertas reais no web sem mentir; reutilizar infra Telegram.

**Duração alvo:** 4–8 semanas

### 5.1 Web → cria alerta no backend existente (Telegram user link) — **P0**

| | |
|--|--|
| **Motivo** | Substituir form falso por fluxo real |
| **Impacto** | Paridade mínima Keepa |
| **Risco** | Médio (auth/Telegram deep link) |
| **Esforço** | L |
| **Dependências** | 1.5 removido; bot `/alertar` |
| **Rollback** | Só CTA Telegram manual |
| **Métricas** | Alertas criados/dia · delivery rate |
| **Done** | E2E · doc |

### 5.2 Fila durable de notificações (tabela SQLite) — **P1**

| | |
|--|--|
| **Motivo** | Perda in-memory / picos |
| **Impacto** | Fiabilidade |
| **Risco** | Baixo–médio |
| **Esforço** | M |
| **Dependências** | — |
| **Rollback** | Path sync antigo |
| **Métricas** | Pending depth · fail rate |
| **Done** | Testes · sem Redis |

### 5.3 Watchlist web (read das tabelas user_* existentes) — **P1**

| | |
|--|--|
| **Motivo** | Infra já existe no bot |
| **Impacto** | Retenção |
| **Risco** | Médio (identidade user) |
| **Esforço** | L |
| **Dependências** | 5.1 auth bridge |
| **Rollback** | Feature off |
| **Métricas** | Watchlists ativas |
| **Done** | Doc |

### 5.4 Email alerts — **P2**

| | |
|--|--|
| **Motivo** | Canal extra |
| **Dependências** | Provider email + 5.2 |
| **Esforço** | L |
| **Rollback** | Disable channel |
| **Não começar** sem 5.1 estável |

### 5.5 Extensão browser — **P2**

| | |
|--|--|
| **Esforço** | XL |
| **Dependências** | API agregada + auth |
| **Nota** | Não é integridade; é distribuição |

## Regras de execução — FASE 6 — Escala

**Objetivo da fase:** crescer merchants/produtos medido, sem stack nova por defeito.

**Só avançar itens P3 com trigger verde.**

### 6.1 Workers de ingestão por merchant (processos), mesmo código — **P1→P3**

| | |
|--|--|
| **Pri efetiva** | P1 se ciclo &gt; budget; senão P3 |
| **Motivo** | Router sequencial alonga ciclo |
| **Impacto** | Throughput |
| **Risco** | Médio (SQLite writers!) — 1 writer de sync ou fila de write |
| **Esforço** | L |
| **Dependências** | Single-writer discipline |
| **Rollback** | 1 processo |
| **Métricas** | Cycle time · products/hour |
| **Done** | Doc ops |

### 6.2 Segundo provider afiliado real — **P1**

| | |
|--|--|
| **Motivo** | SPOF Awin é risco de negócio |
| **Impacto** | Resiliência catálogo |
| **Risco** | Alto (qualidade dados) |
| **Esforço** | XL |
| **Dependências** | MerchantRegistry adapters |
| **Rollback** | Disable provider flag |
| **Métricas** | Coverage SKUs · overlap EANs |
| **Done** | Onboarding doc |

### 6.3 Stubs CJ/TT: fail-closed / não “active” sem implementação — **P0** *(rápido, pode ir na Fase 1)*

| | |
|--|--|
| **Motivo** | Falsa sensação multi-merchant |
| **Esforço** | S |
| **Rollback** | N/A |
| **Done** | Teste config |

### 6.4 Observability (métricas exportáveis) — **P1**

| | |
|--|--|
| **Motivo** | Sem números não há triggers honestos |
| **Impacto** | Permite P3 disciplinados |
| **Risco** | Baixo |
| **Esforço** | M |
| **Nota** | Prometheus node ou logs estruturados + script; não “plataforma APM” |
| **Done** | `docs/METRICS.md` |

### 6.5 Postgres / Parquet / Redis / CH — **P3**

Ver triggers na secção REJEITADO / Fase 4.7–4.8.  
**Não calendário — checklist:**

| Tecnologia | Introduzir quando (todos ou o suficiente) |
|------------|-------------------------------------------|
| Parquet cold | Hot DB &gt;30–50GB pós-retenção ou restore &gt;RTO |
| Postgres | Lock storms ou &gt;1 writer inevitável ou tamanho pós-retenção inviável |
| Redis | p95 cache miss intolerável com CDN ou fila PG insuficiente |
| ClickHouse | Query interativa cross-catalog &gt;500M ticks com requisito de produto |
| Kafka/K8s/ES | Continua REJEITADO até evidência extrema |

## Regras de execução — FASE 7 — Arquitetura 2030+

**Objetivo da fase:** evolução estrutural sem segundo projeto. Só depois de Fases 1–5 maduras e triggers de escala.

### 7.1 Identity graph (`product_id` + aliases) — **P3**

| | |
|--|--|
| **Trigger** | Colisões EAN / bundles / multi-país |
| **Método** | Tabela Identity + dual-read; EAN continua a funcionar |
| **Esforço** | XL |
| **Rollback** | EAN path legado |

### 7.2 Migrações versionadas (ficheiros) em vez de só DDL no boot — **P2→P1**

| | |
|--|--|
| **Pri** | P1 quando schema changes &gt;N/trimestre |
| **Motivo** | Rollback e review |
| **Esforço** | L |
| **Método** | Expand/contract; boot deixa de fazer rebuilds destrutivos |
| **Rollback** | Down migration testada em staging |

### 7.3 SSR/ISR páginas produto — **P2**

| | |
|--|--|
| **Motivo** | SEO |
| **Dependências** | API agregada + cache |
| **Esforço** | L |

### 7.4 Multi-país (timezone, merchants, currency) — **P3**

| | |
|--|--|
| **Trigger** | Decisão de negócio EU |
| **Esforço** | XL |

### 7.5 Manter monólito modular — **política permanente**

| | |
|--|--|
| **Motivo** | Microserviços REJEITADOS sem dor real |
| **Done** | Code owners por pasta/context, não por repo |

## Cronograma indicativo (não rígido)

| Ano | Foco |
|-----|------|
| **2026 H2** | Fase 1 completa · início Fase 2–3 |
| **2027 H1** | Fase 2–3 Done · Fase 4 retenção + offer_current |
| **2027 H2** | Fase 5 alertas · 2º provider se negócio |
| **2028** | Fase 4 compactação · escala merchants medida · métricas maduras |
| **2029–2030** | P3 sob trigger (PG/Parquet/Identity) |
| **2031+** | Fase 7 conforme mercado EU |

Reavaliar REJEITADO anualmente com métricas — não com moda.

**Risco residual consciente:** Fase 4 retenção + compactação de `offers` é a zona de maior risco de dados. Exige backup, dry-run e gates de summary health. Não acelerar por pressão cosmética.

**Frase operacional:** cada PR deve deixar o Limiar tão utilizável quanto ontem, e um pouco mais honesto ou mais barato de operar — nunca “quase pronto depois da migração”.

# Exemplos

**Bom PR (evolução)**

- Extrai ConsumerDecision em módulo paralelo; flag off por defeito; testes de cegueira a comissão; UI antiga intacta; rollback documentado.
- Dual-write `offer_current` em shadow; leituras continuam em `offers`; diff diário = 0 antes de migrar reads.

**PR a rejeitar (reescrita)**

- “Migrar tudo para Postgres nesta sprint” sem trigger e sem dual-path.
- Apagar DecisionEngine e Telegram routing num único PR.
- Introduzir Kafka/K8s/ES porque uma auditoria listou “ideal”.

# Anti-padrões

Itens das auditorias que **não** entram neste roadmap. Motivo técnico explícito.

| Item rejeitado | Porquê REJEITADO |
|----------------|------------------|
| **Reescrita greenfield / big-bang Postgres no dia 1** | Viola Evolution over Revolution; SQLite ainda serve o footprint atual se retenção/API forem corrigidas. Postgres é **P3 com trigger**, não premissa. |
| **Microserviços** | Um monólito com 2 processos (worker+API) é operacionalmente simples. Serviços só quando equipas/deploy independente forem o bottleneck — hoje não são. |
| **Kubernetes** | Overhead sem frota de serviços nem multi-tenant. systemd + VPS (ou PaaS depois) chega. |
| **Kafka / event bus “enterprise”** | Sem fan-out massivo nem dezenas de consumidores. Eventos internos: funções/async/tabela outbox leve **se preciso**. |
| **ClickHouse no horizonte próximo** | Sem scans interativos 500M+ ticks nem multi-analistas. DailyBar + SQL + Parquet batch cobrem 5 anos no caminho evolutivo. |
| **Redis obrigatório** | Cache HTTP/CDN e SQLite/PG queue (`SKIP LOCKED` mais tarde) primeiro. Redis só com RPS/fila medidos. |
| **Elasticsearch / OpenSearch** | `q` atual e índices SQLite/FTS bastam até latência/recall falharem sob carga real. |
| **Migrar EAN→`product_id` como projeto autónomo imediato** | Correto a longo prazo, mas alto risco e pouco valor UX enquanto N for baixo. Fica **P3** / Fase 7, não P0. |
| **Abandonar heartbeats por completo** | Heartbeats ajudam coverage; o erro é tratá-los como samples iguais. Evolução: **tipar + excluir de stats**, não remover. |
| **Fila Redis/NATS só porque “in-memory é errada”** | Correto que in-memory perde no restart; mitigação evolutiva: **tabela SQLite durable** (P1), não novo broker. |
| **LLM para decisões de preço** | Explicitamente fora do produto. |
| **Extensão browser (P0)** | Alto esforço, distribuição, review stores; só depois de alertas/integridade. P2+. |
| **Multi-região / HA multi-AZ** | Prematuro sem SLO de uptime falhado e receita/tráfego. P3. |
| **B2B API metered** | Produto/negócio, não qualidade técnica imediata. P3. |
| **Substituir Next static por SSR em massa já** | Útil para SEO; não bloqueia integridade. P2 após API estável. |
| **Ports & Adapters em *todos* os módulos de uma vez** | Idealismo. Extrair ports **só** nas fronteiras que vamos dual-write (offers/history/decision). |
| **Remover Telegram do DecisionEngine num único PR gigante** | Evoluir: ConsumerDecision **paralelo** + feature flag; PublishScore continua a usar routing Telegram. |
| **“Parquet + dual-write cold” como P0** | Sem pressão de disco medida pós-retenção, é complexidade cedo. P3 após retenção hot. |
| **Cobertura “milhões de users” como meta de engenharia já** | Dimensionar quando métricas de tráfego existirem; não desenhar para fantasma. |

Onde as auditorias exageraram (já em REJEITADO): tratar SQLite como “morto já”; ports em todo o código; fila Redis imediata; `product_id` imediato; previsões P30/60/90 cedo sem calibração.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `NON_NEGOTIABLES` | Limites absolutos; roadmap não os enfraquece |
| `QUALITY_BAR` | Gate de merge de cada PR do plano |
| `PRODUCT_VISION_2030` | Direção de produto; este doc é como a engenharia entrega |
| `DATA_PRINCIPLES` / `ENGINEERING_PRINCIPLES` / `ARCHITECTURE_PRINCIPLES` | Princípios que os itens devem respeitar |
| `GOVERNANCE` / `README` | Hierarquia; auditorias não normativas |
| Auditorias (SCALE_5Y, FULL_TECHNICAL, IDEAL_ARCHITECTURE) | Fontes de contexto; itens aceites ou REJEITADOS aqui |

# Glossário

| Termo | Significado |
|-------|-------------|
| **P0** | Obrigatório para a fase / integridade |
| **P1** | Importante; seguir após P0 relevantes |
| **P2** | Melhoria; não bloqueia fase |
| **P3** | Só com trigger de escala medido |
| **S** | Esforço ≤3 dias (1 engineer) |
| **M** | 1–2 semanas |
| **L** | 3–6 semanas |
| **XL** | >6 semanas |
| **Done** | Testes CI + doc + métrica (+ rollback/flag quando aplicável) |
| **ConsumerDecision** | Veredicto BUY \| WAIT \| UNKNOWN para o comprador |
| **PublishScore** | Score editorial de publicação |
| **SoR** | System of record |
| **REJEITADO** | Explicitamente fora do plano evolutivo até revisão com métricas |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Reescrito na estrutura oficial. Fases 1–7, P0–P3, REJEITADO, DoD, cronograma e “não mexer” preservados. Fontes: auditorias SCALE_5Y, FULL_TECHNICAL_AUDIT, IDEAL_ARCHITECTURE_2026. Rejeição explícita de greenfield/big-bang. |
