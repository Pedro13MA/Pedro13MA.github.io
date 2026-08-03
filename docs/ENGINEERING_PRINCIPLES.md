# ENGINEERING_PRINCIPLES.md — Limiar

# Objetivo

Definir a filosofia técnica permanente do Limiar.

Orientar como se constrói, o que prevalece em conflito e como testar uma decisão de engenharia.

Lema: Evolution over Revolution. Honestidade sobre cleverness. Sem tecnologia desnecessária.

# Âmbito

## Cobre

- Os 21 princípios de engenharia.
- Ordem de prevalência em conflitos.
- Empates frequentes e resposta canónica.
- Teste de qualquer decisão de engenharia.
- Relação com os outros documentos de doutrina.

## Não cobre

- Ficheiros, stacks concretas nem planos de sprint.
- Regras estatísticas detalhadas (ver `DATA_PRINCIPLES.md`).
- Fronteiras estruturais completas (ver `ARCHITECTURE_PRINCIPLES.md`).
- Copy de produto ou UI (ver `PRODUCT_PRINCIPLES.md`).

# Princípios

## 1. Simplicidade operacional

Preferir a solução mais simples que cumpre o requisito com honestidade e segurança.

Não introduzir serviços, brokers, caches ou bases novas enquanto o sistema atual aguenta com margem e métricas claras.

**Porquê:** Complexidade precoce é dívida disfarçada de maturidade.

## 2. Evolução incremental

O Limiar permanece utilizável em cada alteração. Sem reescritas big-bang, sem “parar para modernizar”.

Strangler, dual-write e feature flags antes de cortar caminhos antigos. Rollback documentado quando o comportamento muda.

**Porquê:** Um produto morto durante a migração deixa de servir o comprador.

## 3. SQLite até prova em contrário

SQLite (ou o datastore atual) é escolha válida enquanto latência, concorrência, tamanho e retenção estiverem dentro de limites observados.

Mudança de datastore exige triggers medidos, plano de migração e rollback — não preferência estética.

**Porquê:** A base certa é a que aguenta o footprint real, não a que impressiona no slide.

## 4. Domínios claros (DDD leve)

Modelar à volta de conceitos de negócio estáveis: evidência de preço, decisão do consumidor, publicação editorial, afiliados, alertas, identidade de produto.

Bounded contexts não partilham regras por conveniência. Nomes de domínio prevalecem sobre jargão de infraestrutura.

**Porquê:** O código sobrevive a stacks; os conceitos de negócio não devem misturar-se.

## 5. ConsumerDecision ≠ PublishScore

A decisão ao comprador (BUY / WAIT / UNKNOWN) é cega a receita, pacing editorial e comissões.

O score de publicação pode usar canal, receita e ritmo. Nunca etiquetar PublishScore como confiança de compra.

**Porquê:** Misturar os dois transforma inteligência em publicidade.

## 6. Ports & Adapters nas fronteiras que mudam

Isolar o domínio de I/O (feeds, HTTP, storage, messaging) atrás de portas estáveis quando há dual-write, troca de adapter ou testes sem infra.

Não extrair ports em todo o código “por pureza”. Extrair onde a mudança é real ou iminente.

**Porquê:** Adaptadores trocam; regras de evidência e decisão devem permanecer testáveis e estáveis.

## 7. SOLID com pragmatismo

- Uma razão de mudança por módulo (SRP).
- Estender por composição/portas, não por editar núcleos frágeis (OCP onde dói).
- Dependências apontam para abstrações nas fronteiras críticas (DIP).
- Interfaces pequenas e honestas (ISP).
- Substituir implementações sem mentir ao contrato (LSP).

Não forçar padrões onde um módulo linear e curto já é claro.

**Porquê:** SOLID serve a mudança segura, não a cerimónia.

## 8. Modularidade

Módulos com responsabilidade única e dependências explícitas. Evitar “god services” e imports circulares.

Partilhar tipos e contratos; não partilhar atalhos que acoplam ingestão, decisão e UI.

**Porquê:** Módulos isolados permitem evoluir um lado sem partir o outro.

## 9. Retrocompatibilidade

APIs e contratos públicos existentes não partem campos sem versão nova ou período de depreciação explícito.

Campos novos são opcionais ou anuláveis. Clientes antigos continuam a funcionar.

**Porquê:** O hub e a web (e futuros clientes) não podem ficar reféns de um deploy sincronizado perfeito.

## 10. Migrações como contratos

Toda mudança de schema ou de significado de dados tem:

1. caminho para a frente;
2. caminho de volta ou restauração;
3. verificação de que dados históricos não mentem após a mudança.

Migrações destrutivas só com backup, dry-run quando possível, e janela consciente.

**Porquê:** Dados de preço são a memória do produto; corrompê-los é falha existencial.

## 11. Observabilidade antes de otimismo

Se não se mede, não se afirma. Health, freshness de feeds, erros, latência e sinais de retenção/disco são cidadãos de primeira classe.

Logs sem segredos. Métricas com significado de negócio (amostra, span, veredictos), não só contadores de infra.

**Porquê:** Sem visibilidade, “está bem” é fé — e fé contradiz a honestidade do Limiar.

## 12. Performance sob evidência

Otimizar o que métricas e SLOs mostram. Página/API de produto: pedidos agregados sensatos, cache declarado, trabalho inútil proibido.

Proibir heartbeats ou jobs universais que incham a base sem benefício medido à decisão.

**Porquê:** Performance especulativa cria complexidade; performance medida protege o utilizador.

## 13. Testes como garantia de verdade

Regras de NON_NEGOTIABLES e contratos de decisão têm testes automatizados ou checks de release nomeados.

Preferir testes que protegem honestidade de dados e invariantes de domínio a testes que só espelham implementação.

Suite obrigatória verde antes de merge a linha principal.

**Porquê:** Sem testes, princípios são posters.

## 14. CI como portão, não como teatro

CI corre o que importa: testes obrigatórios, lint/typecheck úteis, scans de segredos quando aplicável, checks de release para P0.

Falhas bloqueiam merge. Checks cosméticos não atrasam entregas críticas sem valor.

**Porquê:** O portão existe para impedir mentiras e regressões, não para parecer “enterprise”.

## 15. Código limpo e legível

Nomes honestos. Funções curtas o suficiente para uma intenção. Comentários só quando o “porquê” não cabe no código.

Sem cleverness: preferir o óbvio ao engenhoso. Sem abstrações para um único uso.

**Porquê:** Código lê-se muitas mais vezes do que se escreve; a equipa futura somos nós.

## 16. Dívida técnica consciente

Dívida só com motivo, dono implícito (o próximo toque na área) e limite.

Pagar dívida quando bloqueia honestidade, segurança, evolução ou operabilidade. Não pagar só por estética arquitetural se o sistema serve bem.

Registar e priorizar; não acumular em silêncio.

**Porquê:** Dívida invisível vira revolução forçada — o oposto de Evolution over Revolution.

## 17. Segurança e segredos

Segredos fora do controlo de versões. Tokens fora de logs. Admin fail-closed. Dependências de produção com versão fixada em release.

Escrita só em métodos que a admitem por contrato.

**Porquê:** Compromisso de credenciais ou privilégios anula qualquer outra qualidade técnica.

## 18. Um writer lógico no hot path

No catálogo e histórico quente, um único writer lógico — salvo migração explícita e controlada.

Evitar corridas que corrompem observações ou inventam estados.

**Porquê:** Concorrência mal desenhada mente sobre preços.

## 19. Dinheiro e tempo com precisão

Valores monetários em unidades inteiras. Timestamps de observação obrigatórios em ofertas “atuais”. Separar estado atual, eventos e agregados.

Imputados e heartbeats nunca se fazem passar por amostras reais.

**Porquê:** Float e factos misturados destroem confiança estatística.

## 20. Sem tecnologia por ego

Microserviços, orquestradores, buses “enterprise”, search clusters e warehouses só entram com bottleneck medido e equipa/ops que os justifiquem.

LLM não decide preços. Scraping fora de feeds oficiais não é atalho aceite.

**Porquê:** Cada caixa nova é um modo de falha novo.

## 21. Teste de qualquer decisão de engenharia

Antes de aceitar uma mudança técnica, perguntar:

1. Mantém ou melhora a honestidade dos dados e do veredicto ao comprador?
2. Mantém o Limiar utilizável, com rollback ou compatibilidade?
3. É a solução mais simples que resolve o problema medido?
4. Continua compreensível daqui a anos?

Se falhar — rejeitar ou reduzir o âmbito.

# Regras

## Ordem de prevalência em conflitos

Quando dois princípios puxam em direções opostas, prevalece a ordem abaixo (o de cima ganha).

| Ordem | Princípio prevalecente | Cede |
|------:|------------------------|------|
| 1 | **Honestidade dos dados e ConsumerDecision** (inclui NON_NEGOTIABLES de verdade/ética) | Qualquer otimização, feature ou “DX” |
| 2 | **Segurança e privacidade** (segredos, fail-closed, mínimos de dados) | Conveniência de debug, atalhos de deploy |
| 3 | **Produto utilizável + Evolution over Revolution** (sem big-bang; rollback) | Pureza arquitetural, reescrita “ideal” |
| 4 | **Retrocompatibilidade de contratos públicos** | Refactors internos apressados que partem clientes |
| 5 | **Simplicidade operacional / sem tech desnecessária** (SQLite OK até triggers) | Stack “moderna” sem medição |
| 6 | **Observabilidade e testes/CI obrigatórios** | Velocidade de merge sem rede de segurança |
| 7 | **Performance medida e custos operacionais** | Micro-otimizações e abstrações prematuras |
| 8 | **Modularidade, DDD leve, Ports & Adapters, SOLID** | Monólito claro que ainda serve |
| 9 | **Código limpo e pagamento de dívida** | Cosmética sem impacto em 1–7 |

## Empates frequentes (resposta canónica)

- **Idealismo Ports & Adapters vs. entregar correção de integridade** → Integridade e evolução incremental primeiro; ports só na fronteira em mudança.
- **Postgres/serviço novo vs. SQLite atual** → SQLite até trigger medido; datastore novo é migração, não premissa.
- **PublishScore / receita vs. conselho ao comprador** → ConsumerDecision prevalece sempre na experiência de compra.
- **Velocidade vs. suite vermelha** → Suite e checks P0 prevalecem; reduzir âmbito da mudança.
- **Limpar dívida ampla vs. manter produção estável** → Estabilidade e honesty first; dívida por fatias com rollback.
- **Performance agressiva vs. honestidade de amostra** → Nunca “acelerar” inventando ou omitindo evidência.

## Obrigatório

- Se uma proposta técnica contradiz este documento e não atualiza explicitamente a ordem de prevalência — não fazer.
- Suite obrigatória verde antes de merge a linha principal.
- Segredos fora do Git; tokens fora de logs; admin fail-closed.
- ConsumerDecision cego a receita, pacing e comissões.
- Um writer lógico no hot path de catálogo/histórico, salvo migração controlada.
- Dinheiro em unidades inteiras; imputados/heartbeats não passam por amostras reais.

# Exemplos

## Corretos

- Dual-write + flag + rollback documentado antes de cortar caminho antigo.
- Extrair port só onde há dual-write, troca de adapter ou teste sem infra.
- Manter SQLite enquanto métricas de latência, concorrência, tamanho e retenção têm margem.
- Teste automatizado (ou check de release nomeado) para regra P0 de NON_NEGOTIABLES.
- CI a bloquear merge com suite vermelha ou check P0 falhado.
- PublishScore usado só para prioridade de publicação; UI de compra mostra ConsumerDecision.

## Incorretos

- Introduzir microserviços, bus ou warehouse sem bottleneck medido.
- Etiquetar PublishScore como confiança de compra.
- Partir campos de API pública sem versão ou depreciação.
- Merge com suite obrigatória a falhar.
- Float monetário em storage novo.
- Apagar tipagem de heartbeat para “acelerar” estatísticas.
- Reescrita big-bang “para modernizar” enquanto o produto serve.

# Anti-padrões

- Tecnologia por ego (K8s, Kafka, clusters de search, etc. sem trigger).
- Ports em todo o lado “por pureza”.
- CI cosmético que não protege verdade nem regressões.
- Dívida técnica acumulada em silêncio.
- Performance especulativa que inventa ou omite evidência.
- God services e imports circulares entre ingestão, decisão e UI.
- LLM a decidir preços.
- Scraping opaco como atalho em vez de feeds oficiais / fontes contratadas.

# Relação com outros documentos

Hierarquia de conflito (o de cima prevalece):

`NON_NEGOTIABLES` > `VISION` > `PRODUCT_PRINCIPLES` > `ARCHITECTURE_PRINCIPLES` > `ENGINEERING_PRINCIPLES` > `DATA_PRINCIPLES` > Roadmap > Audits

| Documento | Papel |
|-----------|--------|
| `VISION.md` | Porquê existimos |
| `PRODUCT_PRINCIPLES.md` | Como o produto fala e prioriza |
| `NON_NEGOTIABLES.md` | Regras absolutas verificáveis |
| `ARCHITECTURE_PRINCIPLES.md` | Fronteiras e evolução estrutural |
| `DATA_PRINCIPLES.md` | Verdade estatística |
| `ROADMAP_V2.md` | Sequência evolutiva (não filosofia) |
| **Este ficheiro** | Como construímos e o que cede a quê |

# Glossário

| Termo | Definição |
|-------|-----------|
| **Evolution over Revolution** | Evoluir com o produto utilizável; strangler, dual-write, flags e rollback — sem big-bang obrigatório. |
| **ConsumerDecision** | Veredicto ao comprador (BUY / WAIT / UNKNOWN), cego a receita e pacing. |
| **PublishScore** | Score de merecimento/prioridade de publicação — não confiança de compra. |
| **Ports & Adapters** | Isolar I/O atrás de contratos estáveis nas fronteiras que mudam. |
| **DDD leve** | Modelar por conceitos de negócio estáveis e bounded contexts, sem cerimónia excessiva. |
| **Writer lógico único** | Um escritor lógico no hot path de catálogo/histórico quente. |
| **Trigger medido** | Evidência quantitativa que autoriza mudança de datastore ou tecnologia. |
| **Suite obrigatória** | Conjunto de testes/checks que deve estar verde antes de merge à linha principal. |
| **Fail-closed (admin)** | Sem lista de admins configurada, zero privilégios admin. |
| **Dívida técnica consciente** | Dívida com motivo, dono implícito e limite; paga quando bloqueia honesty, segurança, evolução ou ops. |

# Histórico

| Data | Alteração |
|------|-----------|
| 2026-08-03 | Reorganização na estrutura mandatória de doutrina. Os 21 princípios, a tabela de prevalência e os empates frequentes foram preservados; sem novas decisões. |
