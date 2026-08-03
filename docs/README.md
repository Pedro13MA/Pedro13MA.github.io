# README

# Objetivo

Índice oficial da documentação Limiar: hierarquia de autoridade, domínios, docs canónicos e como usar antes de implementar.

# Âmbito

Documentação normativa e de referência do produto Limiar (repos de engenharia e web).

Cópias canónicas vivem em `Documents/Limiar` e em `docs/` dos repositórios ativos.

# Princípios

Filosofia operacional:

- **Evolution over Revolution** — evoluir o que funciona; sem reescrita big-bang.
- **SQLite while margin** — manter SQLite enquanto margem operacional e retenção o permitirem; mudar de motor só com trigger medido.
- **Ports when needed** — extrair ports só nas fronteiras que vão dual-write ou migrar.
- **ConsumerDecision ≠ PublishScore** — conselho ao comprador ≠ score de publicação editorial.
- **Honesty > performance** — não inventar dados nem certeza para “parecer completo”.
- **Data > opinion** — métricas e evidência observável antes de preferência.
- **Utility > engineering** — utilidade para o comprador antes de pureza arquitetural.

# Regras

## Hierarquia de autoridade (conflito)

Em caso de conflito entre documentos, prevalece nesta ordem:

1. `NON_NEGOTIABLES`
2. `VISION`
3. `PRODUCT_PRINCIPLES`
4. `ARCHITECTURE_PRINCIPLES`
5. `ENGINEERING_PRINCIPLES`
6. `DATA_PRINCIPLES`
7. `PRODUCT_VISION_2030` (direção de produto; subordinada a 1–3)
8. `QUALITY_BAR` (gate de merge; não reabre negociações de 1–6)
9. `ROADMAP_V2` (plano; subordinado aos acima)
10. `GOVERNANCE` / `README` (processo e índice)
11. Auditorias e relatórios históricos — **não são norma**

Auditorias nunca override `NON_NEGOTIABLES`. Detalhe em `GOVERNANCE`.

## Domínios

| Domínio | Docs |
|---------|------|
| **Produto** | `VISION`, `PRODUCT_PRINCIPLES`, `PRODUCT_VISION_2030` |
| **Engenharia** | `ENGINEERING_PRINCIPLES`, `ARCHITECTURE_PRINCIPLES`, `ROADMAP_V2`, `QUALITY_BAR` |
| **Dados** | `DATA_PRINCIPLES`, `DATABASE_RULES`, `CONSUMER_DECISION`, partes de `NON_NEGOTIABLES` (verdade / histórico) |
| **Operações** | `SECURITY`, `QUALITY_BAR` (deploy/observabilidade), `GOVERNANCE`, runbooks pontuais em `docs/` (ex. `SECRETS.md`) |

`NON_NEGOTIABLES` e este `README` atravessam todos os domínios.

## Docs canónicos (norma)

| Documento | Propósito (uma linha) |
|-----------|------------------------|
| `NON_NEGOTIABLES` | Regras absolutas; quebrar = defeito |
| `VISION` | Porque existe, promessa, valores |
| `PRODUCT_PRINCIPLES` | Princípios de produto no dia a dia |
| `PRODUCT_VISION_2030` | Direção de produto até 2030 (utilizador) |
| `DATA_PRINCIPLES` | Regras de dados, histórico e evidência |
| `DATABASE_RULES` | Persistência, retenção, writer, migrações de storage |
| `CONSUMER_DECISION` | Veredicto ao comprador: BUY / WAIT / UNKNOWN |
| `ENGINEERING_PRINCIPLES` | Como escrever e evoluir código |
| `ARCHITECTURE_PRINCIPLES` | Limites de arquitetura e evolução |
| `QUALITY_BAR` | Checklist mínima para merge |
| `SECURITY` | Segredos, admin fail-closed, API, logs, privacidade operacional |
| `ROADMAP_V2` | Plano evolutivo por fases (2026–2031) |
| `GOVERNANCE` | Como atualizar docs e resolver conflitos |
| `README` (este) | Índice e hierarquia |

## Referências históricas (não normativas)

Informam contexto. **Não são norma.** Em conflito com docs canónicos, ignorar a auditoria.

| Documento | Nota |
|-----------|------|
| `LIMIAR_FULL_TECHNICAL_AUDIT` | Auditoria técnica pontual |
| `LIMIAR_IDEAL_ARCHITECTURE_2026` / `IDEAL_ARCHITECTURE` | Arquitetura ideal; muitas propostas rejeitadas no roadmap |
| `DESTRUCTION_DAY` / `DESTRUCTION_DAY_CTO` | Exercício crítico; não redefine regras |
| `SCALE_5Y` / `SCALE_5Y_ARCHITECTURE_REPORT` | Projeções de escala; triggers em `ROADMAP_V2` |
| `DEV_ENVIRONMENT_REPORT` | Estado do ambiente de desenvolvimento |

## Como usar antes de implementar uma feature

1. Confirmar que não viola `NON_NEGOTIABLES`.
2. Verificar alinhamento com `VISION` e, se for user-facing, `PRODUCT_PRINCIPLES` / `PRODUCT_VISION_2030`.
3. Se tocar dados/histórico ou veredicto: `DATA_PRINCIPLES`, `DATABASE_RULES` e `CONSUMER_DECISION`.
4. Se tocar desenho de sistema: `ENGINEERING_PRINCIPLES` + `ARCHITECTURE_PRINCIPLES`.
5. Se tocar segredos, admin, auth, logs sensíveis ou contactos: `SECURITY`.
6. Ver se o item está em `ROADMAP_V2` (prioridade, deps, rollback) ou se é exceção justificada.
7. Implementar com Evolution over Revolution (flags, dual-path, rollback).
8. Antes do merge: cumprir `QUALITY_BAR` (itens aplicáveis + sign-off).
9. Se a mudança alterar regra normativa: seguir `GOVERNANCE` (e bump de versão em `NON_NEGOTIABLES` se aplicável).

# Exemplos

- Feature de alerta web → ler `NON_NEGOTIABLES` (alertas), `PRODUCT_VISION_2030` (alertas honestos), item Fase 5 em `ROADMAP_V2`, depois `QUALITY_BAR`.
- Mudança de retenção de histórico → `DATA_PRINCIPLES` + Fase 4 `ROADMAP_V2` + backup/rollback; auditoria SCALE_5Y só como contexto de disco.
- Proposta “Postgres já” → consultar REJEITADO / triggers em `ROADMAP_V2`; não promover auditoria a norma.

# Anti-padrões

- Tratar auditoria como especificação vinculativa.
- Implementar feature sem passar por `NON_NEGOTIABLES` / `QUALITY_BAR`.
- Inventar docs paralelos que contradizem os canónicos sem passar por `GOVERNANCE`.
- Usar `ROADMAP_V2` para justificar violação de princípios de produto ou dados.

# Relação com outros documentos

Este ficheiro indexa os canónicos e as refs históricas. O processo de alteração está em `GOVERNANCE`. A barra de merge está em `QUALITY_BAR`.

# Glossário

| Termo | Significado |
|-------|-------------|
| Canónico / norma | Documento vinculativo para decisões e merge |
| Não normativo | Contexto; não obriga implementação |
| Domínio | Produto / Engenharia / Dados / Operações |
| SoT | Source of truth documental (hierarquia acima) |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Criação do índice oficial Limiar (hierarquia, domínios, canónicos, refs históricas, filosofia, fluxo pré-feature). |
