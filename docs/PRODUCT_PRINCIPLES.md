# PRODUCT_PRINCIPLES.md — Lymiar

# Objetivo

Orientar linguagem, prioridades e julgamento de produto. Não descreve ecrãs. Define a filosofia operacional do Lymiar.

# Âmbito

## O que cobre

- Como pensar o produto (assistente de compra, não dashboard).
- Pergunta central e hierarquia de informação.
- Tom, evidência, limites e honestidade de preço.
- Cupões, histórico, marca, crescimento e teste de features.
- Regras operacionais MUST / MUST NOT derivadas destes princípios.

## O que não cobre

- Regras absolutas testáveis de engenharia e dados (ver `NON_NEGOTIABLES.md`).
- Missão, visão 2030 e valores fundadores (ver `VISION.md`).
- Mockups de ecrã ou especificação visual.

# Princípios

1. **Assistente de compra, não dashboard.** O produto existe para ajudar a decidir. Métricas internas são meios, não o espetáculo. *Porquê:* o utilizador quer comprar bem, não estudar o modelo interno.

2. **Uma pergunta manda em tudo.** Tudo se organiza em torno de: comprar agora, esperar, ou ainda não sabemos? *Porquê:* sem pergunta central, o Lymiar vira mais um comparador de preços.

3. **Clareza antes de completude.** É melhor uma resposta curta e certa do que cinco scores “completos”. *Porquê:* excesso de números reduz confiança e aumenta dúvida.

4. **Falar como pessoa, não como sistema.** Linguagem simples, portuguesa, sem jargão de feeds, bots ou scores internos. *Porquê:* confiança nasce de compreensão, não de vocabulário técnico.

5. **Tom calmo e firme.** Nem hype de “super oportunidade”, nem burocracia de “parecer técnico”. Direto e sereno. *Porquê:* decisões de dinheiro pedem sobriedade; o exagero soa a anúncio.

6. **Confiança pela evidência, não pela afirmação.** Mostrar o que vimos (quanto tempo, quantas lojas, quão recente). Não pedir fé. *Porquê:* claims absolutos destroem credibilidade quando a cobertura é limitada.

7. **Admitir o que não sabemos.** Dados insuficientes → dizê-lo cedo. Não inventar certeza. *Porquê:* evita decisões falsas e cumpre a promessa de honestidade.

8. **Preço é sempre contextual no tempo.** Nunca apresentar um preço como “bom” só porque existe um risco ou um PVPR. *Porquê:* o problema que resolvemos é temporal, não só espacial (onde está mais barato).

9. **Separar preço observado de marketing da loja.** PVPR, “antes/depois” e rótulos do merchant não são histórico Lymiar. *Porquê:* protege o utilizador de falsos descontos e mantém o Lymiar coerente com os dados.

10. **Comunicar preços com honestidade de total.** Quando houver portes, preferir o custo relevante para a decisão. Quando não houver, não fingir. *Porquê:* “mais barato” sem portes pode ser mentira prática.

11. **Cupões são ajuda, não milagre.** Cupão ≠ preço já aplicado, salvo cálculo explícito e verificável. Condições e validade vêm primeiro. *Porquê:* expectativas claras evitam falha na caixa.

12. **Histórico serve a decisão, não o gráfico.** O gráfico existe para sustentar o veredicto. Se não sustenta, omitir ou simplificar. *Porquê:* histórico sem conclusão é ruído; conclusão sem histórico é dogma.

13. **Limitações à vista.** Cobertura parcial, lojas em falta, dados atrasados: dizer. Não tapar com marketing. *Porquê:* o utilizador perdoa limites; não perdoa ter sido enganado.

14. **Prioridade de informação.** (1) Veredicto; (2) razão em uma frase; (3) onde comprar e por quanto; (4) quão recentes e quantos dados; (5) detalhe (gráfico, sazonalidade, variantes). *Porquê:* a compra acontece na cabeça nesta ordem; a UI deve segui-la.

15. **Menos secções, mais hierarquia.** Se duas secções dizem a mesma coisa, fundir. Se uma secção não muda a decisão, cortar. *Porquê:* cada bloco extra compete com a decisão principal.

16. **Nunca fingir produto.** Se não está pronto, não aparece. “Em breve” não é estratégia de confiança. *Porquê:* formulários e canais vazios ensinam o utilizador a não acreditar.

17. **Conselho ao comprador ≠ promoção do canal.** O que é bom para publicar no Telegram não define o que é bom comprar. *Porquê:* misturar os dois é publicidade disfarçada de conselho.

18. **Diferenciação no tempo, não no catálogo.** Não tentar ser o maior comparador. Ser o mais claro em quando comprar. *Porquê:* outros ganham em cobertura; o Lymiar compete em julgamento temporal e em admitir o desconhecido.

19. **“Está caro” tem o mesmo valor que “está barato”.** Evitar arrependimento é tão útil como encontrar saldos. *Porquê:* o Lymiar vive de decisões, não só de promoções.

20. **Consistência de marca e de verdade.** A mesma evidência produz a mesma leitura. A mesma marca em todos os sítios. Sem contradições entre home, produto e alertas. *Porquê:* inconsistência parece erro; consistência permite confiança repetida.

21. **Crescimento sem diluir o critério.** Novas categorias só com a mesma honestidade de decisão — não com mais logos. *Porquê:* escala sem critério transforma o Lymiar noutro sítio de preços.

22. **Teste de qualquer ideia de produto.** Antes de aceitar uma feature: melhora comprar/esperar/não sabemos? É honesta com os dados? Serve o comprador antes do afiliado ou do ego? Continua simples daqui a dez anos? Se falhar — rejeitar. *Porquê:* princípios sem disciplina de decisão não se aplicam.

# Regras

## MUST

1. Organizar copy e UI em torno de comprar / esperar / não sabemos.
2. Mostrar evidência (tempo, amostra, recência) junto ao veredicto.
3. Usar linguagem simples em português; jargão interno fica fora da UI.
4. Manter tom calmo e direto.
5. Declarar limitações de cobertura, lojas em falta ou atraso quando existirem.
6. Seguir a ordem de prioridade: veredicto → razão → onde comprar → evidência → detalhe.
7. Tratar cupões com condições e validade antes de qualquer benefício implícito.
8. Preferir custo total relevante (incl. portes) quando os dados existirem.
9. Aplicar o teste do princípio 22 a qualquer feature nova.
10. Manter a mesma leitura da mesma evidência em web, API e alertas.

## MUST NOT

1. Não apresentar o produto como dashboard de métricas internas.
2. Não chamar preço de “bom” só por PVPR, risco ou rótulo de merchant.
3. Não tratar PVPR / “antes-depois” do merchant como histórico Lymiar.
4. Não fingir portes ou preço com cupão já aplicado sem cálculo verificável.
5. Não inventar certeza quando os dados são insuficientes.
6. Não esconder limitações com marketing.
7. Não deixar o critério editorial/Telegram definir o conselho de compra.
8. Não mostrar funcionalidades incompletas ou “em breve” como produto pronto.
9. Não acrescentar secções que não mudam a decisão.
10. Não crescer categorias se isso diluir a honestidade do critério de decisão.
11. Não violar `NON_NEGOTIABLES.md` em nome destes princípios.

# Exemplos

## Corretos (copy / UX)

- “Ainda não temos dados suficientes para dizer se o preço é bom no tempo.”
- “Comprar agora: o preço está abaixo do intervalo que observámos; amostra: N dias.”
- “Preço da loja: X €. Portes: não disponíveis — total pode ser superior.”
- “Cupão YYY: −10% acima de 50 €; válido até DD/MM. Não está aplicado ao preço mostrado.”
- Uma razão curta sob o veredicto; lojas a seguir; gráfico só se sustentar a decisão.

## Incorretos (copy / UX)

- “Super oportunidade! Desconto incrível face ao PVPR!”
- Cinco scores sem veredicto claro.
- “Histórico completo de qualquer produto.”
- Gráfico em destaque sem conclusão comprar/esperar/não sabemos.
- “Em breve: alertas por email” como bloco principal.
- Ordenar ou justificar compra com lógica de publicação do canal.

# Anti-padrões

- Dashboard de métricas internas como experiência principal.
- Hype promocional ou tom de anúncio.
- Completude falsa (muitos números, pouca decisão).
- Misturar marketing da loja com histórico Lymiar.
- Esconder UNKNOWN ou limitações.
- Feature que aumenta catálogo ou ruído sem melhorar a resposta temporal.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `NON_NEGOTIABLES.md` | Hierarquia superior. Em conflito, prevalece. |
| `VISION.md` | Hierarquia superior a este. Missão, promessa e valores; este documento aplica-os ao dia-a-dia de produto. |

Hierarquia em conflito: `NON_NEGOTIABLES` > `VISION` > `PRODUCT_PRINCIPLES` > outros.

# Glossário

| Termo | Significado |
|-------|-------------|
| Assistente de compra | Produto orientado à decisão do utilizador, não à exibição de métricas. |
| Veredicto | Comprar agora, esperar, ou ainda não sabemos. |
| Evidência | O que foi observado: duração, amostra, recência, lojas. |
| PVPR | Preço de marketing do merchant; não é histórico Lymiar. |
| Custo total | Preço relevante para decidir, incluindo portes quando conhecidos. |
| Critério | Honestidade de decisão aplicada de forma igual em crescimento e categorias. |

# Histórico

| Data | Alteração |
|------|-----------|
| 2026-08-03 | Reescrito na estrutura obrigatória. 22 princípios preservados; “porquê” integrado em Princípios; Regras operacionais MUST/MUST NOT derivadas; exemplos de copy/UX (não mockups). |
