# DATA_PRINCIPLES.md — Limiar

# Objetivo

Definir a verdade estatística do produto.

Definir o que conta como dado, o que entra em estatísticas e o que é proibido fingir.

Toda regra deve ser verificável: o mesmo conjunto de observações elegíveis e a mesma política produzem o mesmo resultado.

# Âmbito

## Cobre

- O que é observação, tick, barra diária, oferta atual e histórico.
- Elegibilidade estatística (real vs heartbeat vs imputado vs null).
- Métricas de amostra (`sample_days`, `span_days`, `n_obs`).
- Dinheiro em cents; mínimos, máximos, médias, medianas, percentis e sazonalidade.
- PVPR, identidade de produto e dados insuficientes.
- ConsumerDecision quanto a evidência e amostra.
- Qualidade, integridade e retenção de dados de preço.

## Não cobre

- UI, copy de marketing ou layout.
- PublishScore, pacing editorial ou receita afiliada.
- Stack, ficheiros, schemas concretos ou planos de sprint.
- Roadmap de produto ou audits pontuais.

# Princípios

1. Só o que foi observado conta para estatísticas, mínimos históricos e veredictos temporais.
2. Ausência de dado ≠ dado; imputação ≠ observação; marketing do merchant ≠ histórico Limiar.
3. Em conflito entre conveniência e estas regras, a verdade observada vence.
4. O Limiar prefere admitir ignorância a simular omnisciência. Dados insuficientes não são falha de produto — são honestidade operacional.
5. Preferir menos métricas corretas a mais métricas contaminadas.
6. Current ≠ Events ≠ Aggregates. Um não substitui o outro.
7. Dados acima de opinião; utilidade acima de engenharia de conveniência.

# Regras

## Observação

**MUST**
- Cada observação tem preço em unidades monetárias inteiras (cents) e instante de observação (`observed_at`).
- Uma observação elegível para estatísticas é real, não heartbeat e não imputada.

**MUST NOT**
- Contar como observação um valor preenchido, extrapolado, copiado de outro dia, ou derivado só de PVPR / rótulo do merchant.
- Usar o preço atual para “completar” lacunas do passado.

## Tick

**MUST**
- Distinguir ticks de estado atual e de barras diárias.
- Preservar a tipagem do tick (observação real vs heartbeat vs outros tipos definidos) de forma inequívoca.

**MUST NOT**
- Tratar um tick tipado como heartbeat como se fosse observação estatística.
- Fundir ticks de produtos distintos sem identidade válida.

## Daily bar (barra diária)

**MUST**
- Uma barra diária só existe se houver pelo menos uma observação real elegível nesse dia.
- Campos agregados da barra (mín/máx/média/mediana/percentis do dia, `n_obs`) derivam só de observações elegíveis.

**MUST NOT**
- Materializar barra para um dia sem observações reais (“fabricar o dia”).
- Preencher barras em falta com o último preço conhecido, o preço atual, ou PVPR.
- Incluir heartbeats ou valores imputados no cálculo da barra.

## OfferCurrent (oferta atual)

**MUST**
- Toda oferta atual exposta declara `observed_at` (quando esse preço foi visto).
- Oferta atual e histórico são conceitos separados; um não substitui o outro.

**MUST NOT**
- Inferir histórico a partir só do estado atual.
- Apresentar oferta atual sem instante de observação.

## Histórico

**MUST**
- Separar sempre: estado atual ≠ eventos (ticks) ≠ agregados (barras).
- Declarar, em qualquer métrica histórica exposta, a amostra (`sample_days`, `span_days`) ou não expor a métrica.

**MUST NOT**
- Colapsar atual, eventos e agregados num único “histórico” sem distinguir a origem do valor.
- Expor “mínimo histórico”, percentil ou sazonalidade sem amostra declarada e elegível.

## Heartbeat

**MUST**
- Tipar heartbeats de forma explícita e duradoura.
- Excluir heartbeats de médias, medianas, percentis, mínimos/máximos históricos estatísticos e de `n_obs` de amostra.
- Evoluir heartbeats (tipar + excluir); não apagá-los só para “limpar” estatísticas.

**MUST NOT**
- Contar heartbeat como dia observado para `sample_days` / evidência de decisão.
- Usar heartbeat para justificar mínimo histórico, BUY/WAIT, ou claims de cobertura estatística.
- Fazer heartbeat universal diário em todo o catálogo; só em conjuntos definidos (ex.: watch/hot/alerta).

## Carry-forward

**MUST**
- Se existir carry-forward, marcar como imputado (`imputed` / `is_imputed=true`) e com `n_obs=0` nesse ponto.
- Excluir carry-forward de todas as estatísticas e de evidência de ConsumerDecision.

**MUST NOT**
- Apresentar carry-forward como preço observado.
- Usar carry-forward para preencher dias sem observação em barras ou em séries estatísticas.

## Imputed (imputado)

**MUST**
- Imputados são sempre identificados (`is_imputed=true`) e têm `n_obs=0`.
- Imputados são excluídos de médias, medianas, percentis, mín/máx históricos e amostras de decisão.

**MUST NOT**
- Misturar imputados com observações elegíveis no mesmo cálculo sem exclusão.
- Omitir a marca de imputado quando o valor não foi observado nesse instante.

## Null (ausência)

**MUST**
- Tratar null como “não sabemos o preço nesse ponto”.
- Propagar ausência até à decisão: amostra insuficiente ou métrica omitida.

**MUST NOT**
- Substituir null pelo preço atual, pelo último preço, por PVPR, por média inventada, ou por zero.
- Interpretar null como “preço estável” ou “sem alteração”.

## observed_at

**MUST**
- Existir em toda oferta atual exposta e em toda observação elegível.
- Ser o critério temporal da evidência (idade / staleness), não um timestamp de publicação editorial.

**MUST NOT**
- Usar hora de ingestão genérica, de renderização, ou de carry-forward como se fosse observação real, sem distinção.
- Expor preço “atual” sem `observed_at`.

## sample_days

**MUST**
- Contar só dias com observação real elegível (sem heartbeat, sem imputado).
- Acompanhar toda métrica de preço histórico exposta e toda evidência de ConsumerDecision.

**MUST NOT**
- Contar dias fabricados, dias só com heartbeat, ou dias só com carry-forward.
- Expor métrica histórica sem `sample_days` (ou equivalente explícito da política).

## span_days

**MUST**
- Calcular-se só sobre observações reais elegíveis.
- Ser declarado junto com `sample_days` em métricas históricas expostas.

**MUST NOT**
- Confundir `span_days` com `sample_days` (span longo com poucos dias observados ≠ amostra densa).
- Usar span de ticks heartbeat/imputados para cumprir mínimos de política.

## n_obs

**MUST**
- Para pontos imputados ou dias sem observação real: `n_obs=0`.
- Ser coerente com a exclusão de heartbeats e imputados.

**MUST NOT**
- Incrementar `n_obs` com heartbeat, carry-forward ou null preenchido.

## Dinheiro (cents)

**MUST**
- Persistir e calcular preços em inteiros (cents).
- Converter para apresentação só na fronteira de UI/texto.

**MUST NOT**
- Armazenar preços históricos/atuais como float em código novo.
- Introduzir erro de arredondamento que altere mín/máx/percentis de forma não determinada pela política.

## Mínimos

**MUST**
- Exigir N mínimo de observações/dias e span mínimo definidos pela política antes de afirmar “mínimo histórico”.
- Declarar amostra (`sample_days`, `span_days`) sempre que o mínimo for exposto.

**MUST NOT**
- Justificar mínimo histórico só com PVPR / preço “original” do merchant.
- Afirmar mínimo histórico com uma única observação, com amostra abaixo do limiar, ou com valores imputados/heartbeat.
- Usar o preço atual para inventar um mínimo passado.

## Máximos

**MUST**
- Usar a mesma elegibilidade (reais, não heartbeat, não imputados) e a mesma obrigação de declarar amostra.

**MUST NOT**
- Inflacionar máximos com PVPR não observado como preço de venda, nem com imputados.
- Expor máximo histórico sem amostra suficiente segundo a política (senão: omitir ou UNKNOWN / “dados insuficientes”).

## Médias

**MUST**
- Excluir heartbeats e imputados.
- Declarar `sample_days` e `span_days` (ou não expor).

**MUST NOT**
- Calcular média sobre série com nulls preenchidos por preço atual ou carry-forward.
- Apresentar média como “preço típico” com amostra abaixo do limiar sem o dizer.

## Medianas

**MUST**
- Excluir heartbeats e imputados.
- Preferir mediana a média quando a política de robustez o exigir; em qualquer caso, a elegibilidade é a mesma.

**MUST NOT**
- Incluir heartbeats “para estabilizar” a mediana.
- Usar mediana imputada como evidência de BUY/WAIT.

## Percentis

**MUST**
- Calcular-se só sobre elegíveis; declarar amostra.
- Tratar percentil do preço atual vs histórico como comparação temporal com evidência, não como marketing.

**MUST NOT**
- Misturar PVPR na distribuição de preços observados.
- Expor percentil com amostra insuficiente como se fosse preciso.

## Sazonalidade

**MUST**
- Exigir evidência suficiente para o grão temporal afirmado (ex.: “em novembro” exige vários novembros observados, não um ponto).
- Apresentar sazonalidade como hipótese suportada por dados, com limites de amostra.

**MUST NOT**
- Inventar sazonalidade a partir de PVPR, de calendário promocional do merchant, ou de dias fabricados.
- Afirmar padrão sazonal quando `sample_days` / `span_days` não cobrem o ciclo alegado.

## PVPR / preço de referência do merchant

**MUST**
- Separar visual e semanticamente PVPR de histórico observado.
- Tratar PVPR como atributo de marketing/contexto, nunca como ponto da série estatística.

**MUST NOT**
- Usar PVPR sozinho (nem PVPR + um ponto atual) para justificar mínimo histórico.
- Contar PVPR em médias, medianas, percentis ou `n_obs`.

## Identidade de produtos

**MUST**
- Fundir histórico só sob identidade válida e explícita pela política (ex.: mesmo identificador canónico / equivalência aprovada).
- Em dúvida de identidade: não fundir; preferir séries separadas ou UNKNOWN.

**MUST NOT**
- Misturar variantes relevantes (capacidade, cor/SKU material, condição, marketplace seller quando a política as distingue) num único histórico sem regra explícita.
- Transferir observações entre produtos por similaridade de título sem identidade válida.
- Usar comissão ou rede afiliada como sinal de identidade.

## Dados insuficientes

**MUST**
- Ser expressável como resultado de primeira classe (UNKNOWN / “ainda não sabemos”).
- Bloquear claims de mínimo histórico, sazonalidade e BUY/WAIT quando a evidência falha o limiar.

**MUST NOT**
- Forçar BUY ou WAIT para evitar “buraco” de produto.
- Compensar amostra fraca com PVPR, heartbeat, imputação ou preço atual repetido.

## ConsumerDecision

**MUST**
- Saída: `BUY` | `WAIT` | `UNKNOWN` + `evidence` + `policy_version`.
- `evidence` inclui pelo menos `sample_days` (e, quando aplicável, `span_days` e frescura).
- Ser cego a comissão, EPC, caps editoriais, tópicos de canal, quiet hours, diversity e revenue mix.
- Sem `evidence.sample_days` ≥ mínimo da política → `UNKNOWN`.
- Mesmos inputs de evidência + mesma `policy_version` → mesmo veredicto.

**MUST NOT**
- Importar PublishScore, pacing de publicação ou interesse afiliado para o veredicto.
- Produzir BUY/WAIT sem amostra elegível suficiente.
- Contradizer entre superfícies (web/API) o mesmo veredicto sob a mesma flag/política.

## Qualidade

**MUST**
- Rejeitar ou rebaixar (omitir métrica / UNKNOWN) dados que falhem elegibilidade ou tipagem.
- Preferir menos métricas corretas a mais métricas contaminadas.

**MUST NOT**
- “Melhorar” qualidade preenchendo buracos.
- Expor séries ou scores que misturem tipos sem exclusão estatística.

## Integridade

**MUST**
- Qualquer transformação preservar a distinção observação vs imputado vs heartbeat.
- Prune/retenção de ticks hot cumprir prazo e persistir de forma atómica (sem perda silenciosa a meio).
- Alterações de política de decisão/dados terem versão (`policy_version`) e rollback conceptual.

**MUST NOT**
- Reescrever histórico passado com o preço atual.
- Apagar tipagem de heartbeat para os fazer “parecer” observações.
- Tratar falha de retenção sem commit como sucesso.

## Retenção

**MUST**
- Definir prazo máximo para ticks hot; respeitá-lo com operação completa (commit).
- Ao agregar ou arquivar: só derivar de observações reais elegíveis já existentes.
- Tipar heartbeats e mantê-los fora das estatísticas em vez de os apagar como “solução” estatística.

**MUST NOT**
- Criar barras para dias nunca observados só para “continuidade” visual.
- Descartar evidência de tipagem necessária à exclusão estatística.
- Confundir retenção operacional com licença para imputar.

## Resolução de conflitos

| Conflito | Vence |
|---|---|
| Gráfico bonito vs dia sem observação | Não fabricar o dia |
| Cobertura / heartbeat vs mediana | Heartbeat fora da mediana |
| Continuidade visual vs null | Null permanece; sem fill com preço atual |
| PVPR atrativo vs mínimo histórico | PVPR não justifica mínimo |
| Comissão / publish vs ConsumerDecision | ConsumerDecision cego a receita |
| Feature “sempre tem veredicto” vs amostra fraca | UNKNOWN |
| Conveniência de implementação vs estas regras | Estas regras |

# Exemplos

## Corretos

- Dia sem observação real: não materializar barra; null permanece.
- Heartbeat tipado: confirmado na cobertura operacional; excluído de mediana, média, percentis, mín/máx e `n_obs`.
- Carry-forward presente: `is_imputed=true`, `n_obs=0`; fora de estatísticas e de evidência de ConsumerDecision.
- Mínimo histórico exposto com `sample_days` e `span_days` que cumprem a política, só com observações elegíveis.
- Oferta atual com `observed_at` explícito; histórico em ticks/barras separado.
- Amostra abaixo do limiar → `UNKNOWN` / “dados insuficientes”; métrica omitida se não puder declarar amostra.
- PVPR mostrado como contexto de merchant, separado do histórico observado.
- Identidade duvidosa → séries separadas ou UNKNOWN; sem fusão.

## Incorretos

- Preencher lacunas do passado com o preço atual.
- Fabricar barra diária sem observação real nesse dia.
- Contar heartbeat como dia em `sample_days` ou como evidência de BUY/WAIT.
- Apresentar carry-forward como preço observado.
- Expor “mínimo histórico” só com PVPR, ou com uma única observação.
- Misturar atual, ticks e barras num único “histórico” sem origem clara.
- Forçar BUY/WAIT para evitar buraco de produto.
- Usar PublishScore ou comissão como input de ConsumerDecision.
- Apagar tipagem de heartbeat para “limpar” estatísticas.
- Tratar prune sem commit como retenção concluída.

# Anti-padrões

- Gráfico contínuo fabricado a partir de nulls preenchidos.
- Heartbeat universal diário em todo o catálogo.
- “Mínimo histórico” justificado por rótulo do merchant.
- Veredicto sempre presente mesmo com amostra fraca.
- Float monetário em persistência nova.
- Reescrita silenciosa do passado com o presente.
- Fusão de variantes por título semelhante sem identidade válida.
- Confundir `span_days` longo com amostra densa (`sample_days`).

# Relação com outros documentos

Hierarquia de conflito (o de cima prevalece):

`NON_NEGOTIABLES` > `VISION` > `PRODUCT_PRINCIPLES` > `ARCHITECTURE_PRINCIPLES` > `ENGINEERING_PRINCIPLES` > `DATA_PRINCIPLES` > Roadmap > Audits

| Documento | Papel |
|-----------|--------|
| `NON_NEGOTIABLES.md` | Regras absolutas verificáveis; muitas sobre verdade de dados |
| `VISION.md` | Porque existimos e como decidir o futuro |
| `PRODUCT_PRINCIPLES.md` | Como o produto fala e prioriza |
| `ARCHITECTURE_PRINCIPLES.md` | Fronteiras estruturais (Current/Events/Aggregates, decisão vs publicação) |
| `ENGINEERING_PRINCIPLES.md` | Como construir e o que cede a quê |
| **Este ficheiro** | Doutrina estatística e de evidência |
| Roadmap / Audits | Sequência e diagnóstico; não alteram estas regras |

Em conflito entre conveniência e estas regras — a verdade observada vence. Se `NON_NEGOTIABLES` for mais estrito, prevalece `NON_NEGOTIABLES`.

# Glossário

| Termo | Definição |
|-------|-----------|
| **Observação** | Registo de um preço (e metadados associados) captado numa fonte real num instante concreto, sem inventar o valor a partir de outro instante ou de outro produto. |
| **Tick** | Evento pontual de preço: uma observação (ou tentativa tipada) num instante. É o nível de evento, não o agregado. |
| **Daily bar (barra diária)** | Agregado de um dia civil (ou janela diária definida pela política) construído **apenas** a partir de observações reais elegíveis desse dia. |
| **OfferCurrent (oferta atual)** | Estado mais recente conhecido de uma oferta (produto × loja/fonte), distinto do histórico de eventos e dos agregados. |
| **Histórico** | Sequência temporal de ticks e/ou barras atribuída a uma identidade de produto (e, quando aplicável, a uma oferta). Não é o snapshot atual. |
| **Heartbeat** | Sinal de “ainda visto / ainda monitorizado” que pode repetir ou confirmar presença sem constituir uma nova observação de variação de preço para fins estatísticos. Serve cobertura operacional, não amostra estatística. |
| **Carry-forward** | Valor de preço repetido de um instante anterior para um instante posterior **sem** nova observação real nesse instante posterior. |
| **Imputed (imputado)** | Qualquer valor de preço não proveniente de observação real no instante a que se refere (inclui carry-forward e qualquer preenchimento artificial). |
| **Null (ausência)** | Lacuna: não existe observação real para aquele produto/oferta naquele instante ou janela. Null é estado de conhecimento, não um preço. |
| **observed_at** | Instante em que o preço (ou o estado da oferta) foi efetivamente observado na fonte. |
| **sample_days** | Número de dias distintos com pelo menos uma observação real elegível na janela considerada. Conta dias com evidência, não dias de calendário vazios. |
| **span_days** | Extensão temporal entre a primeira e a última observação real elegível da amostra (em dias), independentemente de quantos dias intermédios têm dados. |
| **n_obs** | Contagem de observações reais elegíveis que entram num cálculo (barra, janela ou métrica). |
| **Cents (dinheiro)** | Quantidades monetárias em unidades inteiras mínimas da moeda (cents). Sem representação float em persistência de preços. |
| **Mínimo** | Menor preço entre observações reais elegíveis numa amostra com `sample_days` e `span_days` que cumprem os mínimos da política de produto. |
| **Máximo** | Maior preço entre observações reais elegíveis na mesma disciplina de amostra que os mínimos. |
| **Média** | Média aritmética de observações reais elegíveis (ou de barras diárias construídas só com essas observações), conforme a política da métrica. |
| **Mediana** | Percentil 50 das observações reais elegíveis (ou das barras elegíveis), conforme a política. |
| **Percentis** | Quantis da distribuição de preços reais elegíveis na amostra. |
| **Sazonalidade** | Padrão temporal (época, mês, ciclo) inferido **apenas** de histórico observado elegível com amostra e span adequados à afirmação. |
| **PVPR / preço de referência do merchant** | Preço de catálogo, “antes”, “recomendado” ou rótulo promocional fornecido pela loja — **não** é observação Limiar de preço praticado ao longo do tempo. |
| **Identidade de produtos** | Critério que determina quando duas ofertas referem o mesmo produto (ou a mesma variante) para fins de histórico e comparação. |
| **Dados insuficientes** | Estado em que a amostra elegível não cumpre os mínimos da política (`sample_days`, `span_days`, N, frescura, ou identidade) para sustentar a afirmação ou o veredicto pedido. |
| **ConsumerDecision** | Veredicto ao comprador — comprar agora (`BUY`), esperar (`WAIT`), ou não sabemos (`UNKNOWN`) — baseado só em histórico observado elegível, ofertas atuais e evidência de amostra, sob uma `policy_version`. |
| **Qualidade** | Aptidão dos dados para sustentar afirmações: elegibilidade, frescura (`observed_at`), completude da amostra, tipagem correta (real vs heartbeat vs imputado), e coerência monetária. |
| **Integridade** | Garantia de que o significado dos dados não é adulterado: tipagem preservada, nulls não mascarados, atual/eventos/agregados separados, dinheiro em cents, retenção com commit, e ausência de reescrita silenciosa do passado com o presente. |
| **Retenção** | Política de quanto tempo se guardam ticks (hot) e agregados, e como se reduz granularidade sem fabricar factos. |

# Histórico

| Data | Alteração |
|------|-----------|
| 2026-08-03 | Reorganização na estrutura mandatória de doutrina. Conteúdo e MUST/MUST NOT preservados; sem novas decisões. |
