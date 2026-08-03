# PRODUCT_VISION_2030

# Objetivo

Definir a direção de produto Limiar até 2030, pelo olhar do comprador: o que preservar, o que priorizar e o que não fazer. Domínio de produto — sem recomendações técnicas.

# Âmbito

Produto, linguagem, jornadas e valor para o utilizador.

Perspetiva: comprador em Portugal (não engenheiro).

Fora de âmbito: stacks, bases de dados, arquitetura, roadmap de engenharia (`ROADMAP_V2`).

# Princípios

1. **Uma decisão clara** — Comprar / Esperar / Ainda não sabemos.
2. **Uma razão em linguagem corrente** — no máximo 2 frases, sem jargão.
3. **Onde comprar a seguir** — lojas e custo final logo abaixo da decisão.
4. **Honestidade sobre a certeza** — poucos dados → dizê-lo; não inventar veredicto.
5. **Nunca fingir funcionalidades** — botão ou formulário só se a ação completar ponta a ponta.
6. **Não competir em catálogo total** — competir em clareza da decisão (comprar vs esperar).
7. **Português simples** — zero “parecer técnico”, “score interno”, “bot”, nomes de rede afiliada, “mock”, “EAN” na UI principal.

**Promessa (10 segundos):**

> Diz-me se vale a pena comprar isto agora — e onde fica mais barato de verdade.

Tudo o que não sirva esta frase é ruído.

# Regras

## O que preservar

| Capacidade | Motivo factual |
|------------|----------------|
| Pergunta “Vale a pena comprar?” | É o eixo do produto; diferencia vs “só preço de hoje” |
| Mostrar produtos caros (“esperar”), não só promoções | Raro nos comparadores PT; evita arrependimento |
| Distinção cupão vs preço observado | Evita descontos inventados |
| Comparação multi-loja na página de produto | Função base de um comparador |
| Telegram como canal rápido de oportunidades | Útil para quem segue promoções |
| Pesquisa + oportunidades do dia | Entrada clara na homepage |

## Prioridades por impacto no utilizador

Impacto = quanto melhora a decisão de compra já — não quanto “parece avançado”.

### Crítico — confiança e caminho até à compra

1. **Alertas honestos** — Ou o alerta funciona ponta a ponta (Telegram primeiro), ou o formulário sai e fica só CTA para Telegram (`/alertar`). Sem meio-termo. Sem “alerta preparado… a ligar ao backend” sem persistência.
2. **Um veredicto, uma razão, uma certeza** — Veredicto grande (Comprar agora · Preço razoável · Esperar · Dados insuficientes); uma frase de razão; certeza discreta (“Baseado em 4 meses / 3 lojas”). Remover da vista principal: Deal Score, “parecer técnico”, “score interno”, cartões que competem com o veredicto.
3. **Lojas antes dos gráficos** — Ordem: nome + imagem + preço mais baixo → veredicto → onde comprar (lojas, stock, CTA) → gráfico simples → detalhes opcionais atrás de “Ver mais”.
4. **Preço total quando possível** — Preço + portes quando existirem; ordenar por total estimado; se portes desconhecidos, rótulo “sem portes” — não fingir melhor deal absoluto.
5. **Copy sem overclaim** — Sem “encontra qualquer produto”, “histórico completo” genérico, “apenas oportunidades reais” sem condição, ataques a concorrentes sem factos. Claims com prova por produto (“Histórico desde…”). “Última actualização” = última observação deste produto, não o reload da página.

### Alto — clareza da jornada

6. **Homepage curta** — Primeiro ecrã: marca + pergunta + pesquisa; 3–6 melhores oportunidades (um conceito); CTA Telegram opcional. Abaixo: produtos a evitar/esperar, quedas, cupões. Fundir ou remover: “Como funciona” longo, “Porque confiar” agressivo, logos de lojas sem valor, Email/WhatsApp “em breve”, secções “Melhores / Últimas / Super / Histórico do Bot” sobrepostas.
7. **Linguagem humana** — Preferir: “A nossa leitura”, “Promoções recentes no Telegram”, “Campanha da loja”, “Ainda não temos histórico suficiente”, “Quão bom está o preço”. Evitar jargão interno na UI.
8. **Pesquisa como caminho principal** — Explorar = categorias humanas (Telemóveis, Portáteis, Gaming, Casa…). Filtros técnicos só dentro de categorias onde fazem sentido, não na homepage genérica.
9. **Cupões com caminho completo** — Secção acessível; cartão → página do cupão → produtos elegíveis → preço estimado com cupão só se calculável; senão “aplica o código na loja”. No produto: código + copiar + ir à loja, ou silêncio.

### Médio — diferenciação sustentável

10. **“Dados insuficientes” como resposta de produto** — Quando o histórico é curto: “Ainda vimos pouco deste produto. Não vamos inventar se está barato.”
11. **“Está caro” com o mesmo peso que “está barato”** — Feed “Melhor não comprar hoje”: procura alta e preço acima do habitual.
12. **Sazonalidade só com evidência** — Ex.: “Em anos anteriores, o preço mais baixo costumou aparecer em novembro.” Sem base → omitir a secção.
13. **Variantes por valor** — Ex.: €/GB entre capacidades, quando útil.
14. **Telegram com marca Limiar coerente** — Nome, tom e CTAs alinhados (“Alertas Limiar”); papéis claros: alertas pessoais vs oportunidades públicas.

### Futuro — paridade sem inventar features

| # | Funcionalidade | Nota |
|---|----------------|------|
| 15 | Lista de desejos / seguir produtos | Depois de alertas reais |
| 16 | Gerir alertas (editar preço, pausar, apagar) | Sem isto, alertas degradam |
| 17 | Frescor da oferta (“visto há 2 h”) | Confiança no “melhor preço” |
| 18 | Histórico por loja (linhas) | Comparar lojas ao longo do tempo |
| 19 | Pesquisa por link da loja / código de barras | Atalho em telemóvel |
| 20 | Partilhar oferta (WhatsApp) | Distribuição |
| 21 | Email | Só depois de Telegram sólido |
| 22 | Mais categorias Casa / Telemóveis | Mesma honestidade de dados |
| 23 | Extensão / overlay na loja | Só depois do core estável |
| 24 | Reviews de loja/produto | Só com fonte real; senão não |

**Não priorizar:** WhatsApp “em breve” vazio; slogans contra concorrentes; mais scores; páginas órfãs com mensagens técnicas.

## Páginas e blocos a eliminar ou fundir

| Elemento | Destino |
|----------|---------|
| Como funciona (secção longa) | Fundir em 3 passos mínimos ou tooltip |
| Porque confiar (ataque a “outros”) | Remover; prova por produto |
| Lojas monitorizadas (só logos) | Remover ou “X produtos nesta loja” |
| Email / WhatsApp em breve | Remover até existir |
| Histórico de Alertas do Bot | Renomear / mover para Telegram |
| Dicas Limiar redundantes | Fundir no veredicto |
| Confiança dos Dados (cartão grande) | Reduzir a uma linha sob o veredicto |
| Sazonalidade vazia | Esconder se sem dados |
| Deal Score + Índice + Confiança juntos | Um veredicto |
| `/p` sem produto | Redirect para pesquisa |
| 404 com “dados mock” | Mensagem humana |

## Funcionalidades em falta (vista utilizador)

1. Alertas que funcionam e se gerem.
2. Custo total (preço + portes).
3. Veredicto único e linguagem simples.
4. Lojas logo a seguir à decisão.
5. Frescor (“quando vimos este preço”).
6. Lista de desejos.
7. Cupões com caminho até à poupança.
8. “Não sabemos ainda” honesto.
9. Feed “está caro — espera”.
10. Cobertura compreensível (“3 de 5 lojas que seguimos”).
11. Partilha fácil.
12. Marca única Limiar no Telegram.

## Diferenciação (factual)

| Capacidade | Distinção típica vs comparadores PT |
|------------|-------------------------------------|
| Comprar vs Esperar como produto central | Outros otimizam “onde está mais barato agora” |
| Feed “está caro — não compres” | Quase inexistente como feed |
| Dados insuficientes como resposta explícita | Outros tendem a forçar confiança |
| Explicação em 1 frase ligada a histórico observado | Poucos traduzem o gráfico |
| Cupão separado do preço (sem inventar desconto) | Evita PVPR como “mínimo” |
| Telegram editorial + decisão web | Dois ritmos: oportunidades vs deliberação |
| Variantes por valor (tech) | Nicho útil se bem executado |

**Posicionamento 2030:** o Limiar não compete por ser o maior comparador em Portugal; compete por impedir compras no momento errado, com resposta clara e honesta.

## Ordem de execução (só produto)

| Ordem | Tema | Impacto |
|------:|------|---------|
| 1 | Alertas honestos (funcionam ou saem) | Crítico |
| 2 | Um veredicto + uma razão | Crítico |
| 3 | Lojas logo após a decisão | Crítico |
| 4 | Copy sem overclaim / sem ataque sem factos | Crítico |
| 5 | Homepage enxuta | Alto |
| 6 | Linguagem humana | Alto |
| 7 | Cupões com caminho completo | Alto |
| 8 | “Dados insuficientes” + “Está caro” | Diferenciação |
| 9 | Frescor + total com portes | Alto |
| 10 | Watchlist + gestão de alertas | Alto (depois do 1) |
| 11 | Sazonalidade só com base | Médio |
| 12 | Marca Telegram Limiar | Médio |
| 13 | Categorias Casa/Telemóveis com a mesma regra de honestidade | Crescimento |
| 14 | Partilha / scanner / extensão | Futuro |

## Três perguntas (ordem fixa)

Cada ecrã deve responder, nesta ordem:

1. **Compro ou espero?**
2. **Onde e por quanto (com portes quando conhecidos)?**
3. **Quão seguros estamos desta resposta?**

Tudo o resto é acessório.

# Exemplos

**Jornada ideal 2030**

1. Procura “AirPods” ou cola um link.
2. Vê resultados com selo: Bom preço / Normal / Caro / Poucos dados.
3. Abre um produto.
4. Lê: “Espera — normalmente baixa ~15% em novembro (vimos 8 meses).”
5. Em baixo: 3 lojas, total com portes, “visto há 3 h”.
6. Guarda alerta a 89 € no Telegram em poucos toques.
7. Quando baixa, recebe mensagem clara — sem jargão.

Zero scores a competir no ecrã. Zero “em breve”. Zero nomes de rede afiliada na UI.

**Copy preferida**

| Evitar | Preferir |
|--------|----------|
| Parecer técnico Limiar | A nossa leitura |
| Score interno | (não mostrar) |
| Histórico de Alertas do Bot | Promoções recentes no Telegram |
| Campanha Awin activa | Campanha da loja / desconto automático |
| série temporal indisponível | Ainda não temos histórico suficiente |
| dados mock / slug / EAN (UI) | produto / código de barras (só se útil) |
| Confiança (quando é Deal Score) | Quão bom está o preço |

# Anti-padrões

- Adicionar mais métricas “profissionais” na vista principal.
- Prometer cobertura universal.
- Copiar concorrentes feature a feature.
- Mostrar WhatsApp/Email vazios para parecer completo.
- Formulários que recolhem contacto sem entregar o alerta.
- Explicar o modelo estatístico ao comprador.
- Vários veredictos/scores na mesma página.
- Sazonalidade ou “mínimo histórico” sem amostra suficiente.
- Cupão apresentado como preço já aplicado sem cálculo verificável.
- Atacar concorrentes com slogans em vez de factos verificáveis.

## Estado a corrigir (não norma; dívida de produto)

| Estado observado | Correção alinhada a este documento |
|------------------|------------------------------------|
| Formulário de alerta com sucesso aparente sem backend | Alertas honestos (regra 1) |
| Vários scores/índices na mesma página | Um veredicto (regra 2) |
| Lojas no fundo da página | Ordem veredicto → lojas → gráfico (regra 3) |
| Homepage longa com secções sobrepostas | Homepage curta (regra 6) |
| Jargão interno e “em breve” na UI | Linguagem humana + sem features fingidas |
| Canal Telegram com nome legado vs marca Limiar | Coerência de marca (regra 14) |

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `VISION` | Promessa e valores; este doc detalha produto até 2030 |
| `PRODUCT_PRINCIPLES` | Regras operacionais de produto no dia a dia |
| `NON_NEGOTIABLES` | Limites absolutos (alertas, UNKNOWN, um veredicto, copy) |
| `QUALITY_BAR` | Gate de merge para mudanças user-facing |
| `ROADMAP_V2` | Como a engenharia implementa; não redefine produto |
| `GOVERNANCE` | Hierarquia e processo de alteração |

# Glossário

| Termo | Significado |
|-------|-------------|
| Veredicto | Comprar / Esperar / Dados insuficientes (e variantes de rótulo equivalentes) |
| Evidência | Amostra observada (dias, lojas, span) que sustenta o veredicto |
| Preço observado | Preço visto na oferta; distinto de cupão ou PVPR |
| Cupão | Código ou condição de desconto; não é preço já aplicado salvo cálculo explícito |
| Alerta pessoal | Notificação ao utilizador; ≠ publicação do canal editorial |
| Overclaim | Afirmação absoluta sem condição observável |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Reescrito na estrutura oficial. Removida linguagem emocional; “diferenciação emocional” → eixo factual do produto. Queixas de estado atual movidas para Anti-padrões / estado a corrigir. Sem tech. Sem “líder”. |
