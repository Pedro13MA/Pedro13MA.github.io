# QUALITY_BAR

# Objetivo

Definir a barra mínima de qualidade para merge. Um PR só pode ser mergeado quando todos os critérios aplicáveis estão cumpridos (`[x]`) ou explicitamente `[N/A]` pelo revisor.

# Âmbito

Aplica-se a alterações em código, config, schema, UI, API, bot, docs normativos e operações que toquem o Lymiar.

Lê-se com: `VISION`, `NON_NEGOTIABLES`, `PRODUCT_PRINCIPLES`, `DATA_PRINCIPLES`, `ENGINEERING_PRINCIPLES`, `ARCHITECTURE_PRINCIPLES`, `ROADMAP_V2`, `GOVERNANCE`.

Não substitui `NON_NEGOTIABLES`. Se houver conflito, prevalece `NON_NEGOTIABLES`.

# Princípios

1. Evolution over Revolution — o Lymiar permanece utilizável em cada merge.
2. Critérios aplicáveis são obrigatórios; N/A sem marcação do revisor não conta.
3. Feature só está **DONE** quando todos os itens aplicáveis estão `[x]` ou `[N/A]` justificado.
4. Autor marca o que verificou; revisor confirma N/A um a um.
5. Merge bloqueado se qualquer linha aplicável faltar ou se `NON_NEGOTIABLES` for violado.

# Regras

## Como marcar

- `[x]` — verificado.
- `[N/A]` — categoria não se aplica (ex.: SEO em mudança só backend). Só conta se o revisor marcar explicitamente.
- Autor não pode omitir sozinho uma secção aplicável.

## 0. Doutrina (sempre)

- [ ] Não viola nenhum item de `NON_NEGOTIABLES`
- [ ] ConsumerDecision ≠ PublishScore (não misturados nem expostos como o mesmo)
- [ ] Sem features fingidas / “em breve” na UI principal
- [ ] Honestidade: sem certeza inventada; `UNKNOWN` permitido e preferível a forçar BUY/WAIT
- [ ] Evolution over Revolution: sem big-bang obrigatório; rollback possível

## 1. Produto

- [ ] Melhora a pergunta central: comprar / esperar / ainda não sabemos — ou é infraestrutura necessária a isso
- [ ] Serve o comprador antes do afiliado, canal ou ego técnico
- [ ] Claims absolutos só com condição observável; senão omitidos
- [ ] Métricas de preço expostas declaram `sample_days` e `span_days`, ou não são expostas
- [ ] Sem `sample_days` ≥ mínimo de produto → veredicto = `UNKNOWN` (não BUY/WAIT)
- [ ] PVPR / rótulo merchant não justifica “mínimo histórico” sozinho
- [ ] Cupão ≠ preço já aplicado, salvo cálculo explícito e verificável

## 2. UX

- [ ] No máximo **um** veredicto de compra na página de produto
- [ ] Ordem: veredicto → lojas → gráfico/análise
- [ ] Sem jargão interno na UI (rede afiliada, bot, mock, score interno, EAN fora de fluxo barcode)
- [ ] Botões/formulários só se a ação completar ponta a ponta
- [ ] Linguagem portuguesa, calma, sem hype
- [ ] Limitações (cobertura, atraso, lojas em falta) visíveis quando relevantes
- [ ] Disclosure de afiliado junto ao CTA de loja ou rodapé visível

## 3. Consistência

- [ ] Mesmos inputs + mesma `policy_version` → mesmo ConsumerDecision
- [ ] Web e API não contradizem o veredicto quando a flag está ativa
- [ ] Marca “Lymiar” única; nomes legado não como marca principal
- [ ] Ordenação de lojas na decisão: preço total disponível + stock — nunca comissão
- [ ] Alertas pessoais ≠ publicações do canal editorial

## 4. Código

- [ ] Diff mínimo e focado; sem refactor cosmética no mesmo PR
- [ ] Dinheiro novo em storage: unidades inteiras (cents); sem float monetário novo
- [ ] Estado atual / ticks / agregados tratados como conceitos separados
- [ ] Heartbeats e imputados excluídos de medianas/médias/percentis
- [ ] Carry-forward/imputados: se existirem, `is_imputed=true` e `n_obs=0`
- [ ] Sem substituição de histórico em falta pelo preço atual
- [ ] Um único writer lógico no catálogo/histórico hot (salvo migração explícita)

## 5. Performance

- [ ] Página de produto (flag on): ≤ **1** pedido agregado para conteúdo principal
- [ ] GET público produto/search: p95 < **800 ms** em ambiente de staging/prod medido, ou regressão < **10%** vs baseline
- [ ] Heartbeat só em conjuntos definidos (watch/hot/alerta) — nunca catálogo universal diário
- [ ] GET públicos declaram cache ou `no-store` explícito justificado
- [ ] UI: Lighthouse Performance ≥ **70** nas páginas tocadas (mobile), ou N/A se sem UI

## 6. Testes

- [ ] Suite obrigatória CI **verde** no PR
- [ ] Novos caminhos de decisão/dados: cobertura de testes nos ramos críticos ≥ **80%** das branches novas relevantes
- [ ] Caso feliz + pelo menos 1 falha / amostra insuficiente / edge documentado
- [ ] Se toca ConsumerDecision: teste de cegueira a comissão/EPC/caps editoriais
- [ ] Se toca histórico/stats: teste que heartbeat/imputado não entram nas métricas
- [ ] Se toca GET: teste/assert de que GET não escreve estado

## 7. Segurança

- [ ] Sem segredos no Git nem no diff
- [ ] Tokens/credenciais nunca em logs
- [ ] Handlers GET **read-only** (zero escrita)
- [ ] Admin fail-closed: sem lista de admins → zero privilégios
- [ ] Dependências de produção com versão fixada no release tocado
- [ ] Input externo validado; sem XSS/injection óbvios no surface tocado

## 8. Privacidade

- [ ] Contactos só com finalidade de alerta ou conta
- [ ] Sucesso de alerta só após registo persistido
- [ ] Alerta criado é listável e cancelável no mesmo canal
- [ ] Privacy policy alinhada ao comportamento real se a feature recolhe dados

## 9. Logs

- [ ] Erros relevantes logados com contexto acionável (sem PII excessiva)
- [ ] Sem tokens, secrets ou payloads sensíveis
- [ ] IDs de utilizador só no mínimo necessário
- [ ] Nível adequado (error/warn/info); sem spam de debug em produção

## 10. Telemetria

- [ ] Eventos/métricas novos têm nome estável e significado documentado numa linha
- [ ] Sem telemetria que exponha conselho de compra misturado com receita/afiliado
- [ ] Contadores de decisão distinguem BUY / WAIT / UNKNOWN quando aplicável
- [ ] N/A explícito se zero telemetria nova

## 11. Observabilidade

- [ ] Falhas do caminho novo são visíveis (log, métrica ou health) sem SSH ad-hoc
- [ ] Se toca ingestão/feed: readiness falha quando último sucesso > SLA configurado
- [ ] Latência/erro do endpoint crítico tem sinal observável (métrica ou log estruturado)
- [ ] Alertas operacionais novos (se houver) têm dono e condição clara

## 12. Monitorização

- [ ] Dashboard/health existente continua a refletir o estado real pós-change
- [ ] Sem regressão silenciosa: caminho crítico tem check manual ou automático pós-deploy
- [ ] Rollback path testado ou descrito em 3 linhas no PR

## 13. Tratamento de erros

- [ ] Erro utilizador: mensagem clara, sem stack/mock/slug interno
- [ ] Erro API: código HTTP coerente + corpo estável (sem campos partidos)
- [ ] Degradação: preferir `UNKNOWN` / vazio honesto a inventar dados
- [ ] Retries/timeouts definidos onde há I/O externo novo

## 14. Retrocompatibilidade

- [ ] APIs públicas existentes: sem remoção/renomeação de campos sem versão nova
- [ ] Campos novos opcionais/`null`-safe para clientes antigos
- [ ] Feature flag de decisão/dados tem rollback documentado
- [ ] Frontend/bot continuam a funcionar com respostas antigas (smoke mental ou teste)

## 15. SEO

- [ ] 404/páginas vazias sem mock, slug interno ou stack
- [ ] Sitemap só com URLs que resolvem conteúdo real
- [ ] Título indexável não afirma mínimo histórico sem regras de amostra (`sample_days` / N obs / span)
- [ ] Meta title/description úteis e honestos nas páginas tocadas
- [ ] N/A explícito se mudança pura backend/infra

## 16. Acessibilidade

- [ ] Interativos têm nome acessível (label/aria) nas UI tocadas
- [ ] Contraste de texto/ação ≥ AA nos elementos novos/alterados
- [ ] Foco por teclado visível em controlos novos
- [ ] Ordem de leitura coerente com a hierarquia visual (veredicto antes de detalhe)
- [ ] N/A explícito se sem UI

## 17. Documentação

- [ ] PR descreve o *porquê* e o plano de rollback
- [ ] Comportamento user-facing novo refletido em docs de produto/princípios se mudar regra
- [ ] Flags, `policy_version` e mínimos de amostra documentados se alterados
- [ ] Sem docs órfãos a contradizer o código

## 18. Revisão

- [ ] Diff revisto por segunda pessoa (ou self-review explícito se solo, com esta checklist anexada)
- [ ] Revisor confirma itens `[N/A]` um a um
- [ ] Sem TODO/FIXME bloqueantes deixados no caminho crítico
- [ ] Escopo do PR alinhado ao título; sem “já agora” não pedido

## 19. Deploy

- [ ] CI verde na branch a mergear
- [ ] Migrações (se houver): forward-only, reversíveis ou com plano de recovery
- [ ] Deploy não exige downtime não anunciado
- [ ] Pós-deploy: smoke do caminho tocado (produto, search, alerta ou API conforme o caso)
- [ ] Feature flag default seguro (off ou comportamento antigo) até validação

## Sign-off

| Papel | Nome | Data | Confirma |
|-------|------|------|----------|
| Autor | | | [ ] Critérios aplicáveis cumpridos; `NON_NEGOTIABLES` não violados |
| Revisor | | | [ ] Checklist revista; N/A explícitos OK; `NON_NEGOTIABLES` não violados |

**Merge bloqueado** se qualquer linha aplicável estiver em falta ou se `NON_NEGOTIABLES` for violado.

# Exemplos

**Passa merge**

- PR de API: CI verde; GET read-only testado; campos novos opcionais; secções SEO/a11y `[N/A]` marcadas pelo revisor; sign-off completo.
- PR de decisão: testes de cegueira a comissão; `UNKNOWN` com amostra insuficiente; p95 documentado ou sem regressão >10%; rollback por flag.
- PR só backend: Lighthouse `[N/A]`; UX/SEO `[N/A]` justificados; doutrina e testes aplicáveis `[x]`.

**Falha merge**

- CI vermelho na branch.
- Badge “mínimo histórico” com `sample_days` abaixo do mínimo.
- Formulário de alerta com mensagem de sucesso sem persistência.
- Autor marca SEO `[N/A]` sozinho; revisor não confirma.
- Dois veredictos de compra na mesma página de produto.
- GET de produto escreve em `product_monitoring`.

# Anti-padrões

- Rubber-stamp: marcar todas as secções `[N/A]` sem justificação item a item.
- Merge com CI vermelho “e depois corrige”.
- Self-merge sem checklist anexada quando se trabalha a solo.
- Declarar DONE com TODO/FIXME no caminho crítico.
- “Já agora” fora do título do PR.
- Inventar certeza (BUY/WAIT) quando a amostra exige `UNKNOWN`.
- Misturar PublishScore na UI como se fosse conselho de compra.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `NON_NEGOTIABLES` | Autoridade superior; violação bloqueia merge |
| `VISION` / `PRODUCT_PRINCIPLES` / `PRODUCT_VISION_2030` | Critérios de produto e UX |
| `DATA_PRINCIPLES` | Regras de histórico, heartbeats, imputados |
| `ENGINEERING_PRINCIPLES` / `ARCHITECTURE_PRINCIPLES` | Diff mínimo, writers, ports |
| `ROADMAP_V2` | Done de itens de roadmap exige esta barra |
| `GOVERNANCE` | Como alterar este documento |

# Glossário

| Termo | Significado |
|-------|-------------|
| Critério aplicável | Item da checklist que o diff pode afetar |
| N/A | Não aplicável; só válido com confirmação do revisor |
| DONE | Todos os itens aplicáveis `[x]` ou `[N/A]` justificado |
| ConsumerDecision | Veredicto BUY \| WAIT \| UNKNOWN para o comprador |
| PublishScore | Score de publicação editorial; não é conselho de compra |
| p95 | Percentil 95 de latência medida |
| Sign-off | Confirmação explícita de autor e revisor |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Reescrito na estrutura oficial (Objetivo…Histórico). Critérios 0–19 e lymiares (p95 800 ms, Lighthouse ≥70, cobertura ≥80% branches novas) preservados. |
