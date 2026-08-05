# CONSUMER_DECISION.md — Lymiar

# Objetivo

Definir o que é ConsumerDecision, o que pode e não pode entrar no veredicto ao comprador, qual a saída obrigatória, e como se relaciona com PublishScore, dados e canais.

Serve para que qualquer engenheiro implemente ou altere a decisão de compra sem inventar comportamento.

# Âmbito

## O que cobre

- Definição de ConsumerDecision.
- Veredictos `BUY`, `WAIT`, `UNKNOWN`.
- Evidência mínima e `policy_version`.
- Inputs permitidos e proibidos.
- Relação com PublishScore, afiliados, Telegram e UI.
- Determinismo e consistência entre superfícies.
- Critérios de amostra insuficiente.

## O que não cobre

- Implementação, ficheiros, APIs concretas ou schemas.
- PublishScore (merecimento editorial) — só a fronteira.
- Calibração empírica avançada (P30/60/90) — roadmap futuro, não norma atual de comportamento obrigatório.
- Copy exacto de ecrãs (ver `PRODUCT_PRINCIPLES` e `PRODUCT_VISION_2030`).

# Princípios

1. ConsumerDecision responde só a: comprar agora, esperar, ou ainda não sabemos.
2. Só conta evidência observada elegível. Não se inventa certeza.
3. ConsumerDecision é cego a comissão, EPC, caps editoriais, tópicos de canal, quiet hours, diversity e revenue mix.
4. UNKNOWN é veredicto de primeira classe. Não é falha de produto.
5. PublishScore não é confiança de compra e não define o veredicto ao comprador.
6. Mesmos inputs de evidência + mesma `policy_version` → mesmo veredicto.
7. Web, API e canais consomem o veredicto. Não o recalculam com regras locais de negócio.
8. Em conflito com conveniência ou receita: prevalecem `NON_NEGOTIABLES`, `VISION` e `DATA_PRINCIPLES`.

# Regras

## Definição

1. ConsumerDecision é o único dono do veredicto ao comprador.
2. Saída obrigatória: `BUY` | `WAIT` | `UNKNOWN` + `evidence` + `policy_version`.
3. `evidence` inclui pelo menos `sample_days`. Quando aplicável: `span_days`, frescura (`stale_hours` ou equivalente), e flags de métricas usadas (ex.: mínimo histórico só se elegível).

## Inputs permitidos

4. Ofertas atuais observáveis (com `observed_at`).
5. Histórico observado elegível (ticks/barras reais; sem heartbeat; sem imputados).
6. Metadados de amostra: `sample_days`, `span_days`, `n_obs`, frescura, identidade válida do produto.
7. Métricas derivadas só de observações elegíveis (mín/máx/mediana/percentis) quando a amostra cumpre a política.

## Inputs proibidos

8. Comissão, EPC, revenue mix.
9. Caps editoriais, quiet hours, diversity de publicação.
10. Tópicos Telegram, aptidão de canal, pacing de publicação.
11. PublishScore ou qualquer etiqueta de “bom para o canal”.
12. PVPR / preço original do merchant como substituto de histórico observado.
13. Heartbeats, carry-forward e valores imputados como evidência de BUY/WAIT.
14. Preço atual usado para preencher lacunas históricas.

## Amostra e UNKNOWN

15. Sem `evidence.sample_days` ≥ mínimo definido pela política de produto → saída = `UNKNOWN`.
16. Sem span mínimo quando a política o exigir → `UNKNOWN`.
17. Identidade de produto duvidosa → não fundir séries; preferir `UNKNOWN` ou séries separadas.
18. É proibido forçar `BUY` ou `WAIT` para evitar “buraco” de produto.

## Separação de PublishScore

19. PublishScore pode usar receita, pacing e canal. ConsumerDecision não.
20. PublishScore nunca é etiquetado na UI como confiança, índice de compra ou “vale a pena”.
21. Falha de routing de canal não altera ConsumerDecision.
22. Publicação pode ler ConsumerDecision como sinal. Não pode escrever nele nem redefini-lo.

## Superfícies

23. API de leitura expõe ConsumerDecision e evidência. Não expõe PublishScore como conselho de compra.
24. Frontend mostra no máximo um veredicto de compra e consome ConsumerDecision quando a flag estiver ativa.
25. Frontend não inventa BUY/WAIT/UNKNOWN com regras locais que contradigam a API.
26. Ordem de informação ao utilizador: veredicto → razão → onde comprar → evidência → detalhe.

## Política e evolução

27. Toda alteração de lymiares ou lógica de veredicto carrega `policy_version` nova ou explícita.
28. Feature flag e rollback documentados para mudanças de comportamento de decisão.
29. Extração/implementação faz-se em paralelo ao caminho editorial existente (Evolution over Revolution). Não apagar PublishScore num único passo.
30. Calibração e logging de outcomes são melhorias permitidas pelo roadmap. Não autorizam inventar veredictos sem amostra.

# Exemplos

## Corretos

- Amostra com `sample_days` abaixo do mínimo → `UNKNOWN` + evidence com `sample_days`.
- Preço perto do mínimo histórico elegível, amostra suficiente, sem input de comissão → `BUY` possível segundo a política.
- Preço alto face à mediana elegível, amostra suficiente → `WAIT` possível segundo a política.
- Publicação usa PublishScore para ordenar posts; a página de produto mostra só ConsumerDecision.
- Cupão mostrado como ajuda. Não altera sozinho o veredicto para `BUY`.

## Incorretos

- `BUY` porque a comissão é alta.
- `WAIT` porque o tópico Telegram está cheio ou quiet hours.
- `BUY` com uma observação e PVPR “−50%”.
- Mediana que inclui heartbeats usada para decidir.
- UI com Índice, Deal Score e “Confiança” a competir com o veredicto.
- Web a dizer `BUY` enquanto a API, com a flag ativa, devolve `UNKNOWN`.

# Anti-padrões

- Fundir DecisionEngine editorial com ConsumerDecision num único score “para simplificar”.
- Etiquetar PublishScore como “vale a pena comprar”.
- Forçar sempre um veredicto colorido para não mostrar “dados insuficientes”.
- Recalcular a decisão no frontend “só para copy”.
- Usar sazonalidade ou mínimo histórico sem amostra elegível.
- Fazer depender o veredicto de falha ou sucesso do Telegram.
- Big-bang que remove o caminho de publicação antes do ConsumerDecision estável com flag.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `NON_NEGOTIABLES` | Regras absolutas 8–12, 22–28, 55–56. Prevalece em conflito. |
| `VISION` | Pergunta central comprar / esperar / não sabemos. |
| `PRODUCT_PRINCIPLES` | Como comunicar o veredicto; conselho ≠ canal. |
| `PRODUCT_VISION_2030` | Direção UX: um veredicto, evidência, honestidade. |
| `DATA_PRINCIPLES` | Elegibilidade de amostra, heartbeat, null, PVPR. |
| `ARCHITECTURE_PRINCIPLES` | Contexto, fronteiras, canais como adapters. |
| `ENGINEERING_PRINCIPLES` | ConsumerDecision ≠ PublishScore; evolução incremental. |
| `QUALITY_BAR` | Checklist de merge para mudanças de decisão. |
| `ROADMAP_V2` | Fase 2: extração paralela, contrato de saída, flags. |
| `README` / `GOVERNANCE` | Hierarquia e processo de alteração. |

Este documento é norma de domínio **Decisão**. Em conflito: `NON_NEGOTIABLES` > `VISION` > `PRODUCT_PRINCIPLES` > `ARCHITECTURE_PRINCIPLES` > este documento se divergir de arquitetura estrutural — na prática este documento **especializa** a fronteira de decisão já fixada acima; não a enfraquece.

# Glossário

| Termo | Definição |
|-------|-----------|
| **ConsumerDecision** | Veredicto ao comprador com evidência e versão de política. |
| **BUY** | Comprar agora, segundo a política e amostra elegível. |
| **WAIT** | Esperar, segundo a política e amostra elegível. |
| **UNKNOWN** | Ainda não sabemos: amostra ou identidade insuficientes. |
| **evidence** | Pacote de amostra e métricas elegíveis que sustentam o veredicto. |
| **policy_version** | Identificador da política que produziu o veredicto. |
| **sample_days** | Dias distintos com pelo menos uma observação real elegível. |
| **span_days** | Extensão entre primeira e última observação real elegível. |
| **PublishScore** | Score de publicação editorial. Não é veredicto de compra. |
| **Observação elegível** | Preço observado real; não heartbeat; não imputado; não PVPR sozinho. |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Documento canónico criado. Consolida decisões de `NON_NEGOTIABLES`, `DATA_PRINCIPLES`, `ARCHITECTURE_PRINCIPLES`, `PRODUCT_PRINCIPLES`, `ENGINEERING_PRINCIPLES` e Fase 2 de `ROADMAP_V2`. Sem novas funcionalidades. |
