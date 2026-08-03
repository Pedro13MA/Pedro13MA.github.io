# ARCHITECTURE_PRINCIPLES.md — Limiar

# Objetivo

Orientar fronteiras, dependências e evolução estrutural.

Não descrever implementação, classes nem esquemas.

Manter Evolution over Revolution: simplicidade e sistema a funcionar prevalecem sobre pureza arquitetural. A honestidade das fronteiras de decisão nunca se sacrifica.

# Âmbito

## Cobre

- Camadas e direção de dependência.
- Bounded contexts conceptuais e responsabilidades.
- Fronteiras (decisão, publicação, afiliado, canal, ports).
- Current / Events / Aggregates.
- Persistência lógica (writer único; datastore operacional até triggers).
- Integrações, API de leitura, frontend como cliente, papéis de backend, Telegram como adapter.
- Publicação vs ConsumerDecision; PublishScore.
- Escalabilidade e triggers de evolução futura.
- Resolução de conflitos estruturais e teste de mudança.

## Não cobre

- Caminhos de ficheiros, nomes de classes ou código.
- Stacks concretas como default (só como candidatos sob trigger medido).
- Copy de produto, UI detalhada ou planos de sprint.
- Regras estatísticas finas (ver `DATA_PRINCIPLES.md`).

# Princípios

1. Evolution over Revolution. Sem big-bang obrigatório.
2. Camadas exteriores dependem das interiores; o domínio não conhece canais nem adapters.
3. ConsumerDecision ≠ PublishScore. Decisão de compra não mistura afiliado nem pacing.
4. Current ≠ Events ≠ Aggregates.
5. Ports & Adapters só nas fronteiras que migramos — não em todo o sítio de uma vez.
6. SQLite (ou equivalente operacional atual) é aceitável até triggers medidos.
7. Tecnologia nova entra só atrás de um port, quando um trigger mensurável o exigir.
8. Utilidade e verdade dos dados acima do ego técnico.
9. Acoplamento pragmático dentro de um contexto é aceitável; misturar decisão de compra com publicação ou afiliado não é.

# Regras

## Camadas

O sistema organiza-se em camadas com responsabilidade única e direção de dependência clara:

1. **Canais** — apresentação e entrega (web, API pública, Telegram, futuros canais).
2. **Aplicação** — casos de uso: orquestrar leitura, escrita, decisão e publicação.
3. **Domínio** — regras de negócio estáveis: identidade de produto, evidência de preço, ConsumerDecision, políticas de honestidade.
4. **Ports** — contratos estáveis nas fronteiras (persistência, redes afiliadas, envio de mensagens, relógio/tempo).
5. **Adapters** — implementação concreta dos ports (bases de dados, feeds, SDKs de canal).
6. **Infraestrutura operacional** — processo, configuração, health, observabilidade.

**MUST:** camadas exteriores dependem das interiores; o domínio não conhece canais nem adapters.

## Dependências

- Direção permitida: Canal → Aplicação → Domínio ← Ports ← Adapters.
- Domínio e ConsumerDecision **nunca** dependem de afiliados, pacing editorial, receita ou detalhes de Telegram.
- PublishScore e publicação **podem** depender de sinais de canal, pacing e receita; ConsumerDecision **não**.
- Adapters dependem de ports; o núcleo não importa SDKs de rede ou de messaging.
- Tecnologia nova entra só atrás de um port, quando um trigger mensurável o exigir.
- Ciclos entre contextos são proibidos; se dois lados precisam um do outro, extrair um contrato partilhado mínimo ou um evento.

## Bounded contexts (conceituais)

Contextos com linguagem e dono próprios. Comunicação entre eles por contratos explícitos ou eventos — não por partilha íntima de estado.

| Contexto | Propósito |
|----------|-----------|
| **Catálogo e Identidade** | Produtos, variantes, lojas, identidade estável ao longo do tempo. |
| **Ingestão de Ofertas** | Entrada de feeds e ofertas observadas; normalização na fronteira. |
| **Histórico de Preços** | Current, Events e Aggregates — três conceitos, três responsabilidades. |
| **ConsumerDecision** | Veredicto comprar / esperar / não sabemos, só com evidência observada. |
| **Publicação Editorial** | O que, quando e onde publicar; PublishScore; pacing e diversidade. |
| **Alertas Pessoais** | Interesses e notificações do utilizador — distinto de publicação de canal. |
| **Afiliados e Tracking** | Comissões, deep links, disclosure — nunca como input de decisão de compra. |
| **Cupões e Promoções** | Ajuda contextual; não substituem preço observado nem ConsumerDecision. |
| **Pesquisa e Descoberta** | Encontrar produtos; não redefine o veredicto. |
| **API de Leitura** | Superfície estável de leitura para clientes. |
| **Web** | Experiência de decisão e descoberta no browser. |
| **Canal Telegram** | Adapter de canal: comandos, alertas e publicação outbound. |

Novos contextos só quando a linguagem diverge de forma estável — não por moda de microserviços.

## Responsabilidades

- **Domínio:** regras e invariantes; não I/O.
- **Aplicação:** sequenciar um caso de uso; transações lógicas; não política de UI.
- **Canais:** adaptar linguagem e formato ao meio; não recalcular decisão de compra com regras próprias.
- **Ingestão:** validar e tipar o que entra; rejeitar ou marcar o que não é observação real.
- **Histórico:** preservar honestidade temporal; nunca inventar amostras.
- **ConsumerDecision:** um veredicto + evidência + versão de política.
- **Publicação:** escolher e ritmar mensagens de canal; maximizar utilidade editorial sem mentir sobre o produto.
- **Afiliados:** monétizar o clique **depois** da decisão — nunca a definir.
- **Ops:** saúde, retenção, secrets, deploy — sem lógica de veredicto.

Uma responsabilidade por fronteira. Se um módulo “também publica” e “também decide comprar”, está mal cortado.

## Fronteiras

- Ports & Adapters **nas fronteiras que migramos** (ofertas, histórico, decisão, envio de canal). Não em todo o sítio de uma vez.
- Fronteira de decisão: tudo o que alimenta ConsumerDecision é evidência observável; o resto fica do lado de fora.
- Fronteira de publicação: pode ver o resultado de ConsumerDecision; não pode escrever nele.
- Fronteira de afiliado: começa no momento do link/CTA, não no motor de veredicto.
- Fronteira de canal: Telegram (e futuros canais) são adapters; o núcleo fala em intenções de notificação/publicação, não em APIs de bot.
- Contratos públicos evoluem por adição e versão; não por rutura silenciosa.
- Dual-write e flags antes de cortar caminhos antigos (Evolution over Revolution).

## Current / Events / Aggregates

- **Current** — estado atual da oferta/produto (o que está à venda agora).
- **Events** — observações pontuais no tempo (ticks); factos, não conclusões.
- **Aggregates** — resumos derivados (barras/períodos); nunca fabricados sem observações reais.

Regras estruturais:

- Os três planos não se confundem nem se substituem mutuamente.
- Heartbeats e imputações, se existirem, são tipados e **excluídos** de estatísticas de decisão.
- Eventos de domínio entre contextos são opcionais e leves; não pressupõem bus enterprise.
- Publicação e alertas consomem intenções (“notificar”, “publicar candidato”); não reescrevem o histórico.
- Falha a enviar para um canal não altera Current, Events, Aggregates nem ConsumerDecision.

## Persistência

- Um **único writer lógico** para catálogo e histórico hot (salvo migração explícita e controlada).
- Leituras podem escalar; escritas de verdade do catálogo/histórico não se multiplicam por acidente.
- SQLite (ou equivalente embutido/operacional atual) é **aceitável** até triggers medidos dizerem o contrário.
- Dinheiro em unidades inteiras; sem float monetário em storage novo.
- Retenção e prune são parte do contrato de verdade — limpeza sem compromisso durável é falha.
- Cold storage, warehouses analíticos ou bases especializadas só com pressão de disco, latência ou volume **medida**.
- Modelo mental: Current ≠ Events ≠ Aggregates também na persistência — coleções conceptuais distintas, mesmo que fisicamente próximas.

## Integrações

- Redes afiliadas e merchants entram por adapters de ingestão e de link — nunca pelo núcleo de decisão.
- Feeds oficiais / fontes contratadas preferidas a scraping opaco (risco e verdade).
- Timeouts, falhas e partial data são estados de primeira classe; não se mascaram com últimos preços inventados.
- Segredos e tokens ficam fora do código e dos logs.
- Cada integração tem dono de contexto (Ingestão, Afiliados, Canal) e contrato de erro explícito.
- Não adicionar broker, cache distribuída ou search engine “porque é standard”.

## API

- Superfície pública de produto/pesquisa/cupões é **predominantemente GET e read-only**.
- Escrita em handlers de leitura é proibida.
- Contratos estáveis: campos novos opcionais; ruturas só com versão nova.
- Respostas de decisão expõem ConsumerDecision (e evidência), não PublishScore disfarçado.
- Cache e freshness são política declarada; stale sem aviso não é “otimização”.
- A API não é o sítio para lógica editorial de canal.

## Frontend (Web)

- Cliente do contexto de decisão e descoberta — não segundo motor de scoring.
- Ordem de informação alinhada ao produto: veredicto → razão → onde comprar → evidência → detalhe.
- Não inventa histórico, mínimos ou certeza em falta na API.
- Jargão interno, scores de publicação e detalhes de afiliado não definem o conselho mostrado.
- Formulários e CTAs só se a ação completar de ponta a ponta (persistência real).
- Evolui com a API; não exige reescrita total do shell para corrigir integridade.

## Backend

- Dois papéis lógicos bastam no horizonte próximo: **worker/ingestão+publicação** e **API de leitura** — não microserviços por omissão.
- Núcleo de domínio partilhável; processos separados por necessidade operacional, não por dogma.
- Feature flags e rollback para comportamento de decisão e dados.
- Health/readiness reflecte frescura de ingestão e capacidade de servir verdade — não só “processo vivo”.
- Refactor só com motivo mensurável; preservar o que já entrega valor sem mentir.

## Telegram

- Telegram é **channel adapter**, não o core do Limiar.
- Responsabilidades do adapter: comandos de utilizador, entrega de alertas pessoais, publicação editorial outbound, UX conversacional.
- Não é fonte de verdade de preços nem dono de ConsumerDecision.
- Quiet hours, diversity caps e routing de tópicos vivem em Publicação Editorial — visíveis ao adapter, invisíveis ao ConsumerDecision.
- Alertas pessoais ≠ posts do canal.
- Falha de Telegram não corrompe catálogo, histórico nem veredicto de compra.
- Futuros canais (email, push, etc.) entram como adapters paralelos — o mesmo contrato de intenção.

## Publicação

- Contexto **Publicação Editorial** decide candidatos, ritmo e canal.
- Pode consultar o veredicto de ConsumerDecision como sinal; não o redefine.
- Ledger / dedupe / pacing protegem o canal de flood — são preocupações de publicação.
- Ordem e timing de posts não ordenam lojas na experiência de compra.
- Conteúdo publicado não pode contradizer a honestidade de evidência do produto.
- Separação estrutural: pipeline de publish ≠ pipeline de conselho ao comprador.

## ConsumerDecision

- Único dono do veredicto ao comprador: **BUY | WAIT | UNKNOWN** + evidência + versão de política.
- Inputs permitidos: ofertas atuais observáveis, histórico observado, metadados de amostra (cobertura, span, frescura).
- Inputs proibidos: comissão, EPC, caps editoriais, tópicos Telegram, quiet hours, revenue mix, “bom para o canal”.
- UNKNOWN é primeira classe; ausência de amostra não se força a BUY/WAIT.
- Determinismo: mesmos inputs + mesma política → mesmo resultado.
- Web, API e canais **consomem** o veredicto; não o recalculam com regras locais de negócio.
- Independência ética é invariante estrutural — não preferência de estilo.

## PublishScore

- Score (ou família de scores) para **merecimento e prioridade de publicação**, não para confiança de compra.
- Pode usar receita, pacing, diversidade, aptidão de canal e sinais de deal.
- Nunca é etiquetado na UI como “vale a pena comprar”, confiança ou Limiar de compra.
- Vive no contexto de Publicação Editorial (e inputs que este autorizar).
- Pode correlacionar-se empiricamente com boas compras — isso não autoriza fundir os modelos.
- Mudanças em PublishScore não exigem mudanças em ConsumerDecision, e vice-versa — salvo contratos explícitos de leitura.

## Escalabilidade

- Escalar o que dói: leitura, retenção, ingestão, fan-out de alertas — **depois** de medir.
- Preferir: retenção correcta, queries honestas, cache HTTP/CDN, um writer lógico, processos poucos e claros.
- Monólito modular com ports nas fronteiras > frota de serviços prematura.
- Horizontal scaling de writers de catálogo/histórico hot é anti-padrão até haver migração desenhada.
- Escala de produto (mais categorias) só com a mesma honestidade de decisão — não com mais infra “por capacidade”.

## Triggers para evolução futura

Tecnologia nova **só quando necessária**. Os itens abaixo são **gatilhos**, não defaults nem roadmap imediato.

| Trigger (medido) | Evolução candidata |
|------------------|--------------------|
| Pressão de disco / retenção hot esgotada após prune correcto | Cold storage / arquivo (ex. colunar em batch); não warehouse no dia 1 |
| Scans analíticos interativos sobre volume de ticks que SQL actual não serve | Motor analítico dedicado (ex. OLAP) — só com query load real |
| Fan-out de eventos com muitos consumidores e backpressure real | Bus/fila distribuída (ex. Kafka ou equivalente) — não “event-driven” decorativo |
| RPS de leitura ou filas onde cache HTTP + DB já não bastam | Cache distribuída (ex. Redis) com dono e TTL claros |
| Latência/recall de pesquisa falhados sob carga real | Motor de search dedicado (ex. ES/OpenSearch) |
| Limites de concorrência/escrita ou HA do writer único comprovados | Migrar writer lógico para motor client/server (ex. Postgres) com plano strangler |
| Vários serviços com deploy/equipas independentes como bottleneck | Extrair serviços; não antes |
| Frota multi-serviço e multi-tenant operacionalmente justificada | Orquestração pesada (ex. Kubernetes) — VPS/systemd/PaaS primeiro |
| SLO de uptime falhado com impacto de negócio | HA multi-AZ / multi-região |
| Fronteira estável a dual-write ou a testar contra fakes | Extrair port nessa fronteira (Ports & Adapters incremental) |

**Rejeitado como premissa:** microserviços, K8s, Kafka, ClickHouse, Redis, Elasticsearch ou reescrita greenfield **sem** o trigger correspondente.

## Resolução de conflitos

Quando pureza e pragmatismo colidem:

1. O sistema permanece utilizável (sem big-bang obrigatório).
2. A fronteira ConsumerDecision ↔ afiliado/publicação **não** se negocia.
3. Current / Events / Aggregates **não** se fundem para “facilitar”.
4. Simplicidade operacional vence diagrama ideal.
5. Ports & Adapters avançam por fronteira necessária, não por cobertura total.
6. Em dúvida: serve o comprador e a verdade dos dados antes do ego técnico.

## Teste rápido de qualquer mudança estrutural

1. Mantém ConsumerDecision cego a receita e canal?
2. Mantém Current ≠ Events ≠ Aggregates?
3. Telegram/afiliado continuam adapters, não núcleo?
4. GET continua read-only; writer de catálogo/histórico continua singular?
5. A mudança é evolução com rollback, não revolução?
6. Existe trigger mensurável se introduzir tecnologia nova?

Se falhar — não fazer.

# Exemplos

## Corretos

- Dual-write e feature flag antes de cortar caminho antigo.
- Extrair port só na fronteira em dual-write ou a testar contra fakes.
- API GET read-only; ConsumerDecision + evidência na resposta; PublishScore fora do conselho ao comprador.
- Frontend consome veredicto da API; não recalcula BUY/WAIT com regras locais.
- Telegram envia alertas/posts; falha de envio não altera histórico nem veredicto.
- Publicação lê ConsumerDecision; não escreve nele.
- Writer lógico único no hot path; leituras podem escalar.

## Incorretos

- Domínio a depender de SDK de messaging ou de comissão afiliada.
- Frontend como segundo scorer de compra.
- Fundir Current, Events e Aggregates “para simplificar queries”.
- Microserviços ou K8s sem trigger medido.
- Escrita em handler de leitura.
- Quiet hours ou revenue mix a entrar no motor de ConsumerDecision.
- Tratar Telegram como fonte de verdade de preços.

# Anti-padrões

- Ports & Adapters em todo o código “por pureza”.
- Frota de serviços prematura.
- Horizontal scaling de writers de catálogo/histórico hot sem migração desenhada.
- Broker, cache distribuída ou search engine “porque é standard”.
- PublishScore etiquetado como confiança de compra.
- Big-bang / reescrita greenfield sem necessidade.
- Ciclos entre bounded contexts.

# Relação com outros documentos

Hierarquia de conflito (o de cima prevalece):

`NON_NEGOTIABLES` > `VISION` > `PRODUCT_PRINCIPLES` > `ARCHITECTURE_PRINCIPLES` > `ENGINEERING_PRINCIPLES` > `DATA_PRINCIPLES` > Roadmap > Audits

| Documento | Papel |
|-----------|--------|
| `NON_NEGOTIABLES.md` | Regras absolutas verificáveis |
| `VISION.md` | Porque existimos |
| `PRODUCT_PRINCIPLES.md` | Como o produto fala e prioriza |
| **Este ficheiro** | Fronteiras, dependências e evolução estrutural |
| `ENGINEERING_PRINCIPLES.md` | Filosofia técnica e ordem de prevalência |
| `DATA_PRINCIPLES.md` | Verdade estatística e elegibilidade |
| `ROADMAP_V2.md` | Sequência evolutiva (não filosofia) |

# Glossário

| Termo | Definição |
|-------|-----------|
| **Camadas** | Organização Canal → Aplicação → Domínio ← Ports ← Adapters (+ infra operacional). |
| **Port** | Contrato estável numa fronteira (persistência, afiliado, messaging, tempo). |
| **Adapter** | Implementação concreta de um port. |
| **Bounded context** | Contexto com linguagem e dono próprios; comunicação por contrato ou evento. |
| **Current** | Estado atual da oferta/produto. |
| **Events** | Observações pontuais no tempo (ticks); factos, não conclusões. |
| **Aggregates** | Resumos derivados (barras/períodos); só a partir de observações reais. |
| **ConsumerDecision** | Veredicto ao comprador: BUY \| WAIT \| UNKNOWN + evidência + versão de política. |
| **PublishScore** | Score de merecimento/prioridade de publicação — não confiança de compra. |
| **Channel adapter** | Adaptador de canal (ex.: Telegram); não é o núcleo do Limiar. |
| **Writer lógico único** | Um escritor lógico para catálogo e histórico hot, salvo migração controlada. |
| **Trigger de evolução** | Condição medida que autoriza tecnologia ou forma nova — não é default. |
| **Evolution over Revolution** | Evoluir com rollback e dual-write; sem big-bang obrigatório. |

# Histórico

| Data | Alteração |
|------|-----------|
| 2026-08-03 | Reorganização na estrutura mandatória de doutrina. Conteúdo estrutural preservado; sem novas decisões; sem caminhos de ficheiros nem código. |
