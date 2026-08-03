# DATABASE_RULES.md — Limiar

# Objetivo

Definir as regras permanentes de persistência do Limiar: o que se guarda, como se separa, como se limpa, como se migra e quando se muda de motor.

Serve para que qualquer alteração à base de dados preserve a verdade dos preços e a operabilidade do sistema.

# Âmbito

## O que cobre

- Modelo mental de persistência: Current, Events, Aggregates.
- Writer lógico único no hot path.
- Dinheiro, tipagem e timestamps em storage.
- Retenção, prune e commit.
- Dual-write e evolução de schema.
- Backup e restore.
- Triggers para Postgres, cold storage e tecnologias relacionadas.
- Relação entre leitura (API GET) e escrita.

## O que não cobre

- DDL de tabelas concretas ou nomes de ficheiros de schema.
- SQL de queries de produto.
- Regras estatísticas completas (ver `DATA_PRINCIPLES`).
- Veredicto ao comprador (ver `CONSUMER_DECISION`).
- Escolha de ORM ou biblioteca de acesso.

# Princípios

1. Current ≠ Events ≠ Aggregates. Não se fundem para “facilitar queries”.
2. Um único writer lógico no catálogo e histórico hot, salvo migração explícita.
3. SQLite (ou o datastore operacional atual) é válido até trigger medido.
4. Retenção sem commit durável é falha. Limpeza ilusória é defeito.
5. Dinheiro em unidades inteiras (cents). Float monetário em storage novo é proibido.
6. GET de leitura não escreve na base.
7. Evolution over Revolution: dual-write e flags antes de cortar caminhos antigos.
8. Tecnologia nova de storage só com trigger mensurável. Nunca por moda.
9. Em conflito: verdade dos dados e `NON_NEGOTIABLES` prevalecem sobre performance e conveniência.

# Regras

## Modelo mental

1. **Current** — estado atual da oferta/produto. O que está à venda agora.
2. **Events** — observações pontuais no tempo (ticks). Factos, não conclusões.
3. **Aggregates** — resumos derivados (barras/períodos). Só a partir de observações reais elegíveis.
4. As três coleções conceptuais permanecem distintas na persistência, mesmo que fisicamente próximas.
5. Oferta atual e histórico não se substituem mutuamente.
6. Toda oferta atual exposta declara `observed_at`.

## Tipagem e dinheiro

7. Preços em storage novo: inteiros (cents). Sem float monetário novo.
8. Heartbeats, se persistidos, são tipados de forma inequívoca.
9. Imputados / carry-forward, se persistidos: `is_imputed=true` e `n_obs=0`.
10. É proibido apagar tipagem de heartbeat para os fazer parecer observações.
11. É proibido reescrever histórico passado com o preço atual.

## Writer e leitura

12. Um único writer lógico para catálogo e histórico hot, salvo migração explícita e controlada.
13. Horizontal scaling de writers desse hot path é anti-padrão até haver migração desenhada.
14. Handlers GET não escrevem estado na base.
15. Leituras podem escalar. Escritas de verdade do catálogo/histórico não se multiplicam por acidente.
16. Ingestão multi-processo, se existir, respeita disciplina de single-writer ou fila de escrita única.

## Aggregates e honestidade

17. Barra diária só existe se houver pelo menos uma observação real elegível nesse dia.
18. É proibido materializar dias sem observação como factos.
19. Heartbeats e imputados não entram nos cálculos agregados usados como evidência.
20. Ao agregar ou arquivar: só derivar de observações reais elegíveis já existentes.

## Retenção e prune

21. Ticks hot têm prazo máximo configurado.
22. Prune / DELETE de retenção só conta como sucesso se a transação for commitada de forma durável.
23. Prune de histórico detalhado só após aggregate/summary saudável segundo a política operacional.
24. Tipar heartbeats e excluí-los de estatísticas. Não os apagar como “solução” estatística.
25. Compactação de histórico append eterno (ex.: ofertas usadas como histórico) só após Current shadow estável, backup e gate de saúde.

## Dual-write e evolução

26. Antes de cortar leituras do caminho antigo: dual-write (shadow) com verificação de paridade.
27. Feature flag ou caminho de leitura legado permanece até paridade estável.
28. Campos novos em contratos públicos: opcionais ou anuláveis. Sem rutura sem versão nova.
29. Migração de schema: caminho para a frente, caminho de volta ou restauração, verificação de que o histórico não mente após a mudança.
30. Migrações destrutivas só com backup, dry-run quando possível, e janela consciente.
31. Extrair port de persistência só na fronteira em dual-write ou sob teste contra fakes — não em todo o código de uma vez.

## Backup e ops

32. Backup da base operacional é obrigatório em produção (frequência mínima diária enquanto o SoR for ficheiro único / VPS).
33. Restore drill periódico. Backup sem restore testado não conta como proteção completa.
34. Health/readiness reflecte frescura de ingestão e capacidade de servir dados — não só “processo vivo”.
35. Segredos de acesso à base fora do Git e fora de logs.

## Triggers de evolução (não defaults)

36. **Cold storage / arquivo (ex. Parquet batch):** hot DB > ~30–50GB após retenção correcta, ou restore acima do RTO.
37. **Postgres (ou motor client/server):** lock storms frequentes, ou multi-writer inevitável, ou tamanho pós-retenção operacionalmente inviável.
38. **OLAP dedicado:** só com scans analíticos interativos reais que o SQL atual não serve.
39. **Cache distribuída / broker / search engine:** só com bottlenecks medidos (ver `ARCHITECTURE_PRINCIPLES` / `ROADMAP_V2`).
40. Enquanto os triggers não se verificarem: SQLite (ou SoR atual) permanece válido.
41. Big-bang Postgres no dia 1 / reescrita greenfield de storage: rejeitado.

## Filas e estado operacional na BD

42. Filas duráveis de notificação/publicação preferem tabela na mesma disciplina operacional (ex. SQLite) antes de broker externo.
43. Estado editorial necessário à sobrevivência de restart persiste; fila só em memória é insuficiente para produção séria de publicação/alertas.

# Exemplos

## Corretos

- Dual-write de Current em shadow; leituras continuam no caminho antigo até diff diário = 0.
- Prune de ticks > N dias com commit e teste que prova persistência.
- Preço guardado em cents; UI formata para euros.
- GET de produto não atualiza monitoring nem outra tabela de escrita.
- Barra diária omitida num dia sem observação real.

## Incorretos

- DELETE de retenção sem commit.
- Fundir Current e Events numa só coleção “para simplificar”.
- Segundo processo a escrever no hot path sem fila/single-writer.
- Migrar para Postgres nesta sprint sem trigger e sem dual-path.
- Fabricar barras para todos os dias do calendário com último preço.
- GET que faz upsert “porque é conveniente”.

# Anti-padrões

- Tratar SQLite como “morto” sem métrica de locks, disco ou writer.
- Parquet/ClickHouse/Redis como P0 sem pressão medida pós-retenção.
- Ports de persistência em todos os módulos de uma vez.
- Limpeza cosméticas de heartbeat que apaga tipagem necessária às estatísticas.
- Compactar `offers`/histórico sem backup e sem Current shadow.
- “Quase pronto depois da migração” — o sistema tem de continuar utilizável em cada passo.
- Expor path absoluto da base em health público.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `NON_NEGOTIABLES` | Regras 29–32, 40, 45–48, 54. Prevalece. |
| `DATA_PRINCIPLES` | Elegibilidade estatística; este doc define como persistir sem mentir. |
| `ARCHITECTURE_PRINCIPLES` | Writer único, triggers, Current/Events/Aggregates. |
| `ENGINEERING_PRINCIPLES` | SQLite até prova; migrações; um writer. |
| `CONSUMER_DECISION` | Consome evidência; não define storage. |
| `QUALITY_BAR` | Checklist de merge (cents, GET read-only, retenção). |
| `ROADMAP_V2` | Fase 1 retenção/commit; Fase 4 offer_current/prune; P3 PG/Parquet. |
| `README` / `GOVERNANCE` | Hierarquia e processo. |

Em conflito: `NON_NEGOTIABLES` > `ARCHITECTURE_PRINCIPLES` / `ENGINEERING_PRINCIPLES` / `DATA_PRINCIPLES` > este documento se divergir — na prática este documento **especializa** persistência já fixada; não a enfraquece.

# Glossário

| Termo | Definição |
|-------|-----------|
| **Current** | Estado atual conhecido de oferta/produto. |
| **Events (ticks)** | Observações pontuais no tempo. |
| **Aggregates (barras)** | Resumos derivados de observações reais elegíveis. |
| **Writer lógico** | Único caminho autorizado a mutar catálogo/histórico hot. |
| **Hot** | Dados de trabalho recente (ticks detalhados, estado atual). |
| **Cold** | Arquivo de ticks antigos fora do hot path. |
| **Retenção** | Prazo e política de quanto tempo se guarda cada tipo de dado. |
| **Prune** | Remoção controlada de dados fora da retenção. |
| **Dual-write** | Escrever no caminho novo e no antigo em paralelo até paridade. |
| **SoR** | System of Record — fonte de verdade operacional. |
| **Cents** | Unidades monetárias inteiras mínimas. |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Documento canónico criado. Consolida `NON_NEGOTIABLES`, `DATA_PRINCIPLES`, `ARCHITECTURE_PRINCIPLES`, `ENGINEERING_PRINCIPLES` e fases 1/4/6 de `ROADMAP_V2` (incluindo REJEITADO: big-bang Postgres, Parquet/CH prematuros). Sem novas funcionalidades. |
