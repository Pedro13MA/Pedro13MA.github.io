# NON_NEGOTIABLES.md — Lymiar

# Objetivo

Fixar regras absolutas do Lymiar. Quebrar qualquer uma é defeito. Cada regra deve ter teste automatizado ou checklist de release verificável.

# Âmbito

## O que cobre

- Verdade dos dados e estatísticas de preço.
- Ética de conselho ao comprador e claims.
- UX mínima da página de produto.
- Afiliados e disclosure.
- ConsumerDecision e PublishScore.
- Histórico, alertas, segurança, privacidade.
- Arquitetura, SEO, desempenho e consistência.
- Obrigatoriedade de teste ou check de release por regra P0.

## O que não cobre

- Visão de longo prazo e valores (ver `VISION.md`).
- Filosofia de copy e prioridades de produto além do que estas regras exigem (ver `PRODUCT_PRINCIPLES.md`).
- Valores numéricos concretos de N, SLA ou mínimos — ficam em config de produto, desde que a regra seja cumprida.

# Princípios

1. Quebrar qualquer regra deste documento é defeito.
2. Cada regra deve ser testável: teste automatizado ou checklist de release verificável.
3. Em conflito com qualquer outro documento, este prevalece.
4. Dados insuficientes não se inventam; UNKNOWN é resposta válida.
5. Conselho ao comprador é cego a receita e a interesses de canal.

# Regras

## Verdade dos dados

1. É proibido substituir valor histórico em falta pelo preço atual.
2. É proibido marcar mínimo histórico com menos de N observações reais e span mínimo definido em config de produto.
3. Heartbeats não entram em medianas, médias nem percentis.
4. Carry-forward / valores imputados não entram em estatísticas; se existirem, `is_imputed=true` e `n_obs=0`.
5. Toda métrica de preço exposta declara `sample_days` e `span_days`, ou não é exposta.
6. PVPR / preço original do merchant sozinho nunca justifica “mínimo histórico”.
7. Timestamps de observação são obrigatórios em toda oferta “atual” exposta.

## Ética

8. ConsumerDecision é cego a comissão, EPC e caps editoriais.
9. É proibido apresentar interesse de afiliado como conselho de compra.
10. Claims absolutos (“qualquer produto”, “histórico completo”, “apenas reais”) são proibidos sem condição observável.
11. Comparações a concorrentes só com factos verificáveis; senão são omitidas.
12. UNKNOWN é veredito de primeira classe; é proibido forçar BUY/WAIT sem amostra.

## UX

13. A página de produto mostra no máximo um veredicto de compra ao utilizador.
14. Esse veredicto aparece antes da lista de lojas.
15. A lista de lojas aparece antes de gráficos e análise avançada.
16. Jargão interno é proibido na UI: Awin, Bot, mock, score interno, parecer técnico, EAN (exceto fluxo explícito de código de barras).
17. Botões e formulários só existem se a ação completar de ponta a ponta.
18. Estados “em breve” não ocupam UI principal.

## Afiliados

19. Disclosure de comissão afiliada é obrigatório junto ao CTA de loja ou no rodapé visível.
20. Ordenação de lojas na decisão de compra é por preço total disponível e stock — nunca por comissão.
21. URLs de tracking de rede não são o texto principal do link mostrado ao utilizador.

## ConsumerDecision

22. ConsumerDecision só usa histórico observado, ofertas atuais e evidência de amostra.
23. ConsumerDecision nunca importa tópicos Telegram, quiet hours, diversity caps ou revenue mix.
24. Saída obrigatória: `BUY` | `WAIT` | `UNKNOWN` + `evidence` + `policy_version`.
25. Sem `evidence.sample_days` ≥ mínimo → saída = `UNKNOWN`.

## PublishScore

26. PublishScore nunca é etiquetado na UI como confiança, índice de compra ou “vale a pena”.
27. PublishScore pode usar receita, pacing e canal; ConsumerDecision não.
28. Falha de routing de canal não altera ConsumerDecision.

## Histórico

29. Estado atual, eventos (ticks) e agregados (barras) são conceitos separados.
30. Agregados diários sem observações reais não são materializados como factos.
31. Retenção de ticks hot tem prazo máximo configurado; prune sem `commit` é falha.
32. Dinheiro persiste em unidades inteiras (cents); float monetário em storage é proibido em código novo.

## Alertas

33. É proibido mostrar sucesso de alerta sem registo persistido.
34. É proibido recolher contacto (email/Telegram) sem criar o alerta.
35. Todo alerta criado é listável e cancelável pelo utilizador no mesmo canal.
36. Alertas pessoais ≠ publicações do canal editorial.

## Segurança

37. Segredos nunca estão no Git.
38. Tokens nunca aparecem em logs.
39. Admin fail-closed: sem lista de admins configurada, zero privilégios admin.
40. Escrita em handlers GET é proibida.
41. Dependências de produção têm versão fixada no release.

## Privacidade

42. Contactos só com finalidade de alerta ou conta; sem essa finalidade, não recolher.
43. Privacy policy descreve o que o produto faz de facto.
44. IDs de utilizador em logs só no mínimo necessário e nunca com tokens.

## Arquitetura

45. Alterações em produção mantêm o Lymiar utilizável (sem big-bang obrigatório).
46. APIs públicas existentes não partem campos sem versão nova.
47. Feature flags de comportamento de decisão/dados têm rollback documentado.
48. Um único writer lógico na base de dados de catálogo/histórico hot, salvo migração explícita.

## SEO

49. 404 e páginas vazias não mencionam mock, slug interno ou stack.
50. Sitemap só inclui URLs de produto que resolvem com conteúdo real.
51. Título de produto indexável não afirma mínimo histórico sem cumprir regras 2 e 5.

## Desempenho

52. Página de produto não requer mais de um pedido agregado para o conteúdo principal (flag on).
53. Respostas GET públicas de produto/search declaram política de cache ou `no-store` explícito justificado.
54. Heartbeat universal diário em todo o catálogo é proibido; heartbeat só em conjuntos definidos (watch/hot/alerta).

## Consistência

55. Os mesmos inputs de evidência produzem o mesmo ConsumerDecision para a mesma `policy_version`.
56. Web e API não contradizem o veredicto ConsumerDecision quando a flag está ativa.
57. Nomes de marca (Lymiar) são únicos na UI e canais oficiais; nomes legado não aparecem como marca principal.
58. Testes da suite obrigatória passam antes de merge a `main`.
59. Health de readiness falha se o último feed com sucesso exceder o SLA configurado.
60. Cada P0 de NON_NEGOTIABLES tem teste ou check de release nomeado em CI/docs.

# Exemplos

## Corretos

- Sem `sample_days` ≥ mínimo → `UNKNOWN` com `evidence` e `policy_version`.
- Lojas ordenadas por preço total e stock; disclosure de afiliado visível.
- Métrica de preço com `sample_days` e `span_days` declarados.
- Alerta só marcado como criado depois de persistido; listável e cancelável no mesmo canal.

## Incorretos

- Preencher buraco de histórico com o preço atual.
- Chamar “mínimo histórico” com PVPR ou com poucas observações.
- Mostrar PublishScore como “vale a pena comprar”.
- Forçar BUY porque o canal precisa de conteúdo.
- Formulário “em breve” na UI principal.

# Anti-padrões

- Inventar certeza ou preços para evitar UNKNOWN.
- Misturar ConsumerDecision com receita, EPC ou caps editoriais.
- UI com jargão interno (Awin, Bot, mock, score).
- Segredos no Git ou tokens em logs.
- Sitemap com URLs que não resolvem conteúdo real.
- Heartbeat diário em todo o catálogo.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `VISION.md` | Hierarquia inferior. Este documento prevalece em conflito. |
| `PRODUCT_PRINCIPLES.md` | Hierarquia inferior. Princípios de produto não podem violar estas regras. |

Hierarquia em conflito: `NON_NEGOTIABLES` > `VISION` > `PRODUCT_PRINCIPLES` > outros.

# Glossário

| Termo | Significado |
|-------|-------------|
| ConsumerDecision | Veredicto de compra (`BUY` \| `WAIT` \| `UNKNOWN`) baseado só em evidência observada. |
| PublishScore | Pontuação de publicação/canal; pode usar receita e pacing; não é conselho de compra. |
| Heartbeat | Sinal de presença sem observação de preço real; não entra em estatísticas. |
| Carry-forward / imputado | Valor preenchido sem observação real; `is_imputed=true`, `n_obs=0`. |
| `sample_days` / `span_days` | Metadados obrigatórios de cobertura temporal de uma métrica de preço. |
| PVPR | Preço declarado pelo merchant; sozinho não justifica mínimo histórico. |
| UNKNOWN | Veredicto de primeira classe quando a amostra é insuficiente. |
| P0 | Regra deste documento com teste ou check de release nomeado. |

# Histórico

| Data | Alteração |
|------|-----------|
| 2026-08-03 | Reescrito na estrutura obrigatória. Regras 1–60 preservadas por tema. Afirmação explícita: quebrar qualquer regra é defeito; cada regra deve ser testável. |
